const router =
  require("express").Router();

const controller =
  require("./notifications.controller");

const schemas =
  require("./notifications.validation");

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

const {
  requirePlanFeature,
} = require(
  "../../middleware/subscription.middleware"
);

router.use(
  resolveTenantMiddleware
);

router.use(
  authenticate
);

/*
|--------------------------------------------------------------------------
| Notification templates
|--------------------------------------------------------------------------
|
| Templates themselves are administrative records.
| We do not need to subscription-gate reading/editing existing templates.
|
*/

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

/*
|--------------------------------------------------------------------------
| Tenant -> client notifications
|--------------------------------------------------------------------------
|
| Subscription feature availability is checked here.
|
| Monthly recipient quota will be enforced inside
| notifications.service.js.
|
*/

router.post(
  "/admin/send",

  requirePlanFeature(
    "push_notifications"
  ),

  validate(
    schemas.sendToClients
  ),

  requireAllPermissions(
    "notifications.send"
  ),

  controller.sendToClients
);

router.post(
  "/admin/broadcasts",

  requirePlanFeature(
    "push_notifications"
  ),

  validate(
    schemas.broadcast
  ),

  requireAllPermissions(
    "notifications.broadcast"
  ),

  controller.broadcast
);

/*
|--------------------------------------------------------------------------
| Browser push subscriptions
|--------------------------------------------------------------------------
|
| Any authenticated tenant user who can receive notifications may
| register their browser for Web Push.
|
| Do NOT gate these routes behind the tenant's push_notifications
| subscription feature. These subscriptions are also used for
| Zentra platform -> tenant notifications.
|
*/

router.post(
  "/push/subscription",

  validate(
    schemas.savePushSubscription
  ),

  requireAllPermissions(
    "notifications.read"
  ),

  controller.savePushSubscription
);

router.delete(
  "/push/subscription",

  validate(
    schemas.removePushSubscription
  ),

  requireAllPermissions(
    "notifications.read"
  ),

  controller.removePushSubscription
);

/*
|--------------------------------------------------------------------------
| Client notifications
|--------------------------------------------------------------------------
|
| These routes operate on notifications that already exist.
| They must remain accessible even if a tenant later changes plan.
|
*/

router.get(
  "/me",

  validate(
    schemas.list
  ),

  requireAllPermissions(
    "notifications.read"
  ),

  controller.listMine
);

router.get(
  "/me/unread-count",

  requireAllPermissions(
    "notifications.read"
  ),

  controller.unreadCount
);

router.patch(
  "/me/read-all",

  requireAllPermissions(
    "notifications.manage"
  ),

  controller.markAllRead
);

router.patch(
  "/me/:notificationId/read",

  validate(
    schemas.id
  ),

  requireAllPermissions(
    "notifications.manage"
  ),

  controller.markRead
);

router.patch(
  "/me/:notificationId/archive",

  validate(
    schemas.id
  ),

  requireAllPermissions(
    "notifications.manage"
  ),

  controller.archive
);

module.exports =
  router;