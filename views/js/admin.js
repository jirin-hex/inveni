
(function () {
    const $ = s => document.querySelector(s);

    const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[c]));

    const toast = (m, type = '') => {
        const r = $('#toast-region');
        if (!r) return;

        const n = document.createElement('div');
        n.className = `toast ${type}`;
        n.textContent = m;
        r.append(n);

        setTimeout(() => n.remove(), 3500);
    };

    const statusPill = s =>
        `<span class="status-pill ${esc(s)}">${esc(s || 'unknown')}</span>`;

    const getId = r => r._id || r.id;

    async function safe(p) {
        try {
            return await p;
        } catch (e) {
            toast(e.message || 'Something went wrong', 'error');
            throw e;
        }
    }

    // LOGOUT
    function logout() {
        const button = $('#logout-link');

        if (!button) return;

        button.addEventListener('click', async () => {
            button.disabled = true;
            button.textContent = 'Logging out...';

            try {
                const response = await fetch('/api/auth/logout', {
                    method: 'POST',
                    credentials: 'include'
                });

                if (!response.ok) {
                    throw new Error('Logout failed. Please try again.');
                }

                window.location.href = '/login.html';

            } catch (error) {
                toast(error.message, 'error');
                button.disabled = false;
                button.textContent = '↪ Log out';
            }
        });
    }

    async function updateNavCount() {
        try {
            const d = await InveniAPI.getAdminResources('pending');
            const count = Array.isArray(d.resources) ? d.resources.length : 0;
            const n = $('#pending-nav-count');

            if (n) n.textContent = count || '';
        } catch { }
    }

    function countUp(el, value) {
        const target = Number(value) || 0;
        const start = performance.now();
        const duration = 700;

        function tick(now) {
            const p = Math.min(1, (now - start) / duration);

            el.textContent = Math.round(
                target * (1 - Math.pow(1 - p, 3))
            ).toLocaleString();

            if (p < 1) requestAnimationFrame(tick);
        }

        requestAnimationFrame(tick);
    }

    async function dashboard() {
        const stats = await safe(InveniAPI.getAdminStats());

        Object.entries(stats).forEach(([k, v]) => {
            const el = $(`[data-stat="${k}"]`);
            if (el) countUp(el, v);
        });

        const box = $('#recent-pending');

        try {
            const d = await InveniAPI.getAdminResources('pending');
            const items = (d.resources || []).slice(0, 5);

            box.innerHTML = items.length
                ? items.map(r => `
                    <a class="compact-item" href="resource.html?id=${encodeURIComponent(getId(r))}">
                        <span>
                            <strong>${esc(r.title)}</strong>
                            <small>${esc(r.creator)} · ${esc(r.field)} · ${esc(r.country)}</small>
                        </span>
                        ${statusPill(r.status)}
                    </a>
                `).join('')
                : '<div class="admin-empty"><strong>All caught up.</strong>No pending recommendations right now.</div>';

        } catch (e) {
            box.innerHTML = `<div class="admin-empty">${esc(e.message)}</div>`;
        }
    }

    let cached = [];

    function renderResources() {
        const q = ($('#admin-search')?.value || '').toLowerCase().trim();
        const status = $('#admin-status')?.value || 'all';

        const items = cached.filter(r =>
            (status === 'all' || r.status === status) &&
            (!q || [r.title, r.creator, r.field, r.country, r.type]
                .some(v => String(v || '').toLowerCase().includes(q)))
        );

        const box = $('#admin-resource-list');

        $('#admin-resource-count').textContent =
            `${items.length} ${items.length === 1 ? 'resource' : 'resources'}`;

        box.innerHTML = items.length
            ? items.map(r => `
                <a class="admin-resource" href="resource.html?id=${encodeURIComponent(getId(r))}">
                    <span>
                        <strong>${esc(r.title)}</strong>
                        <small>${esc(r.type)} · ${esc(r.creator)} · ${esc(r.country)}</small>
                    </span>
                    <span>${statusPill(r.status)}</span>
                    <span class="admin-resource-field">${esc(r.field)}</span>
                    <span class="row-arrow">↗</span>
                </a>
            `).join('')
            : '<div class="admin-empty"><strong>No resources match.</strong>Try changing your search or status filter.</div>';
    }

    async function resources() {
        const box = $('#admin-resource-list');

        try {
            const d = await safe(InveniAPI.getAdminResources());
            cached = d.resources || [];

            renderResources();

            $('#admin-search').addEventListener('input', renderResources);
            $('#admin-status').addEventListener('change', renderResources);

        } catch (e) {
            box.innerHTML = `<div class="admin-empty">${esc(e.message)}</div>`;
        }
    }

    async function pending() {
        const box = $('#pending-list');

        try {
            const d = await safe(InveniAPI.getAdminResources('pending'));
            const items = d.resources || [];

            box.innerHTML = items.length
                ? items.map((r, i) => `
                    <article class="pending-card" style="animation-delay:${i * 45}ms">
                        <div>
                            <div class="pending-meta">
                                <span class="tag">${esc(r.type)}</span>
                                <span>${esc(r.field)}</span>
                                <span>${esc(r.country)}</span>
                            </div>

                            <h3>${esc(r.title)}</h3>
                            <p>${esc(r.recommendation || r.description || 'No recommendation text provided.')}</p>

                            <div class="pending-meta" style="margin-top:8px">
                                <span>By ${esc(r.submittedBy || r.creator || 'Contributor')}</span>
                                <span>${esc(r.length || 'Length not specified')}</span>
                            </div>
                        </div>

                        <div class="pending-actions">
                            <a class="mini-button" href="resource.html?id=${encodeURIComponent(getId(r))}">Details ↗</a>
                            <button class="mini-button approve" data-action="approve" data-id="${esc(getId(r))}">Approve</button>
                            <button class="mini-button reject" data-action="reject" data-id="${esc(getId(r))}">Reject</button>
                        </div>
                    </article>
                `).join('')
                : '<div class="admin-empty"><strong>The queue is clear.</strong>There are no pending recommendations to review.</div>';

            box.addEventListener('click', handleStatus);

        } catch (e) {
            box.innerHTML = `<div class="admin-empty">${esc(e.message)}</div>`;
        }
    }

    async function handleStatus(e) {
        const b = e.target.closest('button[data-action]');
        if (!b) return;

        const id = b.dataset.id;
        const status = b.dataset.action === 'approve' ? 'approved' : 'rejected';

        if (!confirm(`${status === 'approved' ? 'Approve' : 'Reject'} this recommendation?`)) return;

        b.disabled = true;

        try {
            await InveniAPI.updateResourceStatus(id, status);

            toast(`Resource ${status}.`);
            b.closest('.pending-card').remove();

            updateNavCount();

            if (!$('#pending-list').querySelector('.pending-card')) {
                $('#pending-list').innerHTML =
                    '<div class="admin-empty"><strong>The queue is clear.</strong>There are no pending recommendations to review.</div>';
            }

        } catch (err) {
            toast(`Could not update status: ${err.message}`, 'error');
            b.disabled = false;
        }
    }

    async function countries() {
        const box = $('#country-list');
        const summary = $('#country-summary');

        try {
            const d = await safe(InveniAPI.getCountryStats());
            const items = d.countryStats || [];

            const total = items.reduce(
                (n, x) => n + (Number(x.count) || 0), 0
            );

            summary.innerHTML = `
                <strong>${items.length}</strong>
                <span>${items.length === 1 ? 'country represented' : 'countries represented'} in the resource collection</span>
            `;

            const max = Math.max(1, ...items.map(x => Number(x.count) || 0));

            box.innerHTML = items.length
                ? items.map((x, i) => `
                    <div class="country-row">
                        <span class="country-rank">${String(i + 1).padStart(2, '0')}</span>
                        <strong class="country-name">${esc(x._id)}</strong>
                        <div class="country-track">
                            <span style="width:${Math.max(2, (Number(x.count) || 0) / max * 100)}%;animation-delay:${i * 55}ms"></span>
                        </div>
                        <span class="country-count">${Number(x.count) || 0}</span>
                    </div>
                `).join('')
                : '<div class="admin-empty"><strong>No country data yet.</strong>Country statistics will appear when resources include a country.</div>';

        } catch (e) {
            summary.innerHTML = `<span>${esc(e.message)}</span>`;
            box.innerHTML = '';
        }
    }

    async function detail() {
        const box = $('#admin-resource-detail');
        const id = new URLSearchParams(location.search).get('id');

        if (!id) {
            box.innerHTML = '<div class="admin-empty">No resource ID was provided.</div>';
            return;
        }

        try {
            const d = await safe(InveniAPI.getAdminResource(id));
            const r = d.resource;

            if (!r) throw new Error('Resource not found');

            box.innerHTML = `
                <div class="admin-detail-top">
                    <div>
                        <div class="pending-meta">
                            <span class="tag">${esc(r.type)}</span>
                            <span>${esc(r.field)}</span>
                            <span>${statusPill(r.status)}</span>
                        </div>
                        <h2>${esc(r.title)}</h2>
                    </div>
                    <a class="under-link" href="resources.html">← Back to resources</a>
                </div>

                <div class="admin-detail-grid">
                    <div>
                        <section class="admin-detail-copy">
                            <h3>About this resource</h3>
                            <p>${esc(r.description)}</p>

                            <h3 style="margin-top:20px">Why it was recommended</h3>
                            <p>${esc(r.recommendation)}</p>

                            <a class="under-link" href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">Open original resource ↗</a>
                        </section>

                        <div class="admin-detail-actions">
                            ${r.status !== 'approved' ? '<button class="mini-button approve" data-detail-status="approved">Approve resource</button>' : ''}
                            ${r.status !== 'rejected' ? '<button class="mini-button reject" data-detail-status="rejected">Reject resource</button>' : ''}
                            <button class="danger-button" id="delete-resource">Delete resource</button>
                        </div>
                    </div>

                    <aside class="admin-detail-facts">
                        <h3 class="eyebrow">RESOURCE DETAILS</h3>

                        <div class="detail-fact">
                            <span>Creator</span>
                            <strong>${esc(r.creator)}</strong>
                        </div>

                        <div class="detail-fact">
                            <span>Length</span>
                            <strong>${esc(r.length)}</strong>
                        </div>

                        <div class="detail-fact">
                            <span>Field</span>
                            <strong>${esc(r.field)}</strong>
                        </div>

                        <div class="detail-fact">
                            <span>Country</span>
                            <strong>${esc(r.country)}</strong>
                        </div>

                        <div class="detail-fact">
                            <span>Submitted by</span>
                            <strong>${esc(r.submittedBy || 'Not provided')}</strong>
                        </div>
                    </aside>
                </div>
            `;

            box.addEventListener('click', async e => {
                const statusBtn = e.target.closest('[data-detail-status]');

                if (statusBtn) {
                    const status = statusBtn.dataset.detailStatus;

                    if (!confirm(`${status === 'approved' ? 'Approve' : 'Reject'} this resource?`)) return;

                    statusBtn.disabled = true;

                    try {
                        await InveniAPI.updateResourceStatus(id, status);
                        toast(`Resource ${status}.`);
                        detail();

                    } catch (err) {
                        toast(err.message, 'error');
                        statusBtn.disabled = false;
                    }
                }

                if (e.target.closest('#delete-resource')) {
                    if (!confirm('Permanently delete this resource? This cannot be undone.')) return;

                    try {
                        await InveniAPI.deleteAdminResource(id);
                        toast('Resource deleted.');

                        setTimeout(() => {
                            location.href = 'resources.html';
                        }, 500);

                    } catch (err) {
                        toast(err.message, 'error');
                    }
                }
            });

        } catch (e) {
            box.innerHTML = `
                <div class="admin-empty">
                    <strong>Could not load resource.</strong>
                    ${esc(e.message)}
                    <p><a class="under-link" href="resources.html">Return to all resources</a></p>
                </div>
            `;
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        const page = document.body.dataset.adminPage;

        if (!page) return;

        logout();
        updateNavCount();

        if (page === 'dashboard') dashboard().catch(() => {});
        if (page === 'resources') resources();
        if (page === 'pending') pending();
        if (page === 'countries') countries();
        if (page === 'detail') detail();
    });

})();
