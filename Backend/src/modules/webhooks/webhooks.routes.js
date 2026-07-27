const router =
  require("express").Router();

const controller =
  require("./webhooks.controller");

const schemas =
  require("./webhooks.validation");

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

router.post(
  "/endpoints",
  validate(
    schemas.createEndpoint
  ),
  requireAllPermissions(
    "webhooks.manage"
  ),
  controller.createEndpoint
);

router.get(
  "/endpoints",
  validate(
    schemas.listEndpoints
  ),
  requireAllPermissions(
    "webhooks.read"
  ),
  controller.listEndpoints
);

router.patch(
  "/endpoints/:endpointId",
  validate(
    schemas.updateEndpoint
  ),
  requireAllPermissions(
    "webhooks.manage"
  ),
  controller.updateEndpoint
);

router.get(
  "/deliveries",
  validate(
    schemas.listDeliveries
  ),
  requireAllPermissions(
    "webhooks.read"
  ),
  controller.listDeliveries
);

router.post(
  "/deliveries/:deliveryId/replay",
  validate(
    schemas.replayDelivery
  ),
  requireAllPermissions(
    "webhooks.replay"
  ),
  controller.replayDelivery
);

module.exports =
  router;
