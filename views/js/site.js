(function () {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const toast = (message, type = '') => { const region = $('#toast-region'); if (!region) return; const node = document.createElement('div'); node.className = `toast ${type}`; node.textContent = message; region.append(node); setTimeout(() => node.remove(), 3600); };
  const resourcesFrom = data => Array.isArray(data?.resources) ? data.resources : [];
  const typeLabel = type => esc(type || 'Resource');
  const card = (r, i) => `<a class="resource-row" style="--i:${i}" href="resource.html?id=${encodeURIComponent(r._id || r.id || '')}"><span class="resource-index">${String(i + 1).padStart(2,'0')}</span><div class="resource-copy"><div class="resource-meta"><span class="tag">${typeLabel(r.type)}</span><span class="tag-dot"></span><span class="tag">${esc(r.field || 'Learning')}</span></div><h3>${esc(r.title)}</h3><p>${esc(r.creator || 'Unknown creator')} · ${esc(r.length || 'Length not specified')} · ${esc(r.description || '')}</p></div><span class="row-arrow">↗</span></a>`;
  const setYear = () => $$('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
  const setupNav = () => { const toggle = $('.menu-toggle'), nav = $('.main-nav'); if (toggle && nav) toggle.addEventListener('click', () => { const open = nav.classList.toggle('open'); toggle.setAttribute('aria-expanded', String(open)); }); };
  async function loadHome() {
    const list = $('#home-resources'); if (!list) return;
    try {
      const data = await InveniAPI.getResources(); const resources = resourcesFrom(data);
      if (!resources.length) { list.innerHTML = '<div class="empty-state"><span class="empty-glyph">✳</span><h3>The shelves are waiting.</h3><p>There are no approved recommendations yet. Be the first to share something useful.</p><a class="button button-outline" href="submit.html">Share a resource</a></div>'; return; }
      list.innerHTML = resources.slice(0, 6).map(card).join('');
      const fields = [...new Set(resources.map(r => r.field).filter(Boolean))].slice(0, 6);
      const fieldBox = $('#home-fields'); if (fieldBox && fields.length) fieldBox.innerHTML = fields.map(f => `<a href="explore.html?field=${encodeURIComponent(f)}">${esc(f)} <span>↗</span></a>`).join('') + '<a href="explore.html">All fields <span>↗</span></a>';
    } catch (error) { list.innerHTML = `<div class="empty-state"><span class="empty-glyph">!</span><h3>We couldn't reach the library.</h3><p>${esc(error.message)}. Check that the Inveni API is running, then refresh.</p><button class="button button-outline" onclick="location.reload()">Try again</button></div>`; }
  }
  async function loadExplore() {
    const list = $('#explore-resources'); if (!list) return;
    let all = [];
    const search = $('#explore-search'), field = $('#field-filter'), sort = $('#sort-resources'), count = $('#results-count'), empty = $('#explore-empty');
    let activeType = 'all';
    try { const data = await InveniAPI.getResources(); all = resourcesFrom(data); }
    catch (error) { list.innerHTML = `<div class="empty-state"><h3>Library unavailable</h3><p>${esc(error.message)}. Make sure your backend is running.</p></div>`; count.textContent = 'Unable to load resources'; return; }
    const fields = [...new Set(all.map(r => r.field).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
    fields.forEach(f => { const o = document.createElement('option'); o.value = f; o.textContent = f; field.append(o); });
    const params = new URLSearchParams(location.search); if (params.has('field')) field.value = params.get('field'); if (params.has('q')) search.value = params.get('q');
    function render() {
      const q = (search.value || '').trim().toLowerCase(); const selectedField = field.value;
      let items = all.filter(r => (activeType === 'all' || String(r.type).toLowerCase() === activeType.toLowerCase()) && (selectedField === 'all' || r.field === selectedField) && (!q || [r.title,r.creator,r.description,r.recommendation,r.field,r.type].some(v => String(v || '').toLowerCase().includes(q))));
      if (sort.value === 'title') items.sort((a,b)=>String(a.title).localeCompare(String(b.title)));
      count.textContent = `${items.length} ${items.length === 1 ? 'resource' : 'resources'} in the library`;
      list.innerHTML = items.map(card).join(''); empty.classList.toggle('hidden', items.length > 0); list.classList.toggle('hidden', items.length === 0);
    }
    search.addEventListener('input', render); field.addEventListener('change', render); sort.addEventListener('change', render);
    $$('.filter-pill').forEach(btn => btn.addEventListener('click', () => { $$('.filter-pill').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); activeType = btn.dataset.type; render(); }));
    $('#clear-filters')?.addEventListener('click', () => { search.value=''; field.value='all'; sort.value='newest'; activeType='all'; $$('.filter-pill').forEach(b=>b.classList.toggle('active',b.dataset.type==='all')); render(); });
    render();
  }
  async function loadResource() {
    const target = $('#resource-detail'); if (!target) return;
    const id = new URLSearchParams(location.search).get('id'); if (!id) { target.innerHTML = '<div class="empty-state"><h3>Resource not found</h3><p>This page needs a resource ID.</p><a class="button button-outline" href="explore.html">Return to the library</a></div>'; return; }
    try {
      const data = await InveniAPI.getResource(id); const r = data.resource;
      if (!r) throw new Error('Resource not found');
      target.innerHTML = `<div class="detail-topline"><span class="tag">${typeLabel(r.type)}</span><span class="tag-dot"></span><span class="tag">${esc(r.field || 'Learning')}</span></div><h1 class="detail-title">${esc(r.title)}</h1><div class="detail-layout"><div><p class="detail-description">${esc(r.description || '')}</p><div class="detail-recommendation"><span>WHY IT WAS RECOMMENDED</span><p>${esc(r.recommendation || 'A resource shared with the Inveni community.')}</p></div><p style="margin-top:24px"><a class="button button-primary" href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">Visit original resource <span>↗</span></a></p></div><aside class="detail-side"><h3>At a glance</h3><div class="detail-fact"><span>Creator / author</span><strong>${esc(r.creator || 'Not provided')}</strong></div><div class="detail-fact"><span>Length</span><strong>${esc(r.length || 'Not specified')}</strong></div><div class="detail-fact"><span>Learning field</span><strong>${esc(r.field || 'Not specified')}</strong></div><div class="detail-fact"><span>Country</span><strong>${esc(r.country || 'Not specified')}</strong></div></aside></div>`;
      document.title = `${r.title} — Inveni`;
    } catch (error) { target.innerHTML = `<div class="empty-state"><span class="empty-glyph">?</span><h3>We couldn't find that resource.</h3><p>${esc(error.message)}</p><a class="button button-outline" href="explore.html">Back to the library</a></div>`; }
  }
  function setupHomeSearch() { const input = $('#home-search'); if (!input) return; input.addEventListener('keydown', e => { if (e.key === 'Enter' && input.value.trim()) location.href = `explore.html?q=${encodeURIComponent(input.value.trim())}`; }); const q = new URLSearchParams(location.search).get('q'); if (q) input.value = q; }
  function setupSubmit() {
    const form = $('#submit-form'); if (!form) return;
    const message = $('#form-message'), success = $('#submit-success');
    form.addEventListener('submit', async e => {
      e.preventDefault(); message.textContent = ''; message.className = 'form-message';
      const fields = [...form.querySelectorAll('input[required],select[required],textarea[required]')]; let valid = true;
      fields.forEach(input => { const okay = input.checkValidity() && input.value.trim(); input.classList.toggle('invalid', !okay); if (!okay) valid = false; });
      const url = form.elements.url; if (url.value && !/^https?:\/\//i.test(url.value)) { url.classList.add('invalid'); valid = false; }
      if (!valid) { message.textContent = 'Please complete the required fields and provide a valid URL beginning with http:// or https://.'; return; }
      const payload = Object.fromEntries(new FormData(form).entries()); Object.keys(payload).forEach(k => { if (typeof payload[k] === 'string') payload[k] = payload[k].trim(); });
      const button = form.querySelector('button[type="submit"]'); button.disabled = true; button.textContent = 'Sending recommendation…';
      try { await InveniAPI.submitResource(payload); form.classList.add('hidden'); success.classList.remove('hidden'); }
      catch (error) { message.textContent = error.message || 'Your recommendation could not be submitted. Please try again.'; }
      finally { button.disabled = false; button.innerHTML = 'Send recommendation <span>↗</span>'; }
    });
    form.querySelectorAll('input,textarea,select').forEach(el => el.addEventListener('input',()=>el.classList.remove('invalid')));
    $('#submit-another')?.addEventListener('click',()=>{form.reset();form.classList.remove('hidden');success.classList.add('hidden');});
  }
  document.addEventListener('DOMContentLoaded', () => { setYear(); setupNav(); setupHomeSearch(); const page = document.body.dataset.page; if (page === 'home') loadHome(); if (page === 'explore') loadExplore(); if (page === 'resource') loadResource(); if (page === 'submit') setupSubmit(); });
})();
