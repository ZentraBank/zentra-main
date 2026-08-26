const router = require("express").Router();
const controller = require("./notifications.controller");
const schema = require("./notifications.validation");
const validate = require("../../middleware/validate.middleware");
const { resolveTenantMiddleware } = require("../../middleware/tenant.middleware");
const { authenticate } = require("../../middleware/auth.middleware");
const { requireAllPermissions } = require("../../middleware/permission.middleware");
const schemas =
  require(
    "./notifications.validation"
  );
  
router.use(resolveTenantMiddleware);
router.use(authenticate);

router.get(
  "/admin/templates",

  validate(
    schemas.listTemplates
  ),

  requireAllPermissions(
    "notifications.templates.read"
  ),

  controller.listTemplates
);

router.post(
  "/admin/templates",

  validate(
    schemas.createTemplate
  ),

  requireAllPermissions(
    "notifications.templates.manage"
  ),

  controller.createTemplate
);

router.patch(
  "/admin/templates/:templateId",

  validate(
    schemas.updateTemplate
  ),

  requireAllPermissions(
    "notifications.templates.manage"
  ),

  controller.updateTemplate
);

router.delete(
  "/admin/templates/:templateId",

  validate(
    schemas.templateId
  ),

  requireAllPermissions(
    "notifications.templates.manage"
  ),

  controller.deleteTemplate
);

router.post(
  "/admin/send",

  validate(
    schemas.sendToClients
  ),

  requireAllPermissions(
    "notifications.send"
  ),

  controller.sendToClients
);
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
