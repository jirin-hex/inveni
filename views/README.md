# Inveni frontend (vanilla HTML, CSS and JavaScript)

A standalone frontend for the Inveni resource discovery platform. It uses no frontend framework or build step.

## Run locally

1. Start your existing Express/MongoDB backend.
2. Open this folder in VS Code.
3. Serve the folder with VS Code Live Server (recommended), or another static HTTP server.
4. Visit `index.html` through the local server.

The API base URL is configured in `js/config.js`:

```js
window.INVENI_CONFIG = { API_BASE_URL: 'http://localhost:3000/api' };
```

Change it if your backend runs on a different host or port. The backend must allow the frontend origin through CORS.

## Pages

Public:
- `index.html` — discovery homepage
- `explore.html` — search and filter approved resources
- `resource.html?id=<mongo-id>` — approved resource details
- `submit.html` — submit a recommendation for review

Admin preview:
- `admin/index.html` — overview statistics and pending queue
- `admin/resources.html` — all resources and status filter
- `admin/pending.html` — approve/reject queue
- `admin/resource.html?id=<mongo-id>` — review resource details and delete
- `admin/countries.html` — country aggregation
- `admin/login.html` — placeholder explaining that authentication is not implemented

## API calls used

- `GET /api/resources`
- `GET /api/resources/:id`
- `POST /api/resources`
- `GET /api/admin/dashboard`
- `GET /api/admin/` and `GET /api/admin/?status=pending|approved|rejected`
- `GET /api/admin/:id`
- `PATCH /api/admin/:id/status` with `{ "status": "approved" | "rejected" | "pending" }`
- `DELETE /api/admin/:id`
- `GET /api/admin/countries`

The admin status and delete requests assume the routes are `/:id/status` and `/:id` respectively. Confirm your `adminRoutes.js` matches these paths and that its parameter names match the controller's `req.params.id`.

## Important security note

The supplied backend controller files do not implement authentication or authorization. The admin UI is therefore an administrative interface, **not a secure login system**. The admin endpoints must be protected by backend authentication and role/authorization middleware before this frontend or API is deployed publicly. The login page is intentionally a placeholder and does not accept credentials or create a fake authenticated session.

## Notes

- Public pages only use the approved-resource endpoints.
- Public submission sends the fields expected by the current controller and does not send a status; the backend sets it to `pending`.
- Country statistics reflect the backend aggregation, which currently counts resources across all statuses.
- No fake ratings, view counts, popularity scores or sample statistics are displayed.
- Google Fonts are loaded remotely. If offline, fallback fonts are used.
