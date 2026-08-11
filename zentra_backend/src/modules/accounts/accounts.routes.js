const router = require("express").Router();
const controller = require("./accounts.controller");
const schemas = require("./accounts.validation");
const validate = require("../../middleware/validate.middleware");
const { resolveTenantMiddleware } =
  require("../../middleware/tenant.middleware");
const { authenticate } =
  require("../../middleware/auth.middleware");
const { requireAllPermissions } =
  require("../../middleware/permission.middleware");
const { requireActiveSubscription } =
  require("../../middleware/subscription.middleware");

router.use(resolveTenantMiddleware);
router.use(authenticate);

router.get(
  "/me",
  requireAllPermissions("accounts.read"),
  controller.listOwn
);

router.get(
  "/me/:accountId",
  validate(schemas.accountIdSchema),
  requireAllPermissions("accounts.read"),
  controller.getOwn
);

router.post(
  "/",
  validate(schemas.createAccountSchema),
  requireAllPermissions("accounts.create"),
  requireActiveSubscription,
  controller.createOwn
);

router.patch(
  "/:accountId/status",
  validate(schemas.statusSchema),
  requireAllPermissions("accounts.manage"),
  controller.setStatus
);

module.exports = router;
