const router = require("express").Router();

const controller = require("./platform-admin.controller");
const schemas = require("./platform-admin.validation");

const validate =
  require("../../middleware/validate.middleware");

const {
  authenticate,
} = require("../../middleware/auth.middleware");

const {
  requirePlatformScope,
} = require("../../middleware/platform-scope.middleware");

const {
  requireAllPermissions,
} = require("../../middleware/permission.middleware");

router.use(authenticate);
router.use(requirePlatformScope);

router.get(
  "/",
  validate(schemas.listUsers),
  requireAllPermissions(
    "platform.administrators.read"
  ),
  controller.listUsers
);

router.post(
  "/",
  validate(schemas.createUser),
  requireAllPermissions(
    "platform.administrators.create"
  ),
  controller.createUser
);

router.get(
  "/:userId",
  validate(schemas.userId),
  requireAllPermissions(
    "platform.administrators.read"
  ),
  controller.getUser
);

router.patch(
  "/:userId",
  validate(schemas.updateUser),
  requireAllPermissions(
    "platform.administrators.update"
  ),
  controller.updateUser
);

router.patch(
  "/:userId/permissions",
  validate(schemas.updatePermissions),
  requireAllPermissions(
    "platform.administrators.permissions.manage"
  ),
  controller.updatePermissions
);

router.patch(
  "/:userId/status",
  validate(schemas.updateStatus),
  requireAllPermissions(
    "platform.administrators.suspend"
  ),
  controller.updateStatus
);

module.exports = router;
