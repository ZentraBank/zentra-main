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

router.use(
  resolveTenantMiddleware
);

router.use(
  authenticate
);

router.get(
  "/products",
  validate(
    schemas.list
  ),
  requireAllPermissions(
    "investments.products.read"
  ),
  controller.listProducts
);

router.post(
  "/admin/products",
  validate(
    schemas.createProduct
  ),
  requireAllPermissions(
    "investments.products.manage"
  ),
  controller.createProduct
);

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

router.post(
  "/",
  requireApprovedKyc,
  validate(
    schemas.subscribe
  ),
  requireAllPermissions(
    "investments.create"
  ),
  controller.subscribe
);

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

router.post(
  "/admin/client-investments",

  validate(
    schemas.createClientInvestment
  ),

  requireAllPermissions(
    "investments.manage"
  ),

  controller.createClientInvestment
);


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

router.post(
  "/admin/mark-matured",
  requireAllPermissions(
    "investments.manage"
  ),
  controller.markMatured
);

module.exports =
  router;
