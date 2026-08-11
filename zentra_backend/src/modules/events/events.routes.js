const router =
  require("express").Router();

const controller =
  require("./events.controller");

const schemas =
  require("./events.validation");

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
    schemas.listEvents
  ),
  requireAllPermissions(
    "events.read"
  ),
  controller.listEvents
);

module.exports =
  router;
