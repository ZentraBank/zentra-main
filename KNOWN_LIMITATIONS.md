# Known Limitations

- External payments are simulated in MySQL only.
- OTP codes are shown only in development until an email/SMS provider is configured.
- KYC files use local development storage; production requires private object storage.
- Chat uses polling unless Socket.IO is fully enabled in the deployed environment.
- Fingerprint confirmation falls back to transaction PIN; real biometrics require WebAuthn/native support.
- Donations, gifts, investments, lending, insurance, and some informational pages remain presentation UI and are not all connected to complete business workflows.
- A complete frontend build must be run in an environment with access to the public npm registry.
