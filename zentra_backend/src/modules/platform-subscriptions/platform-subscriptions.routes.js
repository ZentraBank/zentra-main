const router = require("express").Router();

const controller = require("./platform-subscriptions.controller");
const schemas = require("./platform-subscriptions.validation");

const validate =
  require("../../middleware/validate.middleware");

const {
  authenticate,
} = require("../../middleware/auth.middleware");

const {
  requirePlatformScope,
} = require("../../middleware/platform-scope.middleware");

const {
  requireAllPermissions,
} = require("../../middleware/permission.middleware");

router.use(authenticate);
router.use(requirePlatformScope);

router.get(
  "/plans",
  validate(schemas.listPlans),
  requireAllPermissions(
    "platform.subscriptions.read"
  ),
  controller.listPlans
);

router.post(
  "/plans",
  validate(schemas.createPlan),
  requireAllPermissions(
    "platform.subscriptions.create"
  ),
  controller.createPlan
);

router.get(
  "/plans/:planId",
  validate(schemas.planId),
  requireAllPermissions(
    "platform.subscriptions.read"
  ),
  controller.getPlan
);

router.patch(
  "/plans/:planId",
  validate(schemas.updatePlan),
  requireAllPermissions(
    "platform.subscriptions.update"
  ),
  controller.updatePlan
);

router.put(
  "/plans/:planId/features",
  validate(schemas.updatePlanFeatures),
  requireAllPermissions(
    "platform.subscriptions.update"
  ),
  controller.updatePlanFeatures
);

router.get(
  "/tenants/:tenantId",
  validate(schemas.tenantId),
  requireAllPermissions(
    "platform.subscriptions.read"
  ),
  controller.getTenantSubscription
);

router.get(
  "/requests",
  validate(schemas.listRequests),
  requireAllPermissions(
    "platform.subscriptions.read"
  ),
  controller.listRequests
);

router.get(
  "/requests/:requestId",
  validate(schemas.requestId),
  requireAllPermissions(
    "platform.subscriptions.read"
  ),
  controller.getRequest
);

router.get(
  "/requests/:requestId/payment-proof",
  validate(schemas.requestId),
  requireAllPermissions(
    "platform.subscriptions.read"
  ),
  controller.getPaymentProof
);

router.post(
  "/requests/:requestId/approve",
  validate(schemas.approveRequest),
  requireAllPermissions(
    "platform.subscriptions.update"
  ),
  controller.approveRequest
);

router.post(
  "/requests/:requestId/reject",
  validate(schemas.rejectRequest),
  requireAllPermissions(
    "platform.subscriptions.update"
  ),
  controller.rejectRequest
);

router.patch(
  "/tenants/:tenantId/plan",
  validate(schemas.changeTenantPlan),
  requireAllPermissions(
    "platform.subscriptions.update"
  ),
  controller.changeTenantPlan
);

router.patch(
  "/tenants/:tenantId/status",
  validate(schemas.changeTenantStatus),
  requireAllPermissions(
    "platform.subscriptions.cancel"
  ),
  controller.changeTenantStatus
);

router.post(
  "/tenants/:tenantId/renew",
  validate(schemas.renewTenantSubscription),
  requireAllPermissions(
    "platform.subscriptions.update"
  ),
  controller.renewTenantSubscription
);

router.put(
  "/tenants/:tenantId/override",
  validate(schemas.upsertTenantOverride),
  requireAllPermissions(
    "platform.subscriptions.update"
  ),
  controller.upsertTenantOverride
);

module.exports = router;
