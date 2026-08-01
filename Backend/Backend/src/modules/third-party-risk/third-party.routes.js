const router =
  require("express").Router();

const controller =
  require("./third-party.controller");

const schemas =
  require("./third-party.validation");

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
  "/",
  validate(
    schemas.createThirdParty
  ),
  requireAllPermissions(
    "third_parties.create"
  ),
  controller.createThirdParty
);

router.patch(
  "/:thirdPartyId/status",
  validate(
    schemas.updateThirdPartyStatus
  ),
  requireAllPermissions(
    "third_parties.manage"
  ),
  controller.updateThirdPartyStatus
);

router.post(
  "/:thirdPartyId/services",
  validate(
    schemas.createService
  ),
  requireAllPermissions(
    "third_parties.services.manage"
  ),
  controller.createService
);

router.post(
  "/:thirdPartyId/due-diligence",
  validate(
    schemas.createDueDiligence
  ),
  requireAllPermissions(
    "third_parties.assessments.create"
  ),
  controller.createDueDiligence
);

router.post(
  "/assessments/:assessmentId/complete",
  validate(
    schemas.completeDueDiligence
  ),
  requireAllPermissions(
    "third_parties.assessments.manage"
  ),
  controller.completeDueDiligence
);

router.post(
  "/assessments/:assessmentId/review",
  validate(
    schemas.reviewDueDiligence
  ),
  requireAllPermissions(
    "third_parties.assessments.approve"
  ),
  controller.reviewDueDiligence
);

router.post(
  "/:thirdPartyId/contracts",
  validate(
    schemas.createContract
  ),
  requireAllPermissions(
    "third_parties.contracts.manage"
  ),
  controller.createContract
);

router.post(
  "/services/:serviceId/slas",
  validate(
    schemas.createSla
  ),
  requireAllPermissions(
    "third_parties.slas.manage"
  ),
  controller.createSla
);

router.post(
  "/slas/:slaId/measurements",
  validate(
    schemas.recordSlaMeasurement
  ),
  requireAllPermissions(
    "third_parties.slas.measure"
  ),
  controller.recordSlaMeasurement
);

router.post(
  "/:thirdPartyId/issues",
  validate(
    schemas.createRiskIssue
  ),
  requireAllPermissions(
    "third_parties.issues.manage"
  ),
  controller.createRiskIssue
);

router.post(
  "/:thirdPartyId/exit-plans",
  validate(
    schemas.createExitPlan
  ),
  requireAllPermissions(
    "third_parties.exit_plans.manage"
  ),
  controller.createExitPlan
);

module.exports =
  router;
