const router =
  require("express").Router();

const controller =
  require("./virtual-accounts.controller");

const schemas =
  require("./virtual-accounts.validation");

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
  "/programs",
  validate(
    schemas.createProgram
  ),
  requireAllPermissions(
    "virtual_accounts.programs.manage"
  ),
  controller.createProgram
);

router.post(
  "/",
  validate(
    schemas.createVirtualAccount
  ),
  requireAllPermissions(
    "virtual_accounts.create"
  ),
  controller.createVirtualAccount
);

router.get(
  "/mine",
  validate(
    schemas.listVirtualAccounts
  ),
  requireAllPermissions(
    "virtual_accounts.create"
  ),
  controller.listMine
);

router.get(
  "/",
  validate(
    schemas.listVirtualAccounts
  ),
  requireAllPermissions(
    "virtual_accounts.read"
  ),
  controller.listVirtualAccounts
);

router.post(
  "/collections/ingest",
  validate(
    schemas.ingestCollection
  ),
  requireAllPermissions(
    "collections.ingest"
  ),
  controller.ingestCollection
);

router.post(
  "/collections/:collectionId/match",
  validate(
    schemas.manualMatch
  ),
  requireAllPermissions(
    "collections.manage"
  ),
  controller.manualMatchCollection
);

router.post(
  "/sweep-rules",
  validate(
    schemas.createSweepRule
  ),
  requireAllPermissions(
    "virtual_accounts.sweeps.manage"
  ),
  controller.createSweepRule
);

module.exports =
  router;
