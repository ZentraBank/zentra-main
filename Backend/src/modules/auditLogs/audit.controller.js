const auditService = require("./audit.service");

async function getAuditLogs(req, res, next) {
  try {
    const logs = await auditService.getAuditLogs({
      tenantId: req.tenant.id,
      user: req.user,
    });

    return res.json({
      success: true,
      data: { logs },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAuditLogs,
};