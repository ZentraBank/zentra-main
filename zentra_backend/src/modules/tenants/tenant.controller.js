const asyncHandler = require("../../utils/asyncHandler");
const {
  sendSuccess,
} = require("../../utils/response");

const tenantService = require("./tenant.service");

const getCurrentTenant = asyncHandler(
  async (req, res) => {
    const configuration =
      await tenantService.getCurrentTenantConfiguration(
        req.tenant
      );

    return sendSuccess(res, {
      message:
        "Tenant configuration retrieved successfully",
      data: configuration,
    });
  }
);

module.exports = {
  getCurrentTenant,
};