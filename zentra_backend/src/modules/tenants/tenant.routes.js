const express = require("express");

const tenantController =
  require("./tenant.controller");

const tenantSchemas =
  require("./tenant.validation");

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

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Tenant context + authentication
|--------------------------------------------------------------------------
*/

router.use(
  resolveTenantMiddleware
);

router.use(
  authenticate
);

/*
|--------------------------------------------------------------------------
| Current tenant profile
|--------------------------------------------------------------------------
*/

router.get(
  "/current",
  requireAllPermissions(
    "tenant.settings.read"
  ),
  tenantController.getCurrentTenant
);

router.patch(
  "/current",
  validate(
    tenantSchemas.updateCurrentTenant
  ),
  requireAllPermissions(
    "tenant.settings.manage"
  ),
  tenantController.updateCurrentTenant
);

/*
|--------------------------------------------------------------------------
| Tenant domains
|--------------------------------------------------------------------------
*/

router.get(
  "/current/domains",
  requireAllPermissions(
    "tenant.domains.read"
  ),
  tenantController.listCurrentTenantDomains
);

router.post(
  "/current/domains",
  validate(
    tenantSchemas.createDomain
  ),
  requireAllPermissions(
    "tenant.domains.manage"
  ),
  tenantController.createCurrentTenantDomain
);
router.post(
  "/current/domains/:domainId/verify",

  validate(
    tenantSchemas.domainId
  ),

  requireAllPermissions(
    "tenant.domains.manage"
  ),

  tenantController
    .verifyCurrentTenantDomain
);

router.get(
  "/current/domains/:domainId/status",

  validate(
    tenantSchemas.domainId
  ),

  requireAllPermissions(
    "tenant.domains.read"
  ),

  tenantController
    .refreshCurrentTenantDomainStatus
);

router.delete(
  "/current/domains/:domainId",

  validate(
    tenantSchemas.domainId
  ),

  requireAllPermissions(
    "tenant.domains.manage"
  ),

  tenantController
    .disconnectCurrentTenantDomain
);

router.get(
  "/current/platform-settings",

  requireAllPermissions(
    "tenant.settings.read"
  ),

  tenantController
    .getTenantPlatformSettings
);

module.exports = router;