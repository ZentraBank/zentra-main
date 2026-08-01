const router =
  require("express").Router();

const controller =
  require("./privacy.controller");

const schemas =
  require("./privacy.validation");

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

router.use(
  authenticate
);

router.post(
  "/purposes",
  validate(
    schemas.createPurpose
  ),
  requireAllPermissions(
    "privacy.purposes.manage"
  ),
  controller.createPurpose
);

router.post(
  "/consents",
  validate(
    schemas.grantConsent
  ),
  requireAllPermissions(
    "privacy.consents.create"
  ),
  controller.grantConsent
);

router.post(
  "/consents/:consentId/withdraw",
  validate(
    schemas.withdrawConsent
  ),
  requireAllPermissions(
    "privacy.consents.withdraw"
  ),
  controller.withdrawConsent
);

router.post(
  "/data-subject-requests",
  validate(
    schemas.createDataSubjectRequest
  ),
  requireAllPermissions(
    "privacy.requests.create"
  ),
  controller.createDataSubjectRequest
);

router.patch(
  "/data-subject-requests/:requestId",
  validate(
    schemas.updateDataSubjectRequest
  ),
  requireAllPermissions(
    "privacy.requests.manage"
  ),
  controller.updateDataSubjectRequest
);

router.post(
  "/retention-policies",
  validate(
    schemas.createRetentionPolicy
  ),
  requireAllPermissions(
    "privacy.retention.manage"
  ),
  controller.createRetentionPolicy
);

router.post(
  "/retention-policies/:policyId/runs",
  validate(
    schemas.uuidParam
  ),
  requireAllPermissions(
    "privacy.retention.execute"
  ),
  controller.createRetentionRun
);

router.post(
  "/retention-runs/:runId/approve",
  validate(
    schemas.uuidParam
  ),
  requireAllPermissions(
    "privacy.retention.approve"
  ),
  controller.approveRetentionRun
);

router.post(
  "/legal-holds",
  validate(
    schemas.createLegalHold
  ),
  requireAllPermissions(
    "privacy.legal_holds.manage"
  ),
  controller.createLegalHold
);

router.post(
  "/legal-holds/:holdId/release",
  validate(
    schemas.uuidParam
  ),
  requireAllPermissions(
    "privacy.legal_holds.manage"
  ),
  controller.releaseLegalHold
);

router.post(
  "/incidents",
  validate(
    schemas.createIncident
  ),
  requireAllPermissions(
    "privacy.incidents.manage"
  ),
  controller.createIncident
);

module.exports =
  router;
