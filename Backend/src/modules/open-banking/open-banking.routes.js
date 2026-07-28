const router =
  require("express").Router();

const controller =
  require("./open-banking.controller");

const schemas =
  require("./open-banking.validation");

const validate =
  require(
    "../../middleware/validate.middleware"
  );

const {
  resolveTenantMiddleware,
} = require(
  "../../middleware/tenant.middleware"
);

const {
  authenticate,
} = require(
  "../../middleware/auth.middleware"
);

const {
  requireAllPermissions,
} = require(
  "../../middleware/permission.middleware"
);

router.use(
  resolveTenantMiddleware
);

router.post(
  "/oauth/token",
  validate(
    schemas.issueToken
  ),
  controller.issueToken
);

router.use(
  authenticate
);

router.post(
  "/partners",
  validate(
    schemas.createPartnerApplication
  ),
  requireAllPermissions(
    "open_banking.partners.manage"
  ),
  controller.createPartnerApplication
);

router.post(
  "/partners/:partnerId/approve",
  validate(
    schemas.partnerId
  ),
  requireAllPermissions(
    "open_banking.partners.approve"
  ),
  controller.approvePartner
);

router.post(
  "/partners/:partnerId/consents",
  validate(
    schemas.createConsent
  ),
  requireAllPermissions(
    "open_banking.consents.create"
  ),
  controller.createConsent
);

router.post(
  "/consents/:consentId/authorise",
  validate(
    schemas.authoriseConsent
  ),
  requireAllPermissions(
    "open_banking.consents.authorise"
  ),
  controller.authoriseConsent
);

router.post(
  "/consents/:consentId/revoke",
  validate(
    schemas.revokeConsent
  ),
  requireAllPermissions(
    "open_banking.consents.revoke"
  ),
  controller.revokeConsent
);

router.post(
  "/partners/:partnerId/webhooks",
  validate(
    schemas.createWebhookSubscription
  ),
  requireAllPermissions(
    "open_banking.webhooks.manage"
  ),
  controller.createWebhookSubscription
);

router.post(
  "/rate-limit-policies",
  validate(
    schemas.createRateLimitPolicy
  ),
  requireAllPermissions(
    "open_banking.rate_limits.manage"
  ),
  controller.createRateLimitPolicy
);

module.exports =
  router;
