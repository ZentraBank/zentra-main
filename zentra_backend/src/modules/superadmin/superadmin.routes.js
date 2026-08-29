const router = require("express").Router();
const controller = require("./superadmin.controller");
const schemas = require("./superadmin.validation");

const validate = require("../../middleware/validate.middleware");
const { authenticate } = require("../../middleware/auth.middleware");
const {
  requireAllPermissions,
} = require("../../middleware/permission.middleware");
const {
  requirePlatformScope,
} = require("../../middleware/platform-scope.middleware");

router.use(authenticate);
router.use(requirePlatformScope);

router.get(
  "/dashboard",
  requireAllPermissions("platform.dashboard.read"),
  controller.getDashboard
);

router.get(
  "/tenants",
  validate(schemas.listTenants),
  requireAllPermissions("platform.tenants.read"),
  controller.listTenants
);

router.post(
  "/tenants",
  validate(schemas.createTenant),
  requireAllPermissions("platform.tenants.create"),
  controller.createTenant
);

router.get(
  "/tenants/:tenantId",
  validate(schemas.tenantId),
  requireAllPermissions("platform.tenants.read"),
  controller.getTenant
);

router.patch(
  "/tenants/:tenantId/status",
  validate(schemas.updateTenantStatus),
  requireAllPermissions("platform.tenants.update"),
  controller.updateTenantStatus
);

router.patch(
  "/tenants/:tenantId/features",
  validate(schemas.updateTenantFeatures),
  requireAllPermissions("platform.tenants.features.manage"),
  controller.updateTenantFeatures
);

router.get(
  "/tenants/:tenantId/administrators",
  validate(schemas.tenantId),
  requireAllPermissions("platform.administrators.read"),
  controller.listTenantAdministrators
);

router.get(
  "/audit-logs",
  requireAllPermissions("platform.audit_logs.read"),
  controller.listAuditLogs
);

router.get(
  "/domains",

  validate(
    schemas.listTenantDomains
  ),

  requireAllPermissions(
    "platform.domains.read"
  ),

  controller.listTenantDomains
);

router.get(
  "/domains/:domainId",

  validate(
    schemas.tenantDomainId
  ),

  requireAllPermissions(
    "platform.domains.read"
  ),

  controller.getTenantDomain
);

router.get(
  "/domains",
  validate(
    schemas.listTenantDomains
  ),
  requireAllPermissions(
    "platform.domains.read"
  ),
  controller.listTenantDomains
);

router.get(
  "/domains/:domainId",
  validate(
    schemas.tenantDomainId
  ),
  requireAllPermissions(
    "platform.domains.read"
  ),
  controller.getTenantDomain
);

router.post(
  "/domains/:domainId/refresh",

  validate(
    schemas.tenantDomainId
  ),

  requireAllPermissions(
    "platform.domains.manage"
  ),

  controller.refreshTenantDomain
);

router.post(
  "/domains/:domainId/retry",

  validate(
    schemas.tenantDomainId
  ),

  requireAllPermissions(
    "platform.domains.manage"
  ),

  controller.retryTenantDomainProvisioning
);

router.delete(
  "/domains/:domainId",

  validate(
    schemas.tenantDomainId
  ),

  requireAllPermissions(
    "platform.domains.manage"
  ),

  controller.disconnectTenantDomain
);

module.exports = router;
