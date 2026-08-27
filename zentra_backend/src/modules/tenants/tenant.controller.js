const asyncHandler = require("../../utils/asyncHandler");
const { sendSuccess } = require("../../utils/response");
const tenantService = require("./tenant.service");
const platformSettingsService =
  require(
    "../platform-settings/platform-settings.service"
  );
  

const getCurrentTenant = asyncHandler(
  async (req, res) => {
    const data =
      await tenantService.getCurrentTenantConfiguration(
        req.auth.tenantId
      );

    return sendSuccess(res, {
      message:
        "Tenant configuration retrieved successfully.",
      data,
    });
  }
);

const updateCurrentTenant = asyncHandler(
  async (req, res) => {
    const data =
      await tenantService.updateCurrentTenantProfile({
        tenantId: req.auth.tenantId,
        body: req.body,
      });

    return sendSuccess(res, {
      message:
        "Tenant profile updated successfully.",
      data,
    });
  }
);

const listCurrentTenantDomains = asyncHandler(
  async (req, res) => {
    const data =
      await tenantService.listCurrentTenantDomains(
        req.auth.tenantId
      );

    return sendSuccess(res, {
      message:
        "Tenant domains retrieved successfully.",
      data,
    });
  }
);

const createCurrentTenantDomain = asyncHandler(
  async (req, res) => {
    const data =
      await tenantService.createCustomDomainRequest({
        tenantId: req.auth.tenantId,
        domain: req.body.domain,
      });

    return sendSuccess(res, {
      statusCode: 201,
      message:
        "Custom domain request created successfully.",
      data,
    });
  }
);

const verifyCurrentTenantDomain =
  asyncHandler(
    async (req, res) => {
      const data =
        await tenantService.verifyCurrentTenantDomain({
          tenantId:
            req.auth.tenantId,

          domainId:
            req.params.domainId,
        });

      return sendSuccess(res, {
        message:
          "Domain verification completed.",
        data,
      });
    }
  );

const refreshCurrentTenantDomainStatus =
  asyncHandler(
    async (req, res) => {
      const data =
        await tenantService
          .refreshCurrentTenantDomainStatus({
            tenantId:
              req.auth.tenantId,

            domainId:
              req.params.domainId,
          });

      return sendSuccess(res, {
        message:
          "Domain status refreshed successfully.",
        data,
      });
    }
  );

  const disconnectCurrentTenantDomain =
  asyncHandler(
    async (req, res) => {
      const data =
        await tenantService
          .disconnectCurrentTenantDomain({
            tenantId:
              req.auth.tenantId,

            domainId:
              req.params.domainId,
          });

      return sendSuccess(res, {
        message:
          "Custom domain disconnected successfully.",
        data,
      });
    }
  );

  const getTenantPlatformSettings =
  asyncHandler(
    async (req, res) => {
      const data =
        await platformSettingsService
          .listTenantFacingSettings();

      return sendSuccess(res, {
        message:
          "Tenant platform settings retrieved successfully.",
        data,
      });
    }
  );

module.exports = {
  getCurrentTenant,
  updateCurrentTenant,
  listCurrentTenantDomains,
  createCurrentTenantDomain,
  verifyCurrentTenantDomain,
  refreshCurrentTenantDomainStatus,
  disconnectCurrentTenantDomain,

  getTenantPlatformSettings,
};  