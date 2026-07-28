const router =
  require("express").Router();

const controller =
  require("./compliance.controller");

const schemas =
  require("./compliance.validation");

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
  "/screenings",
  validate(
    schemas.screen
  ),
  requireAllPermissions(
    "compliance.screen"
  ),
  controller.screen
);

router.post(
  "/monitoring/rules",
  validate(
    schemas.createMonitoringRule
  ),
  requireAllPermissions(
    "compliance.rules.manage"
  ),
  controller.createMonitoringRule
);

router.post(
  "/monitoring/evaluate",
  validate(
    schemas.monitorTransaction
  ),
  requireAllPermissions(
    "compliance.monitor"
  ),
  controller.monitorTransaction
);

router.put(
  "/customers/:userId/risk-profile",
  validate(
    schemas.updateRiskProfile
  ),
  requireAllPermissions(
    "compliance.customers.manage"
  ),
  controller.updateRiskProfile
);

router.get(
  "/alerts",
  validate(
    schemas.listAlerts
  ),
  requireAllPermissions(
    "compliance.alerts.read"
  ),
  controller.listAlerts
);

router.patch(
  "/alerts/:alertId",
  validate(
    schemas.updateAlert
  ),
  requireAllPermissions(
    "compliance.alerts.manage"
  ),
  controller.updateAlert
);

router.post(
  "/cases",
  validate(
    schemas.createCase
  ),
  requireAllPermissions(
    "compliance.cases.manage"
  ),
  controller.createCase
);

router.get(
  "/cases/:caseId",
  validate(
    schemas.caseId
  ),
  requireAllPermissions(
    "compliance.cases.read"
  ),
  controller.getCase
);

router.patch(
  "/cases/:caseId",
  validate(
    schemas.updateCase
  ),
  requireAllPermissions(
    "compliance.cases.manage"
  ),
  controller.updateCase
);

router.post(
  "/cases/:caseId/reports",
  validate(
    schemas.createSar
  ),
  requireAllPermissions(
    "compliance.reports.prepare"
  ),
  controller.createSar
);

module.exports =
  router;
