const router =
  require("express").Router();

const controller =
  require("./approvals.controller");

const schemas =
  require("./approvals.validation");

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
  "/policies",
  validate(
    schemas.createPolicy
  ),
  requireAllPermissions(
    "approvals.policies.manage"
  ),
  controller.createPolicy
);

router.get(
  "/policies",
  validate(
    schemas.listPolicies
  ),
  requireAllPermissions(
    "approvals.policies.read"
  ),
  controller.listPolicies
);

router.patch(
  "/policies/:policyId",
  validate(
    schemas.updatePolicy
  ),
  requireAllPermissions(
    "approvals.policies.manage"
  ),
  controller.updatePolicy
);

router.post(
  "/requests",
  validate(
    schemas.createRequest
  ),
  requireAllPermissions(
    "approvals.request"
  ),
  controller.createRequest
);

router.get(
  "/requests",
  validate(
    schemas.listRequests
  ),
  requireAllPermissions(
    "approvals.read"
  ),
  controller.listRequests
);

router.get(
  "/requests/mine",
  validate(
    schemas.listRequests
  ),
  requireAllPermissions(
    "approvals.request"
  ),
  controller.listMine
);

router.get(
  "/requests/:requestId",
  validate(
    schemas.requestId
  ),
  requireAllPermissions(
    "approvals.read"
  ),
  controller.getRequest
);

router.post(
  "/requests/:requestId/decide",
  validate(
    schemas.decide
  ),
  requireAllPermissions(
    "approvals.decide"
  ),
  controller.decide
);

router.post(
  "/requests/:requestId/cancel",
  validate(
    schemas.requestId
  ),
  requireAllPermissions(
    "approvals.request"
  ),
  controller.cancelRequest
);

router.post(
  "/requests/expire",
  requireAllPermissions(
    "approvals.manage"
  ),
  controller.expireRequests
);

module.exports =
  router;
