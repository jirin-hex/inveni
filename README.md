# Inveni – frontend

Inveni (Latin for "I found") is a place to discover books, courses, articles and tutorials recommended by people who have used them.

This is the React + Vite frontend. It connects to your existing Express backend and does **not** contain or change any backend code.

## Requirements

- Node.js 18 or newer
- Your backend running at `http://localhost:3000`

## Install and run (Windows PowerShell)

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Then open the address Vite prints (usually http://localhost:5173).

On macOS or Linux, use `cp .env.example .env` instead of `Copy-Item`.

`npm install` also creates the `package-lock.json` file. Commit it.

### Other commands

```powershell
npm run build     # production build into dist/
npm run preview   # serve the production build locally
```

## API configuration

The backend address comes from one environment variable in `.env`:

```
VITE_API_URL=http://localhost:3000
```

Restart `npm run dev` after changing it. If it's missing, the app falls back to `http://localhost:3000`.

### CORS

The browser runs on `localhost:5173` and calls `localhost:3000`, so your backend must allow that origin (for example with the `cors` package). If requests fail with a CORS error in the browser console, that's the cause. This frontend can't fix it.

## Endpoints used

| Purpose | Request |
| --- | --- |
| List approved resources | `GET /api/resources` |
| One approved resource | `GET /api/resources/:id` |
| Submit a recommendation | `POST /api/resources` |

No other endpoints are called.

### Assumptions about responses

All API code lives in `views/api/client.js`, and every assumption is documented at the top of that file. Change them there if your backend differs.

- `GET /api/resources` returns an array, or an object with the array under `resources` or `data`.
- `GET /api/resources/:id` returns the resource, or an object with it under `resource` or `data`.
- Resources have a MongoDB `_id` (a plain `id` also works).
- `POST` sends JSON with `title, url, type, recommendation, creator, length, description, field, submittedBy`. It does **not** send `status`, because the backend sets new submissions to pending.
- Errors are JSON with a `message` or `error` string.
- Resource `type` and `field` values are matched case-insensitively against the lists in `views/constants.js`. Resources whose `field` isn't in the list appear under "Other".

## Project structure

```
index.html
vite.config.js
.env.example
views/
  main.jsx            entry point
  App.jsx             routes
  constants.js        site name, categories, resource types
  api/                backend calls (client.js) and search/filter helpers
  hooks/              data loading and page titles
  components/         navbar, footer, cards, search, loading/empty states
  pages/              Home, Explore, ResourceDetail, Recommend, About, NotFound
  admin/              admin login + dashboard (preview only)
  styles/             base.css, site.css, admin.css
  assets/             favicon
```

## Trending section

The backend has no popularity data, so "Trending recommendations" shows the first six approved resources the API returns. It is a placeholder selection, not a ranking.

## Admin interface – NOT connected

Open it at `/admin`. It isn't linked from the public site.

It is a visual preview that runs on sample data in `views/admin/mockData.js`. A banner on every admin page says so.

| Feature | Status |
| --- | --- |
| Sign in | Not connected. The form just opens the dashboard. No real authentication exists. |
| Approve | Not connected. Only changes sample data in the page's memory. |
| Delete | Not connected. Only changes sample data in the page's memory. |
| Pending / all / approved lists | Sample data. Needs an admin endpoint that returns all statuses. |
| Country breakdown | Sample data. The backend has no country field. |

Places to connect later are marked `TODO(backend)` in `views/admin/AdminLogin.jsx` and `views/admin/AdminLayout.jsx`. Note that the public pages never show pending items, since the backend only returns approved ones.

## Accessibility

Keyboard focus is visible, forms have labels and error messages, and animations switch off for people who prefer reduced motion.
