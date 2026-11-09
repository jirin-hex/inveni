
(function () {
    const base = window.INVENI_CONFIG.API_BASE_URL.replace(/\/$/, '');

    let csrfToken = null;

    // Retrieve a CSRF token when needed.
    async function getCsrfToken() {
        if (csrfToken) return csrfToken;

        const response = await fetch(`${base}/auth/csrf-token`, {
            credentials: 'include'
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Unable to retrieve CSRF token');
        }

        csrfToken = data.csrfToken;

        return csrfToken;
    }

    async function request(path, options = {}) {
        const method = (options.method || 'GET').toUpperCase();

        const headers = {
            ...(options.body ? { 'Content-Type': 'application/json' } : {}),
            ...(options.headers || {})
        };

        // CSRF protection is needed for authenticated admin mutations.
        const requiresCsrf =
            path.startsWith('/admin') || path === '/auth/logout';

        if (
            requiresCsrf &&
            !['GET', 'HEAD', 'OPTIONS'].includes(method)
        ) {
            headers['X-CSRF-Token'] = await getCsrfToken();
        }

        const response = await fetch(`${base}${path}`, {
            ...options,
            headers,
            credentials: 'include'
        });

        if (response.status === 204) return null;

        const text = await response.text();

        let data = {};

        try {
            data = text ? JSON.parse(text) : {};
        } catch {
            data = {
                message: text || 'Unexpected server response'
            };
        }

        if (!response.ok) {
            throw new Error(data.message || `Request failed (${response.status})`);
        }

        return data;
    }

    window.InveniAPI = {
        getResources: () => request('/resources'),

        getResource: id =>
            request(`/resources/${encodeURIComponent(id)}`),

        submitResource: payload =>
            request('/resources', {
                method: 'POST',
                body: JSON.stringify(payload)
            }),

        getAdminStats: () =>
            request('/admin/dashboard'),

        getAdminResources: status =>
            request(`/admin/${status ? `?status=${encodeURIComponent(status)}` : ''}`),

        getAdminResource: id =>
            request(`/admin/${encodeURIComponent(id)}`),

        updateResourceStatus: (id, status) =>
            request(`/admin/${encodeURIComponent(id)}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status })
            }),

        deleteAdminResource: id =>
            request(`/admin/${encodeURIComponent(id)}`, {
                method: 'DELETE'
            }),

        getCountryStats: () =>
            request('/admin/countries')
    };
})();
