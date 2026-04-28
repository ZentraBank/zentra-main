const auditService = require("./audit.service");
const { getPagination, cleanFilters } = require("../../utils/query");

async function getAuditLogs(req, res, next) {
  try {
    const { limit, page, offset } = getPagination(req.query);
    const filters = cleanFilters(req.query, ["action", "entity_type"]);

    const logs = await auditService.getAuditLogs({
      tenantId: req.tenant.id,
      user: req.user,
      limit,
      offset,
      filters,
    });

    return res.json({
      success: true,
      meta: {
        page,
        limit,
        filters,
      },
      data: { logs },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAuditLogs,
};