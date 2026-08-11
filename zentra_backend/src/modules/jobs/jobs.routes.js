const router =
  require("express").Router();

const controller =
  require("./jobs.controller");

const schemas =
  require("./jobs.validation");

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
  "/definitions",
  validate(
    schemas.createDefinition
  ),
  requireAllPermissions(
    "jobs.manage"
  ),
  controller.createDefinition
);

router.get(
  "/definitions",
  validate(
    schemas.listDefinitions
  ),
  requireAllPermissions(
    "jobs.read"
  ),
  controller.listDefinitions
);

router.patch(
  "/definitions/:definitionId/status",
  validate(
    schemas.updateStatus
  ),
  requireAllPermissions(
    "jobs.manage"
  ),
  controller.updateStatus
);

router.post(
  "/definitions/:definitionId/run",
  validate(
    schemas.runNow
  ),
  requireAllPermissions(
    "jobs.run"
  ),
  controller.runNow
);

router.get(
  "/runs",
  validate(
    schemas.listRuns
  ),
  requireAllPermissions(
    "jobs.read"
  ),
  controller.listRuns
);

module.exports =
  router;
