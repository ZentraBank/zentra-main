# Superadmin Integration Notes

This project has been connected to the real platform API modules.

## Environment

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

## Important changes

- Demo cookie login was removed.
- `/login` now uses `/superadmin/auth/login`.
- Access and refresh token handling is provided by `src/context/platform-auth-context.tsx`.
- Protected pages use the existing `SuperAdminShell` plus the real `ProtectedRoute`.
- Live tenant, administrator, subscription, search, notification, audit, settings, and dashboard services were added under `src/`.

## Verification limitation

The production build could not be executed in the packaging environment because the configured package registry did not contain the locked Zustand tarball. Run locally:

```bash
npm install
npm run lint
npm run build
```
