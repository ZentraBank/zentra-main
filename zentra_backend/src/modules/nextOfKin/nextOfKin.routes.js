const router =
  require("express").Router();

const controller =
  require("./nextOfKin.controller");

const schemas =
  require("./nextOfKin.validation");

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
  uploadSingleDocument,
} = require(
  "../../middleware/upload.middleware"
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
| Client document upload
|--------------------------------------------------------------------------
|
| Uploading documents here is part of starting
| a new next-of-kin claim.
|
*/

router.post(
  "/files",

  requirePlanFeature(
    "next_of_kin"
  ),

  requireApprovedKyc,

  requireAllPermissions(
    "next_of_kin.claims.create"
  ),

  uploadSingleDocument,

  validate(
    schemas.uploadFile
  ),

  controller.uploadFile
);


/*
|--------------------------------------------------------------------------
| Client claim submission
|--------------------------------------------------------------------------
|
| Starting a new NOK claim requires the tenant's
| subscription to include next_of_kin.
|
*/

router.post(
  "/claims",

  requirePlanFeature(
    "next_of_kin"
  ),

  requireApprovedKyc,

  validate(
    schemas.createClaim
  ),

  requireAllPermissions(
    "next_of_kin.claims.create"
  ),

  controller.createClaim
);


/*
|--------------------------------------------------------------------------
| Client claims
|--------------------------------------------------------------------------
|
| Existing claims remain accessible even if the
| tenant's subscription changes later.
|
*/

router.get(
  "/claims/me",

  validate(
    schemas.listMine
  ),

  requireAllPermissions(
    "next_of_kin.claims.read"
  ),

  controller.listMine
);

router.get(
  "/claims/me/:claimId",

  validate(
    schemas.claimId
  ),

  requireAllPermissions(
    "next_of_kin.claims.read"
  ),

  controller.getMine
);


/*
|--------------------------------------------------------------------------
| Additional information for existing claim
|--------------------------------------------------------------------------
|
| This is deliberately NOT gated by next_of_kin.
|
| Once a claim exists, a client must still be
| able to respond to requests for additional
| information even if the subscription changes.
|
*/

router.post(
  "/claims/me/:claimId/additional-information",

  requireApprovedKyc,

  validate(
    schemas.submitAdditionalInformation
  ),

  requireAllPermissions(
    "next_of_kin.claims.create"
  ),

  controller.submitAdditionalInformation
);


/*
|--------------------------------------------------------------------------
| Tenant claim review
|--------------------------------------------------------------------------
|
| Tenant administrators must retain access to
| existing claims so they can complete their
| review obligations.
|
*/

router.get(
  "/claims",

  validate(
    schemas.listClaims
  ),

  requireAllPermissions(
    "next_of_kin.claims.review"
  ),

  controller.listClaims
);


/*
|--------------------------------------------------------------------------
| Tenant secure claim documents
|--------------------------------------------------------------------------
|
| Existing claim documents must remain available
| to authorised reviewers.
|
*/

router.get(
  "/claims/:claimId/files/:fileId",

  validate(
    schemas.claimFile
  ),

  requireAllPermissions(
    "next_of_kin.claims.review"
  ),

  controller.getClaimFile
);


/*
|--------------------------------------------------------------------------
| Tenant claim details
|--------------------------------------------------------------------------
*/

router.get(
  "/claims/:claimId",

  validate(
    schemas.claimId
  ),

  requireAllPermissions(
    "next_of_kin.claims.review"
  ),

  controller.getClaim
);


/*
|--------------------------------------------------------------------------
| Tenant claim status
|--------------------------------------------------------------------------
|
| Existing claims must remain reviewable and
| completable after a subscription downgrade.
|
*/

router.patch(
  "/claims/:claimId/status",

  validate(
    schemas.updateClaimStatus
  ),

  requireAllPermissions(
    "next_of_kin.claims.review"
  ),

  controller.updateClaimStatus
);


module.exports =
  router;