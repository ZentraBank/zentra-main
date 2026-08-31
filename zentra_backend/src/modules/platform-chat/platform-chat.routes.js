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


/*
|--------------------------------------------------------------------------
| Global middleware
|--------------------------------------------------------------------------
*/

router.use(
  resolveTenantMiddleware
);

router.use(
  authenticate
);

/*
|--------------------------------------------------------------------------
| Subscription entitlement
|--------------------------------------------------------------------------
|
| Bronze:
|   platform_chat = false
|
| Gold:
|   platform_chat = true
|
| Diamond:
|   platform_chat = true
|
*/

router.use(
  requirePlanFeature(
    "platform_chat"
  )
);


/*
|--------------------------------------------------------------------------
| Tenant platform chat
|--------------------------------------------------------------------------
*/

router.get(
  "/conversation",

  requireAllPermissions(
    "platform_chat.read"
  ),

  controller.getTenantConversation
);


router.get(
  "/messages",

  validate(
    schemas.listTenantMessages
  ),

  requireAllPermissions(
    "platform_chat.read"
  ),

  controller.listTenantMessages
);


router.post(
  "/messages",

  validate(
    schemas.sendTenantMessage
  ),

  requireAllPermissions(
    "platform_chat.send"
  ),

  controller.sendTenantMessage
);


router.post(
  "/read",

  validate(
    schemas.markTenantConversationRead
  ),

  requireAllPermissions(
    "platform_chat.read"
  ),

  controller.markTenantConversationRead
);


router.get(
  "/unread-count",

  requireAllPermissions(
    "platform_chat.read"
  ),

  controller.getTenantUnreadCount
);


module.exports =
  router;