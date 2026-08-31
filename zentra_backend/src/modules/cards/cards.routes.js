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

const {
  requirePlanFeature,
} = require(
  "../../middleware/subscription.middleware"
);

router.use(resolveTenantMiddleware);
router.use(authenticate);

/*
|--------------------------------------------------------------------------
| Customer purchase requests
|--------------------------------------------------------------------------
*/

/*
 * Creating a NEW card request is subscription-gated.
 *
 * Bronze  -> blocked
 * Gold    -> allowed
 * Diamond -> allowed
 */
router.post(
  "/purchase-requests",
  requirePlanFeature("virtual_cards"),
  validate(schema.purchaseRequest),
  requireAllPermissions("cards.request"),
  controller.submitPurchaseRequest
);

/*
 * Existing requests remain readable even if the tenant
 * later downgrades its subscription.
 */
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

/*
 * A client must still be able to cancel an existing
 * request after a downgrade.
 */
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

/*
 * Tenant admins can still see outstanding requests.
 *
 * This is intentionally NOT subscription-gated so that
 * an existing request does not become invisible after
 * a downgrade or subscription change.
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

/*
 * APPROVING a request creates/enables the paid card
 * capability, so this must be subscription-gated.
 */
router.patch(
  "/admin/purchase-requests/:requestId/approve",
  requirePlanFeature("virtual_cards"),
  validate(schema.purchaseRequestId),
  requireAllPermissions("cards.manage"),
  controller.approvePurchaseRequest
);

/*
 * Rejection remains available after downgrade so that
 * tenant admins can close outstanding requests safely.
 */
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

/*
 * Existing cards remain readable after downgrade.
 *
 * We do NOT put the subscription paywall here because
 * clients must not lose access to important card
 * information simply because the tenant changes plan.
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

/*
 * Existing card safety controls remain available.
 *
 * For example, a client must still be able to freeze
 * an already-issued card after a tenant downgrade.
 */
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

/*
|--------------------------------------------------------------------------
| Tenant administration of issued client cards
|--------------------------------------------------------------------------
*/

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

/*
 * Existing-card lifecycle administration stays
 * available even after downgrade.
 *
 * This allows a tenant to freeze/block/manage an
 * already-issued client card when necessary.
 */
router.patch(
  "/admin/:cardId/status",
  validate(schema.adminStatus),
  requireAllPermissions("cards.manage"),
  controller.changeStatusAsAdmin
);

module.exports = router;