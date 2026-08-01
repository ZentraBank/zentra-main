const platformService = require("./platform.service");
const { getPagination, cleanFilters } = require("../../utils/query");

async function getTenants(req, res, next) {
  try {
    const { limit, page, offset } = getPagination(req.query);
    const filters = cleanFilters(req.query, ["status"]);

    const tenants = await platformService.getTenants({
      user: req.user,
      limit,
      offset,
      filters,
    });

    return res.json({
      success: true,
      meta: { page, limit, filters },
      data: { tenants },
    });
  } catch (error) {
    next(error);
  }
}

async function getTenantDetails(req, res, next) {
  try {
    const tenant = await platformService.getTenantDetails({
      user: req.user,
      tenantId: req.params.id,
    });

    return res.json({
      success: true,
      data: { tenant },
    });
  } catch (error) {
    next(error);
  }
}

async function suspendTenant(req, res, next) {
  try {
    await platformService.suspendTenant({
      user: req.user,
      tenantId: req.params.id,
      currentTenantId: req.tenant.id,
    });

    return res.json({
      success: true,
      message: "Tenant suspended successfully",
    });
  } catch (error) {
    next(error);
  }
}

async function activateTenant(req, res, next) {
  try {
    await platformService.activateTenant({
      user: req.user,
      tenantId: req.params.id,
      currentTenantId: req.tenant.id,
    });

    return res.json({
      success: true,
      message: "Tenant activated successfully",
    });
  } catch (error) {
    next(error);
  }
}

async function updateTenantSubscriptionStatus(req, res, next) {
  try {
    await platformService.setTenantSubscriptionStatus({
      user: req.user,
      tenantId: req.params.id,
      subscription_status: req.body.subscription_status,
      currentTenantId: req.tenant.id,
    });

    return res.json({
      success: true,
      message: "Tenant subscription status updated",
    });
  } catch (error) {
    next(error);
  }
}

async function getGlobalDashboard(req, res, next) {
  try {
    const dashboard = await platformService.getGlobalDashboard({
      user: req.user,
    });

    return res.json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getTenants,
  getTenantDetails,
  suspendTenant,
  activateTenant,
  updateTenantSubscriptionStatus,
  getGlobalDashboard,
};