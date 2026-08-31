const router =
  require("express").Router();

const controller =
  require("./donations.controller");

const schemas =
  require("./donations.validation");

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
| Donors
|--------------------------------------------------------------------------
*/

/*
 * Creating a new donor is part of the
 * donation capability.
 */
router.post(
  "/donors",

  requirePlanFeature(
    "donation_access"
  ),

  validate(
    schemas.createDonor
  ),

  requireAllPermissions(
    "donations.donors.create"
  ),

  controller.createDonor
);

/*
 * Donor discovery is available only while
 * the donation capability is enabled.
 */
router.get(
  "/donors",

  requirePlanFeature(
    "donation_access"
  ),

  validate(
    schemas.list
  ),

  requireAllPermissions(
    "donations.donors.read"
  ),

  controller.listDonors
);

router.get(
  "/donors/:donorId",

  requirePlanFeature(
    "donation_access"
  ),

  validate(
    schemas.donorId
  ),

  requireAllPermissions(
    "donations.donors.read"
  ),

  controller.getDonor
);

/*
 * Existing donor records can still be maintained
 * if the tenant later loses donation access.
 */
router.patch(
  "/donors/:donorId",

  validate(
    schemas.updateDonor
  ),

  requireAllPermissions(
    "donations.donors.manage"
  ),

  controller.updateDonor
);

/*
|--------------------------------------------------------------------------
| Client donation requests
|--------------------------------------------------------------------------
*/

/*
 * Creating a new donation request requires
 * donation_access and approved KYC.
 */
router.post(
  "/requests",

  requirePlanFeature(
    "donation_access"
  ),

  requireApprovedKyc,

  validate(
    schemas.createRequest
  ),

  requireAllPermissions(
    "donations.requests.create"
  ),

  controller.createRequest
);

/*
 * Existing requests remain visible regardless
 * of a later subscription change.
 */
router.get(
  "/requests/me",

  validate(
    schemas.list
  ),

  requireAllPermissions(
    "donations.requests.read"
  ),

  controller.listMine
);

/*
|--------------------------------------------------------------------------
| Tenant donation request administration
|--------------------------------------------------------------------------
*/

/*
 * Existing requests must remain manageable
 * after a plan change.
 */
router.get(
  "/admin/requests",

  validate(
    schemas.list
  ),

  requireAllPermissions(
    "donations.requests.review"
  ),

  controller.listAdmin
);

router.patch(
  "/admin/requests/:requestId/review",

  validate(
    schemas.reviewRequest
  ),

  requireAllPermissions(
    "donations.requests.review"
  ),

  controller.review
);

/*
|--------------------------------------------------------------------------
| Redemption lifecycle
|--------------------------------------------------------------------------
*/

/*
 * Redemption is part of an existing donation
 * lifecycle, so it is intentionally not blocked
 * by subscription changes.
 */
router.post(
  "/requests/:requestId/redemptions",

  requireApprovedKyc,

  validate(
    schemas.requestId
  ),

  requireAllPermissions(
    "donations.redemptions.create"
  ),

  controller.requestRedemption
);

router.post(
  "/redemptions/:redemptionId/verify-otp",

  validate(
    schemas.verifyOtp
  ),

  requireAllPermissions(
    "donations.redemptions.verify"
  ),

  controller.verifyOtp
);

/*
|--------------------------------------------------------------------------
| Tenant redemption administration
|--------------------------------------------------------------------------
*/

router.get(
  "/admin/redemptions",

  validate(
    schemas.adminRedemptionList
  ),

  requireAllPermissions(
    "donations.redemptions.complete"
  ),

  controller.listRedemptionsAdmin
);

router.post(
  "/admin/redemptions/:redemptionId/complete",

  validate(
    schemas.redemptionId
  ),

  requireAllPermissions(
    "donations.redemptions.complete"
  ),

  controller.complete
);

module.exports =
  router;