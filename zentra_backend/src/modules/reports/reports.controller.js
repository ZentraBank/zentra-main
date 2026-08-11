const asyncHandler =
  require("../../utils/asyncHandler");

const {
  sendSuccess,
} = require("../../utils/response");

const service =
  require("./reports.service");

const getReport =
  asyncHandler(
    async (req, res) => {
      const data =
        await service.getReport({
          auth:
            req.auth,

          reportType:
            req.params.reportType,

          query:
            req.query,
        });

      return sendSuccess(
        res,
        {
          message:
            "Report retrieved successfully",

          data,
        }
      );
    }
  );

const exportNow =
  asyncHandler(
    async (req, res) => {
      const result =
        await service.exportNow({
          auth:
            req.auth,

          reportType:
            req.params.reportType,

          query:
            req.query,
        });

      res.setHeader(
        "Content-Type",
        result.contentType
      );

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${result.fileName}"`
      );

      res.setHeader(
        "X-Report-Export-Id",
        result.export.id
      );

      return res
        .status(200)
        .send(
          result.content
        );
    }
  );

const listMine =
  asyncHandler(
    async (req, res) => {
      const data =
        await service.listExports({
          auth:
            req.auth,

          query:
            req.query,
        });

      return sendSuccess(
        res,
        {
          message:
            "Report exports retrieved successfully",

          data,
        }
      );
    }
  );

const listAdmin =
  asyncHandler(
    async (req, res) => {
      const data =
        await service.listExports({
          auth:
            req.auth,

          query:
            req.query,

          adminView:
            true,
        });

      return sendSuccess(
        res,
        {
          message:
            "Report exports retrieved successfully",

          data,
        }
      );
    }
  );

const getMine =
  asyncHandler(
    async (req, res) => {
      const data =
        await service.getExport({
          auth:
            req.auth,

          exportId:
            req.params.exportId,
        });

      return sendSuccess(
        res,
        {
          message:
            "Report export retrieved successfully",

          data,
        }
      );
    }
  );

module.exports = {
  getReport,
  exportNow,
  listMine,
  listAdmin,
  getMine,
};
