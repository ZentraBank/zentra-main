const router =
  require("express").Router();

const controller =
  require("./reports.controller");

const schemas =
  require("./reports.validation");

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

router.get(
  "/exports/me",
  validate(
    schemas.listExports
  ),
  requireAllPermissions(
    "reports.exports.read"
  ),
  controller.listMine
);

router.get(
  "/exports/me/:exportId",
  validate(
    schemas.exportId
  ),
  requireAllPermissions(
    "reports.exports.read"
  ),
  controller.getMine
);

router.get(
  "/admin/exports",
  validate(
    schemas.listExports
  ),
  requireAllPermissions(
    "reports.exports.manage"
  ),
  controller.listAdmin
);

router.get(
  "/:reportType",
  validate(
    schemas.report
  ),
  requireAllPermissions(
    "reports.read"
  ),
  controller.getReport
);

router.get(
  "/:reportType/export",
  validate(
    schemas.export
  ),
  requireAllPermissions(
    "reports.export"
  ),
  controller.exportNow
);

module.exports =
  router;
