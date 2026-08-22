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

router.use(
  resolveTenantMiddleware
);

router.use(
  authenticate
);

router.post(
  "/donors",
  validate(
    schemas.createDonor
  ),
  requireAllPermissions(
    "donations.donors.create"
  ),
  controller.createDonor
);

router.get(
  "/donors",
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
  validate(
    schemas.donorId
  ),
  requireAllPermissions(
    "donations.donors.read"
  ),
  controller.getDonor
);

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

router.post(
  "/requests",
  requireApprovedKyc,
  validate(
    schemas.createRequest
  ),
  requireAllPermissions(
    "donations.requests.create"
  ),
  controller.createRequest
);

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
