const router =
  require("express")
    .Router();

const controller =
  require(
    "./chat.controller"
  );

const schemas =
  require(
    "./chat.validation"
  );

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
| Subscription access
|--------------------------------------------------------------------------
|
| Bronze tenants cannot use client chat.
| Gold and Diamond tenants can.
|
*/

router.use(
  requirePlanFeature(
    "client_chat"
  )
);

/*
|--------------------------------------------------------------------------
| Client chat routes
|--------------------------------------------------------------------------
*/

router.get(
  "/me/conversation",

  requireAllPermissions(
    "chat.read"
  ),

  controller.getMyConversation
);

router.get(
  "/me/messages",

  validate(
    schemas.listMyMessages
  ),

  requireAllPermissions(
    "chat.read"
  ),

  controller.listMyMessages
);

router.post(
  "/me/messages",

  validate(
    schemas.sendMyMessage
  ),

  requireAllPermissions(
    "chat.send"
  ),

  controller.sendMyMessage
);

router.post(
  "/me/read",

  validate(
    schemas.markMyConversationRead
  ),

  requireAllPermissions(
    "chat.read"
  ),

  controller.markMyConversationRead
);

router.get(
  "/me/unread-count",

  requireAllPermissions(
    "chat.read"
  ),

  controller.myUnreadCount
);

/*
|--------------------------------------------------------------------------
| Tenant chat routes
|--------------------------------------------------------------------------
*/

router.get(
  "/tenant/conversations",

  validate(
    schemas.listTenantConversations
  ),

  requireAllPermissions(
    "chat.read"
  ),

  controller.listTenantConversations
);

router.post(
  "/tenant/conversations/:clientUserId",

  validate(
    schemas.createTenantConversation
  ),

  requireAllPermissions(
    "chat.manage"
  ),

  controller.createTenantConversation
);

router.get(
  "/tenant/conversations/:conversationId/messages",

  validate(
    schemas.listTenantMessages
  ),

  requireAllPermissions(
    "chat.read"
  ),

  controller.listTenantMessages
);

router.post(
  "/tenant/conversations/:conversationId/messages",

  validate(
    schemas.sendTenantMessage
  ),

  requireAllPermissions(
    "chat.send"
  ),

  controller.sendTenantMessage
);

router.post(
  "/tenant/conversations/:conversationId/read",

  validate(
    schemas.markTenantRead
  ),

  requireAllPermissions(
    "chat.read"
  ),

  controller.markTenantRead
);

router.patch(
  "/tenant/conversations/:conversationId/status",

  validate(
    schemas.updateConversationStatus
  ),

  requireAllPermissions(
    "chat.manage"
  ),

  controller.updateConversationStatus
);

router.get(
  "/tenant/unread-count",

  requireAllPermissions(
    "chat.read"
  ),

  controller.tenantUnreadCount
);

module.exports =
  router;