# Post-login integration

Connected to the existing backend without backend changes:

- `GET /api/v1/accounts/me`
- `GET /api/v1/accounts/me/:accountId`
- `GET /api/v1/transfers/me`
- `GET /api/v1/transfers/me/:transferId`

Updated routes:

- `/dashboard` is now protected by `AppShell` and shows live account/transfer summaries.
- `/accounts` lists live customer accounts and balances.
- `/accounts/[accountId]` shows a live account detail.
- `/transactions` shows searchable/filterable live transfer history.

The current membership-fixed backend remains the baseline and was not changed in this stage.
