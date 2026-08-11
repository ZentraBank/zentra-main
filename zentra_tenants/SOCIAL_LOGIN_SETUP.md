# Social login setup

The login page now supports Google and Facebook OAuth for existing ZentraBank users.
Social login does not automatically create a banking user. The verified provider email must already match an active user with an active membership in the selected tenant.

## Backend environment

Add the providers you want to enable to `Backend/.env`:

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
FACEBOOK_API_VERSION=v25.0
```

Restart the backend after changing `.env`. The frontend checks `GET /api/v1/auth/social/providers` and only enables configured providers.

## Google Console

Create a Web application OAuth client. For local development add this authorised redirect URI:

```text
http://localhost:5000/api/v1/auth/social/google/callback
```

Add your deployed backend callback URI before production deployment.

## Meta for Developers

Create/configure a Facebook Login app. Add this valid OAuth redirect URI:

```text
http://localhost:5000/api/v1/auth/social/facebook/callback
```

Facebook must be allowed to return the user's email. Accounts without an email cannot use Facebook login here.

## Security behaviour

- OAuth uses the authorisation-code flow.
- The signed state expires after 10 minutes.
- Access tokens are not placed in the browser URL.
- The backend sets the existing HTTP-only refresh cookie and redirects to `/auth/social/callback`.
- The frontend obtains an access token through the normal refresh endpoint.
- Existing active ZentraBank users only; no automatic financial-account registration.
