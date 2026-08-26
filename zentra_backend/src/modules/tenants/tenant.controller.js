const asyncHandler = require("../../utils/asyncHandler");
const { sendSuccess } = require("../../utils/response");
const tenantService = require("./tenant.service");

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

module.exports = {
  getCurrentTenant,
  updateCurrentTenant,
};