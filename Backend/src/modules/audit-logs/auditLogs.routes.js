const router =
  require("express").Router();

const controller =
  require("./auditLogs.controller");

const schemas =
  require("./auditLogs.validation");

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
  "/",
  validate(
    schemas.listSchema
  ),
  requireAllPermissions(
    "audit_logs.read"
  ),
  controller.list
);

router.get(
  "/:auditLogId",
  validate(
    schemas.idSchema
  ),
  requireAllPermissions(
    "audit_logs.read"
  ),
  controller.getOne
);

module.exports = router;
