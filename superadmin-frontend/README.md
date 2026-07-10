# ZentraBank Superadmin Starter

A Next.js 16 App Router starter for a separate Superadmin frontend.

## Included

- Responsive Superadmin shell
- Mobile and desktop sidebar
- Topbar and global navigation
- Dashboard starter
- Tenant, administrator, user, account and transaction modules
- Subscription, payment proof, notification and audit-log modules
- Security, sessions, access control, system health and settings pages
- Shared page header and data-table placeholders
- API client, services, types, hooks and Zustand stores
- Next.js 16 `proxy.ts` route gate
- Demo login/logout route handlers

## Installation

1. Back up your existing `superadmin-frontend`.
2. Copy this starter's files into it.
3. Install dependencies:

```bash
npm install
```

4. Copy `.env.example` to `.env.local` and set your backend URL.
5. Start development:

```bash
npm run dev
```

## Demo sign-in

The included demo login accepts any non-empty email and password. It creates a temporary HTTP-only demo cookie.

Replace these files before production:

- `app/api/auth/demo-login/route.ts`
- `app/api/auth/logout/route.ts`
- `proxy.ts`
- `services/auth.service.ts`

## Security note

The frontend route gate is not sufficient authorization. Your backend must validate every Superadmin token, enforce `SUPER_ADMIN`, check permissions, and record privileged actions in immutable audit logs.
