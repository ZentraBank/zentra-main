const router =
  require("express").Router();

const controller =
  require("./clients.controller");

const schemas =
  require("./clients.validation");

const validate =
  require("../../middleware/validate.middleware");

const {
  resolveTenantMiddleware,
} = require("../../middleware/tenant.middleware");

const {
  authenticate,
} = require("../../middleware/auth.middleware");

const {
  requireAllPermissions,
} = require("../../middleware/permission.middleware");

const {
  uploadSingleDocument,
} = require("../../middleware/upload.middleware");

router.use(
  resolveTenantMiddleware
);

router.use(
  authenticate
);

router.get(
  "/",
  requireAllPermissions("users.read"),
  controller.list
);


router.get(
  "/:clientId",
  validate(schemas.clientIdSchema),
  requireAllPermissions("users.read"),
  controller.get
);

router.post(
  "/",
  validate(schemas.createClientSchema),
  requireAllPermissions("users.create"),
  controller.create
);

router.patch(
  "/:clientId/avatar",
  validate(schemas.clientIdSchema),
  requireAllPermissions("users.update"),
  uploadSingleDocument,
  controller.uploadAvatar
);

module.exports = router;