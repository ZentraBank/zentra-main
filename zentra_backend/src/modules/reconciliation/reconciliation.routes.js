const router =
  require("express").Router();

const controller =
  require("./reconciliation.controller");

const schemas =
  require("./reconciliation.validation");

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
  "/runs/ledger-vs-accounts",
  validate(
    schemas.runLedgerVsAccounts
  ),
  requireAllPermissions(
    "reconciliation.run"
  ),
  controller.runLedgerVsAccounts
);

router.get(
  "/runs",
  validate(
    schemas.listRuns
  ),
  requireAllPermissions(
    "reconciliation.read"
  ),
  controller.listRuns
);

router.get(
  "/runs/:runId",
  validate(
    schemas.runId
  ),
  requireAllPermissions(
    "reconciliation.read"
  ),
  controller.getRun
);

router.get(
  "/runs/:runId/items",
  validate(
    schemas.listItems
  ),
  requireAllPermissions(
    "reconciliation.read"
  ),
  controller.listItems
);

router.patch(
  "/items/:itemId",
  validate(
    schemas.updateItem
  ),
  requireAllPermissions(
    "reconciliation.resolve"
  ),
  controller.updateItem
);

module.exports =
  router;
