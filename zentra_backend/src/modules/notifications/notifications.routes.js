const router = require("express").Router();
const controller = require("./notifications.controller");
const schema = require("./notifications.validation");
const validate = require("../../middleware/validate.middleware");
const { resolveTenantMiddleware } = require("../../middleware/tenant.middleware");
const { authenticate } = require("../../middleware/auth.middleware");
const { requireAllPermissions } = require("../../middleware/permission.middleware");

router.use(resolveTenantMiddleware);
router.use(authenticate);

router.get("/me",validate(schema.list),
  requireAllPermissions("notifications.read"),controller.listMine);
router.get("/me/unread-count",
  requireAllPermissions("notifications.read"),controller.unreadCount);
router.patch("/me/read-all",
  requireAllPermissions("notifications.manage"),controller.markAllRead);
router.patch("/me/:notificationId/read",validate(schema.id),
  requireAllPermissions("notifications.manage"),controller.markRead);
router.patch("/me/:notificationId/archive",validate(schema.id),
  requireAllPermissions("notifications.manage"),controller.archive);
router.post("/admin/broadcasts",validate(schema.broadcast),
  requireAllPermissions("notifications.broadcast"),controller.broadcast);

module.exports = router;
