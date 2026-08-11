# Access-token compatibility fix

The tenant auth service previously signed tokens with issuer `zentrabank-api`,
while `auth.middleware.js` verified tokens with `APP_NAME` (normally
`ZentraBank API`). This caused every protected API request to fail with
`Invalid access token` immediately after login.

`src/utils/authTokens.js` now uses the same tenant-token contract as
`src/utils/jwt.js`:

- issuer: `APP_NAME`
- audience: `zentrabank-client`
- token type: `access`
- subject: authenticated user ID
- tenant, membership, and role claims

Restart the backend, then log out and log in again so the browser receives a
newly signed access token. Existing access tokens remain invalid.
