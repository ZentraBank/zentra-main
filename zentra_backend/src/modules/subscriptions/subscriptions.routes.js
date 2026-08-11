const router = require("express").Router();
const controller = require("./subscriptions.controller");
const schema = require("./subscriptions.validation");
const validate = require("../../middleware/validate.middleware");
const { resolveTenantMiddleware } =
  require("../../middleware/tenant.middleware");
const { authenticate } =
  require("../../middleware/auth.middleware");
const { requireAllPermissions } =
  require("../../middleware/permission.middleware");

router.use(resolveTenantMiddleware);

router.get("/plans", controller.listPlans);

router.use(authenticate);

router.get(
  "/me",
  requireAllPermissions("subscriptions.read"),
  controller.getMine
);

router.post(
  "/requests",
  validate(schema.startUpgrade),
  requireAllPermissions("subscriptions.read"),
  controller.startUpgrade
);

router.patch(
  "/requests/:requestId/payment-proof",
  validate(schema.proof),
  requireAllPermissions("subscriptions.read"),
  controller.submitProof
);

router.get(
  "/admin/requests/pending",
  validate(schema.pending),
  requireAllPermissions("subscriptions.manage"),
  controller.listPending
);

router.post(
  "/admin/requests/:requestId/approve",
  validate(schema.approve),
  requireAllPermissions("subscriptions.manage"),
  controller.approve
);

router.post(
  "/admin/requests/:requestId/reject",
  validate(schema.reject),
  requireAllPermissions("subscriptions.manage"),
  controller.reject
);

module.exports = router;
