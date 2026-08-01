const router =
  require("express").Router();

const controller =
  require("./recurring.controller");

const schemas =
  require("./recurring.validation");

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
  "/mandates",
  validate(
    schemas.createMandate
  ),
  requireAllPermissions(
    "recurring_payments.create"
  ),
  controller.createMandate
);

router.get(
  "/mandates/mine",
  validate(
    schemas.listMandates
  ),
  requireAllPermissions(
    "recurring_payments.create"
  ),
  controller.listMine
);

router.get(
  "/mandates",
  validate(
    schemas.listMandates
  ),
  requireAllPermissions(
    "recurring_payments.read"
  ),
  controller.listMandates
);

router.post(
  "/mandates/:mandateId/authorisations",
  validate(
    schemas.createAuthorisation
  ),
  requireAllPermissions(
    "recurring_payments.authorise"
  ),
  controller.createAuthorisation
);

router.post(
  "/authorisations/:authorisationId/confirm",
  validate(
    schemas.confirmAuthorisation
  ),
  requireAllPermissions(
    "recurring_payments.authorise"
  ),
  controller.confirmAuthorisation
);

router.patch(
  "/mandates/:mandateId/status",
  validate(
    schemas.changeMandateStatus
  ),
  requireAllPermissions(
    "recurring_payments.manage"
  ),
  controller.changeMandateStatus
);

router.post(
  "/schedules/execute-due",
  validate(
    schemas.executeDueSchedules
  ),
  requireAllPermissions(
    "recurring_payments.execute"
  ),
  controller.executeDueSchedules
);

module.exports =
  router;
