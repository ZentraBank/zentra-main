# Superadmin Backend Integration

## Added route groups

```text
/api/v1/superadmin/auth
/api/v1/superadmin
/api/v1/superadmin/administrators
/api/v1/superadmin/subscriptions
/api/v1/superadmin/search
/api/v1/superadmin/notifications
/api/v1/superadmin/settings
```

## Database

Run migrations `033` through `036` after the existing migrations. The core `platform_users` schema and seed were also aligned with platform roles.

## Bootstrap

```bash
npm run bootstrap:superadmin
```

Platform and tenant JWTs now coexist in the shared authentication middleware.
