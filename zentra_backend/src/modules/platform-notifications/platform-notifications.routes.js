const router = require("express").Router();

const controller =
  require("./platform-notifications.controller");

const schemas =
  require("./platform-notifications.validation");

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
  validate(schemas.list),
  requireAllPermissions(
    "platform.notifications.read"
  ),
  controller.list
);

router.get(
  "/unread-count",
  requireAllPermissions(
    "platform.notifications.read"
  ),
  controller.unreadCount
);

router.post(
  "/",
  validate(schemas.create),
  requireAllPermissions(
    "platform.notifications.create"
  ),
  controller.create
);

router.post(
  "/send-to-tenants",

  validate(
    schemas.sendToTenants
  ),

  requireAllPermissions(
    "platform.notifications.create"
  ),

  controller.sendToTenants
);

router.get(
  "/:notificationId",
  validate(schemas.notificationId),
  requireAllPermissions(
    "platform.notifications.read"
  ),
  controller.getOne
);

router.patch(
  "/:notificationId/read",
  validate(schemas.notificationId),
  requireAllPermissions(
    "platform.notifications.read"
  ),
  controller.markRead
);

router.patch(
  "/read-all",
  requireAllPermissions(
    "platform.notifications.read"
  ),
  controller.markAllRead
);

module.exports = router;
