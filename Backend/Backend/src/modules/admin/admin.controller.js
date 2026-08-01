const adminService = require("./admin.service");

async function getDashboardStats(req, res, next) {
  try {
    const stats = await adminService.getDashboardStats({
      tenantId: req.tenant.id,
      user: req.user,
    });

    return res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDashboardStats,
};