const router =
  require("express").Router();

const controller =
  require("./gifts.controller");

const schemas =
  require("./gifts.validation");

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
  uploadSingleDocument,
} = require(
  "../../middleware/upload.middleware"
);

router.use(
  resolveTenantMiddleware
);

router.use(
  authenticate
);

/*
|--------------------------------------------------------------------------
| Client gift routes
|--------------------------------------------------------------------------
*/

router.get(
  "/me",

  validate(
    schemas.listMine
  ),

  requireAllPermissions(
    "gifts.read"
  ),

  controller.listMine
);

router.post(
  "/me/:giftId/redemption-proof/file",

  uploadSingleDocument,

  validate(
    schemas.giftRedemptionProof
  ),

  requireAllPermissions(
    "gifts.read"
  ),

  controller.uploadRedemptionProofFile
);

router.post(
  "/me/:giftId/redemption-proof",

  validate(
    schemas.submitRedemptionProof
  ),

  requireAllPermissions(
    "gifts.read"
  ),

  controller.submitRedemptionProof
);

router.get(
  "/me/:giftId/redemption-proof",

  validate(
    schemas.giftRedemptionProof
  ),

  requireAllPermissions(
    "gifts.read"
  ),

  controller.getMyRedemptionProof
);

router.get(
  "/me/:giftId",

  validate(
    schemas.giftId
  ),

  requireAllPermissions(
    "gifts.read"
  ),

  controller.getMine
);

router.post(
  "/me/:giftId/decision",

  validate(
    schemas.decision
  ),

  requireAllPermissions(
    "gifts.read"
  ),

  controller.decideGift
);

/*
|--------------------------------------------------------------------------
| Tenant gift routes
|--------------------------------------------------------------------------
*/

router.post(
  "/",

  validate(
    schemas.createGift
  ),

  requireAllPermissions(
    "gifts.create"
  ),

  controller.createGift
);

router.get(
  "/",

  validate(
    schemas.listTenant
  ),

  requireAllPermissions(
    "gifts.manage"
  ),

  controller.listTenant
);

router.get(
  "/:giftId/redemption-proof",

  validate(
    schemas.giftRedemptionProof
  ),

  requireAllPermissions(
    "gifts.manage"
  ),

  controller.getRedemptionProof
);

router.patch(
  "/:giftId/redemption-proof/status",

  validate(
    schemas.reviewRedemptionProof
  ),

  requireAllPermissions(
    "gifts.manage"
  ),

  controller.reviewRedemptionProof
);

router.post(
  "/:giftId/cancel",

  validate(
    schemas.cancelGift
  ),

  requireAllPermissions(
    "gifts.manage"
  ),

  controller.cancelGift
);

router.patch(
  "/:giftId",

  validate(
    schemas.updateGift
  ),

  requireAllPermissions(
    "gifts.manage"
  ),

  controller.updateGift
);

router.get(
  "/:giftId",

  validate(
    schemas.giftId
  ),

  requireAllPermissions(
    "gifts.manage"
  ),

  controller.getTenantGift
);

module.exports =
  router;