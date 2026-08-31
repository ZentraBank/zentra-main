const router =
  require("express").Router();

const controller =
  require(
    "./platform-chat.controller"
  );

const schemas =
  require(
    "./platform-chat.validation"
  );

const validate =
  require(
    "../../middleware/validate.middleware"
  );

const {
  authenticate,
} = require(
  "../../middleware/auth.middleware"
);

const {
  requirePlatformScope,
} = require(
  "../../middleware/platform-scope.middleware"
);

const {
  requireAllPermissions,
} = require(
  "../../middleware/permission.middleware"
);


/*
|--------------------------------------------------------------------------
| Platform authentication
|--------------------------------------------------------------------------
|
| These routes are for ZentraBank platform staff.
|
| They deliberately do NOT use:
|
| - resolveTenantMiddleware
| - requirePlanFeature
|
| The tenant subscription controls whether the
| tenant can use platform chat. Platform staff
| must still be able to manage the platform inbox.
|
*/

router.use(
  authenticate
);

router.use(
  requirePlatformScope
);


/*
|--------------------------------------------------------------------------
| Platform chat inbox
|--------------------------------------------------------------------------
*/

router.get(
  "/conversations",

  validate(
    schemas.listPlatformConversations
  ),

  requireAllPermissions(
    "platform.chat.read"
  ),

  controller.listPlatformConversations
);


/*
|--------------------------------------------------------------------------
| Platform unread count
|--------------------------------------------------------------------------
|
| Keep this before /conversations/:conversationId
| so the route remains explicit and predictable.
|
*/

router.get(
  "/unread-count",

  requireAllPermissions(
    "platform.chat.read"
  ),

  controller.getPlatformUnreadCount
);


/*
|--------------------------------------------------------------------------
| Conversation details
|--------------------------------------------------------------------------
*/

router.get(
  "/conversations/:conversationId",

  validate(
    schemas.conversationId
  ),

  requireAllPermissions(
    "platform.chat.read"
  ),

  controller.getPlatformConversation
);


/*
|--------------------------------------------------------------------------
| Conversation messages
|--------------------------------------------------------------------------
*/

router.get(
  "/conversations/:conversationId/messages",

  validate(
    schemas.listPlatformMessages
  ),

  requireAllPermissions(
    "platform.chat.read"
  ),

  controller.listPlatformMessages
);


/*
|--------------------------------------------------------------------------
| Platform reply
|--------------------------------------------------------------------------
*/

router.post(
  "/conversations/:conversationId/messages",

  validate(
    schemas.sendPlatformMessage
  ),

  requireAllPermissions(
    "platform.chat.reply"
  ),

  controller.sendPlatformMessage
);


/*
|--------------------------------------------------------------------------
| Mark conversation as read
|--------------------------------------------------------------------------
*/

router.post(
  "/conversations/:conversationId/read",

  validate(
    schemas.markPlatformConversationRead
  ),

  requireAllPermissions(
    "platform.chat.read"
  ),

  controller.markPlatformConversationRead
);


/*
|--------------------------------------------------------------------------
| Conversation status
|--------------------------------------------------------------------------
|
| Platform staff with management permission can
| close or reopen a tenant support conversation.
|
*/

router.patch(
  "/conversations/:conversationId/status",

  validate(
    schemas.updatePlatformConversationStatus
  ),

  requireAllPermissions(
    "platform.chat.manage"
  ),

  controller.updatePlatformConversationStatus
);


module.exports =
  router;