# Real frontend/backend integration foundation

This package was created from the original `tenants-frontend.zip` supplied in the conversation.

## Implemented

- Correct API base URL: `http://localhost:5000/api/v1`
- Tenant identification through `X-Tenant-Slug: zentra-bank`
- Correct mapping of `GET /tenants/current`
- Real `POST /auth/login` form submission
- In-memory JWT access token
- HTTP-only refresh-cookie session restoration through `POST /auth/refresh`
- Automatic one-time refresh and retry after an authenticated request receives HTTP 401
- Real `POST /auth/logout`
- Fake hard-coded admin session removed
- Protected pages using `AppShell`
- Backend user/role/permission response types
- Removed Zustand dependency and replaced its three small stores with React `useSyncExternalStore`

## Environment

Create `.env.local` with:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_TENANT_SLUG=zentra-bank
```

The supplied backend already has compatible local values:

```env
PORT=5000
API_PREFIX=/api/v1
FRONTEND_URL=http://localhost:3000
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax
```

## Run

```cmd
npm install
npm run build
npm run dev
```

Then open `http://localhost:3000/login` and sign in with a user seeded in the backend database.

## Backend changes

None. The existing backend authentication and tenant contracts were used as-is.
