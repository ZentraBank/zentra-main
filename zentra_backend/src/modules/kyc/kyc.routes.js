const router =
  require("express").Router();

const controller =
  require("./kyc.controller");

const schemas =
  require("./kyc.validation");

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

router.use(
  resolveTenantMiddleware
);

router.use(
  authenticate
);

router.put(
  "/me",
  validate(
    schemas.saveProfileSchema
  ),
  requireAllPermissions(
    "kyc.write"
  ),
  controller.saveProfile
);

router.get(
  "/me",
  requireAllPermissions(
    "kyc.read"
  ),
  controller.getMine
);

router.post(
  "/me/documents",
  validate(
    schemas.documentSchema
  ),
  requireAllPermissions(
    "kyc.write"
  ),
  controller.addDocument
);

router.post(
  "/me/document-files",
  validate(
    schemas.uploadFileSchema
  ),
  requireAllPermissions(
    "kyc.write"
  ),
  controller.uploadDocumentFile
);

router.post(
  "/me/submit",
  requireAllPermissions(
    "kyc.submit"
  ),
  controller.submit
);

router.get(
  "/admin/applications",
  validate(
    schemas.listSchema
  ),
  requireAllPermissions(
    "kyc.review"
  ),
  controller.listPending
);

router.patch(
  "/admin/applications/:profileId/review",
  validate(
    schemas.reviewSchema
  ),
  requireAllPermissions(
    "kyc.review"
  ),
  controller.review
);

router.get(
  "/admin/applications/:profileId",
  validate(
    schemas.applicationIdSchema
  ),
  requireAllPermissions(
    "kyc.review"
  ),
  controller.getAdminApplication
);

module.exports = router;
