# ZentraBank business-flow integration

## Connected frontend routes

- `/accounts` -> `GET /api/v1/accounts/me`
- `/transactions` -> `GET /api/v1/transfers/me`
- `/beneficiaries` -> list/create/delete beneficiary APIs
- `/dashboard/transfer` -> accounts + beneficiaries + transfer history + `POST /api/v1/transfers/internal`
- `/dashboard/transfer/transaction?id=...` -> `GET /api/v1/transfers/me/:transferId`
- `/notifications` -> list, unread count, mark one read, mark all read

## Important backend rules represented in the UI

- The current transfer backend supports internal ZentraBank transfers only.
- A saved internal beneficiary must match an existing active account.
- The source account must belong to the authenticated user.
- Source and destination currencies must match.
- Transfers require an active subscription and are subject to plan limits.
- The backend validates sufficient balance and account status.

## Environment

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_TENANT_SLUG=zentra-bank
```

The backend must permit the frontend origin and credentials so its HTTP-only refresh cookie can be sent.

## Deliberately not changed

- No backend file was modified.
- Admin-specific screens were not migrated in this stage.
- External-bank beneficiaries are not selectable for transfers because the current transfer backend accepts internal accounts only.
- The old transfer edit page remains in the project for design reference, but the live flow does not use it.
