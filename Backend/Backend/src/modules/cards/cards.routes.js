const router = require("express").Router();
const controller = require("./cards.controller");
const schema = require("./cards.validation");
const validate = require("../../middleware/validate.middleware");
const { resolveTenantMiddleware } = require("../../middleware/tenant.middleware");
const { authenticate } = require("../../middleware/auth.middleware");
const { requireAllPermissions } = require("../../middleware/permission.middleware");
const { requireActiveSubscription } = require("../../middleware/subscription.middleware");

router.use(resolveTenantMiddleware);
router.use(authenticate);

router.post(
  "/", validate(schema.create),
  requireAllPermissions("cards.create"),
  requireActiveSubscription,
  controller.createCard
);

router.get(
  "/me",
  requireAllPermissions("cards.read"),
  controller.listOwnCards
);

router.get(
  "/me/:cardId", validate(schema.id),
  requireAllPermissions("cards.read"),
  controller.getOwnCard
);

router.patch(
  "/me/:cardId/status", validate(schema.ownStatus),
  requireAllPermissions("cards.manage"),
  controller.changeOwnStatus
);

router.patch(
  "/admin/:cardId/status", validate(schema.adminStatus),
  requireAllPermissions("cards.manage"),
  controller.changeStatusAsAdmin
);

module.exports = router;
