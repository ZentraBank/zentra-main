const asyncHandler =
  require("../../utils/asyncHandler");

const {
  sendSuccess,
} = require("../../utils/response");

const service =
  require("./auditLogs.service");

const list = asyncHandler(
  async (req, res) => {
    const data =
      await service.listForTenant({
        tenantId:
          req.auth.tenantId,
        query:
          req.query,
      });

    return sendSuccess(
      res,
      {
        message:
          "Audit logs retrieved successfully",
        data,
      }
    );
  }
);

const getOne = asyncHandler(
  async (req, res) => {
    const data =
      await service.getForTenant({
        tenantId:
          req.auth.tenantId,
        auditLogId:
          req.params.auditLogId,
      });

    return sendSuccess(
      res,
      {
        message:
          "Audit log retrieved successfully",
        data,
      }
    );
  }
);

module.exports = {
  list,
  getOne,
};
