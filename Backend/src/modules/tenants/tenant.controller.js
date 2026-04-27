const tenantService = require("./tenant.service");

async function getCurrentTenant(req, res, next) {
  try {
    return res.json({
      success: true,
      data: {
        tenant: req.tenant,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function createTenant(req, res, next) {
  try {
    const tenant = await tenantService.createTenant(req.body);

    return res.status(201).json({
      success: true,
      message: "Tenant created",
      data: tenant,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCurrentTenant,
  createTenant,
};