const router = require("express").Router();
const controller = require("./transfers.controller");
const schemas = require("./transfers.validation");
const validate = require("../../middleware/validate.middleware");
const { resolveTenantMiddleware } = require("../../middleware/tenant.middleware");
const { authenticate } = require("../../middleware/auth.middleware");
const { requireAllPermissions } = require("../../middleware/permission.middleware");
const { requireActiveSubscription } = require("../../middleware/subscription.middleware");


router.use(resolveTenantMiddleware);
router.use(authenticate);

router.post(
  "/internal",
  validate(schemas.createTransferSchema),
  requireAllPermissions("transfers.create"),
  requireActiveSubscription,
  controller.createInternal
);

router.get(
  "/me",
  validate(schemas.listTransfersSchema),
  requireAllPermissions("transfers.read"),
  controller.listOwn
);

router.get(
  "/me/:transferId",
  validate(schemas.transferIdSchema),
  requireAllPermissions("transfers.read"),
  controller.getOwn
);

module.exports = router;
