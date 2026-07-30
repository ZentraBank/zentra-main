# ZentraBank End-to-End Validation

## Repairs applied

- Corrected `.env` and `.env.local` to use `NEXT_PUBLIC_TENANT_SLUG=zentra-bank`.
- Confirmed the frontend API prefix matches the backend: `http://localhost:5000/api/v1`.
- Added a dependency-free read-only smoke test at `scripts/e2e-smoke.mjs`.
- Added the `npm run smoke:e2e` package script.

## Contract checks completed

The following frontend calls match the backend routes, HTTP methods, tenant middleware, validation schemas, and response envelopes:

- `GET /tenants/current`
- `POST /auth/login`
- `POST /auth/refresh`
- `GET /auth/me`
- `POST /auth/logout`
- `GET /accounts/me`
- `GET /transfers/me`
- `GET /transfers/me/:transferId`
- `POST /transfers/internal`
- `GET /beneficiaries/me`
- `POST /beneficiaries`
- `DELETE /beneficiaries/me/:beneficiaryId`
- `GET /notifications/me`
- `GET /notifications/me/unread-count`
- `PATCH /notifications/me/:notificationId/read`
- `PATCH /notifications/me/read-all`

## Run locally

Start MySQL and ensure the backend database has been created and seeded. Then start the backend:

```bash
cd Backend
npm install
npm run db:setup
npm run dev
```

Start the frontend in another terminal:

```bash
cd tenants-frontend
npm install
npm run dev
```

Run the API smoke test with a real seeded tenant user:

```bash
E2E_EMAIL="customer@example.com" \
E2E_PASSWORD="your-password" \
npm run smoke:e2e
```

Optional overrides:

```bash
E2E_API_BASE_URL="http://localhost:5000/api/v1" \
E2E_TENANT_SLUG="zentra-bank" \
E2E_EMAIL="customer@example.com" \
E2E_PASSWORD="your-password" \
npm run smoke:e2e
```

The smoke test is intentionally read-only apart from login, refresh-token rotation, and logout. It does not send money, create beneficiaries, or mark notifications as read.

## Validation limitation in the generated environment

A live browser/build run could not be completed in the artifact environment because its private npm mirror does not contain `zustand@5.0.12` and one transitive backend dependency. This is a registry limitation, not an application error. All backend JavaScript files passed `node --check`, and the core API contracts were checked directly against the route, validation, controller, service, and response code.
