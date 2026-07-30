# ZentraBank frontend integration foundation

## Environment

Copy `.env.example` to `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_TENANT_SLUG=zentra-bank
```

The backend must use the exact frontend origin in `FRONTEND_URL`, for example:

```env
FRONTEND_URL=http://localhost:3000
```

## Implemented

- Central Axios API client using the backend `/api/v1` prefix.
- `X-Tenant-Slug` injection for every browser request.
- In-memory access-token handling.
- HTTP-only refresh-cookie session restoration.
- One automatic retry after an expired access token.
- Real email/password login.
- Auth store with explicit loading/authenticated/unauthenticated states.
- Protected `AppShell` routes.
- Logout and session clearing.
- Backend tenant-configuration normalization.
- Shared API/auth types and reusable loading/error components.
- Permission guard for later page-level authorization.

## Backend changes

None. This frontend is adapted to the existing backend contract.

## Important backend behaviour

- Login: `POST /auth/login`
- Refresh: `POST /auth/refresh`
- Logout: `POST /auth/logout`
- Current user: `GET /auth/me`
- Tenant configuration: `GET /tenants/current`

All paths above are relative to `NEXT_PUBLIC_API_BASE_URL`.

## Next integration stage

Connect dashboard, accounts, transactions, beneficiaries, transfers and notifications to their existing backend modules, replacing mock arrays and browser-storage business data page by page.
