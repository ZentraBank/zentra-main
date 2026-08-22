const router = require("express").Router();
const controller = require("./cards.controller");
const schema = require("./cards.validation");
const validate = require(
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

router.use(resolveTenantMiddleware);
router.use(authenticate);

/*
|--------------------------------------------------------------------------
| Customer purchase requests
|--------------------------------------------------------------------------
*/

router.post(
  "/purchase-requests",
  validate(schema.purchaseRequest),
  requireAllPermissions("cards.request"),
  controller.submitPurchaseRequest
);

router.get(
  "/purchase-requests/me",
  requireAllPermissions("cards.read"),
  controller.listOwnPurchaseRequests
);

router.get(
  "/purchase-requests/me/:requestId",
  validate(schema.purchaseRequestId),
  requireAllPermissions("cards.read"),
  controller.getOwnPurchaseRequest
);

router.patch(
  "/purchase-requests/me/:requestId/cancel",
  validate(schema.purchaseRequestId),
  requireAllPermissions("cards.create"),
  controller.cancelOwnPurchaseRequest
);

/*
|--------------------------------------------------------------------------
| Tenant-admin purchase-request management
|--------------------------------------------------------------------------
*/

router.get(
  "/admin/purchase-requests",
  validate(schema.adminPurchaseRequestList),
  requireAllPermissions("cards.manage"),
  controller.listTenantPurchaseRequests
);

router.get(
  "/admin/purchase-requests/:requestId",
  validate(schema.purchaseRequestId),
  requireAllPermissions("cards.manage"),
  controller.getTenantPurchaseRequest
);

router.patch(
  "/admin/purchase-requests/:requestId/approve",
  validate(schema.purchaseRequestId),
  requireAllPermissions("cards.manage"),
  controller.approvePurchaseRequest
);

router.patch(
  "/admin/purchase-requests/:requestId/reject",
  validate(schema.rejectPurchaseRequest),
  requireAllPermissions("cards.manage"),
  controller.rejectPurchaseRequest
);

/*
|--------------------------------------------------------------------------
| Existing issued-card routes
|--------------------------------------------------------------------------
*/

router.get(
  "/me",
  requireAllPermissions("cards.read"),
  controller.listOwnCards
);

router.get(
  "/me/:cardId",
  validate(schema.id),
  requireAllPermissions("cards.read"),
  controller.getOwnCard
);

router.patch(
  "/me/:cardId/status",
  validate(schema.ownStatus),
  requireAllPermissions("cards.update_own"),
  controller.changeOwnStatus
);

router.patch(
  "/me/:cardId/limit",
  validate(schema.ownLimit),
  requireAllPermissions("cards.update_own"),
  controller.changeOwnLimit
);

router.get(
  "/admin",
  validate(schema.adminCardList),
  requireAllPermissions("cards.manage"),
  controller.listTenantCards
);

router.get(
  "/admin/:cardId",
  validate(schema.id),
  requireAllPermissions("cards.manage"),
  controller.getTenantCard
);
router.patch(
  "/admin/:cardId/status",
  validate(schema.adminStatus),
  requireAllPermissions("cards.manage"),
  controller.changeStatusAsAdmin
);


module.exports = router;