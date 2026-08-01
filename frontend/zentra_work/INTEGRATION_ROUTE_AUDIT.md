# Client route audit — resolved batch

Resolved in this batch:

- Live card landing page now uses issued cards from `/cards/me`.
- Added live card details route: `/cards/details/[cardId]`.
- Added safe aliases for legacy card routes.
- Added `/privacy-policy`, `/terms`, `/company-policy`, `/contact`, `/branches`, and `/services`.
- Added compatibility routes for `/profile/settings`, `/profile-setup/form`, `/wallet`, `/help-support`, `/investment/details`, and `/donation`.
- Corrected the legal-and-compliance support link.
- Replaced the card-store link with the existing card-purchase flow.

Known product placeholders:

- Branch locations remain tenant-configurable content.
- Card limits do not yet have a backend update endpoint, so legacy limit/control routes lead to the live card-management screen.
- Human verification has no external CAPTCHA/WebAuthn provider yet.
