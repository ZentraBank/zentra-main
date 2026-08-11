const router =
  require("express").Router();

const controller =
  require("./fraud-risk.controller");

const schemas =
  require("./fraud-risk.validation");

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
  "/evaluate",
  validate(
    schemas.evaluate
  ),
  requireAllPermissions(
    "risk.evaluate"
  ),
  controller.evaluate
);

router.post(
  "/rules",
  validate(
    schemas.createRule
  ),
  requireAllPermissions(
    "risk.rules.manage"
  ),
  controller.createRule
);

router.get(
  "/rules",
  validate(
    schemas.listRules
  ),
  requireAllPermissions(
    "risk.rules.read"
  ),
  controller.listRules
);

router.patch(
  "/rules/:ruleId",
  validate(
    schemas.updateRule
  ),
  requireAllPermissions(
    "risk.rules.manage"
  ),
  controller.updateRule
);

router.get(
  "/cases",
  validate(
    schemas.listFraudCases
  ),
  requireAllPermissions(
    "fraud.cases.read"
  ),
  controller.listFraudCases
);

router.get(
  "/cases/:caseId",
  validate(
    schemas.caseId
  ),
  requireAllPermissions(
    "fraud.cases.read"
  ),
  controller.getFraudCase
);

router.patch(
  "/cases/:caseId",
  validate(
    schemas.updateFraudCase
  ),
  requireAllPermissions(
    "fraud.cases.manage"
  ),
  controller.updateFraudCase
);

module.exports =
  router;
