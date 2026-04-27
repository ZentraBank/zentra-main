const tenantService = require("../modules/tenants/tenant.service");

async function tenantMiddleware(req, res, next) {
  try {
    const tenant = await tenantService.resolveTenant(req.headers.host);

    req.tenant = tenant;

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = tenantMiddleware;