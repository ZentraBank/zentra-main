const router =
  require("express").Router();

const controller =
  require("./investments.controller");

const schemas =
  require("./investments.validation");

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
  requireApprovedKyc,
} = require(
  "../../middleware/kyc.middleware"
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
| Client investment discovery
|--------------------------------------------------------------------------
*/

/*
 * Investment products are part of the paid
 * investment capability.
 *
 * Bronze  -> blocked
 * Gold    -> allowed
 * Diamond -> allowed
 */
router.get(
  "/products",

  requirePlanFeature(
    "investment_access"
  ),

  validate(
    schemas.list
  ),

  requireAllPermissions(
    "investments.products.read"
  ),

  controller.listProducts
);

/*
|--------------------------------------------------------------------------
| Tenant investment product administration
|--------------------------------------------------------------------------
*/

/*
 * Creating NEW investment products requires
 * investment_access.
 */
router.post(
  "/admin/products",

  requirePlanFeature(
    "investment_access"
  ),

  validate(
    schemas.createProduct
  ),

  requireAllPermissions(
    "investments.products.manage"
  ),

  controller.createProduct
);

/*
 * Existing products can still be maintained after
 * downgrade.
 *
 * This is intentionally not subscription-gated,
 * because a tenant may need to disable or maintain
 * an existing product.
 */
router.patch(
  "/admin/products/:productId",

  validate(
    schemas.updateProduct
  ),

  requireAllPermissions(
    "investments.products.manage"
  ),

  controller.updateProduct
);

/*
|--------------------------------------------------------------------------
| Client investment creation
|--------------------------------------------------------------------------
*/

router.post(
  "/",

  requirePlanFeature(
    "investment_access"
  ),

  requireApprovedKyc,

  validate(
    schemas.subscribe
  ),

  requireAllPermissions(
    "investments.create"
  ),

  controller.subscribe
);

/*
|--------------------------------------------------------------------------
| Existing client investments
|--------------------------------------------------------------------------
*/

/*
 * Existing investments remain readable regardless
 * of a later subscription downgrade.
 */
router.get(
  "/me",

  validate(
    schemas.list
  ),

  requireAllPermissions(
    "investments.read"
  ),

  controller.listMine
);

/*
 * Never prevent a client from withdrawing an
 * existing investment merely because the tenant
 * downgraded its ZentraBank plan.
 */
router.post(
  "/:investmentId/withdrawals",

  requireApprovedKyc,

  validate(
    schemas.requestWithdrawal
  ),

  requireAllPermissions(
    "investments.withdraw"
  ),

  controller.requestWithdrawal
);

/*
|--------------------------------------------------------------------------
| Tenant administration of existing investments
|--------------------------------------------------------------------------
*/

router.get(
  "/admin/withdrawals",

  validate(
    schemas.list
  ),

  requireAllPermissions(
    "investments.withdrawals.review"
  ),

  controller.listWithdrawals
);

router.get(
  "/admin/investments",

  validate(
    schemas.list
  ),

  requireAllPermissions(
    "investments.manage"
  ),

  controller.listAll
);

/*
 * Creating an investment directly for a client is
 * still NEW investment business, so it requires
 * investment_access.
 */
router.post(
  "/admin/client-investments",

  requirePlanFeature(
    "investment_access"
  ),

  validate(
    schemas.createClientInvestment
  ),

  requireAllPermissions(
    "investments.manage"
  ),

  controller.createClientInvestment
);

/*
 * Existing withdrawal lifecycle actions stay
 * available after downgrade.
 */
router.patch(
  "/admin/withdrawals/:withdrawalId/review",

  validate(
    schemas.reviewWithdrawal
  ),

  requireAllPermissions(
    "investments.withdrawals.review"
  ),

  controller.reviewWithdrawal
);

router.post(
  "/admin/withdrawals/:withdrawalId/complete",

  validate(
    schemas.withdrawalId
  ),

  requireAllPermissions(
    "investments.withdrawals.complete"
  ),

  controller.completeWithdrawal
);

/*
 * Existing investments must still be able to mature.
 */
router.post(
  "/admin/mark-matured",

  requireAllPermissions(
    "investments.manage"
  ),

  controller.markMatured
);

module.exports =
  router;