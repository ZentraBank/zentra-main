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
*/

router.post(
  "/files",

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
*/

router.post(
  "/claims",

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
| Tenant secure claim document
|--------------------------------------------------------------------------
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