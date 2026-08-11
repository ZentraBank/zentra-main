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

router.use(
  resolveTenantMiddleware
);

router.use(
  authenticate
);

router.post(
  "/files",
  requireApprovedKyc,
  uploadSingleDocument,
  validate(
    schemas.uploadFile
  ),
  requireAllPermissions(
    "next_of_kin.claims.create"
  ),
  controller.uploadFile
);

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

module.exports =
  router;