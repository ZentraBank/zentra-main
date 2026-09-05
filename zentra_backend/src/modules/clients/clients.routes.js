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

// ==============================
// Client invitations
// ==============================

router.get(
  "/invites",
  requireAllPermissions("users.read"),
  controller.listInvites
);

router.post(
  "/invites",
  validate(schemas.createClientInviteSchema),
  requireAllPermissions("users.create"),
  controller.createInvite
);

router.patch(
  "/invites/:inviteId/revoke",
  validate(schemas.clientInviteIdSchema),
  requireAllPermissions("users.update"),
  controller.revokeInvite
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

router.patch(
  "/:clientId/password",
  validate(schemas.resetPasswordSchema),
  requireAllPermissions("users.update"),
  controller.resetPassword
);

module.exports = router;