const asyncHandler =
  require("../../utils/asyncHandler");

const {
  sendSuccess,
} = require("../../utils/response");

const service =
  require("./jobs.service");

const createDefinition =
  asyncHandler(async (req, res) => {
    const data =
      await service.createDefinition({
        auth: req.auth,
        body: req.body,
      });

    return sendSuccess(
      res,
      {
        message:
          "Scheduled job definition created successfully",
        data,
      },
      201
    );
  });

const listDefinitions =
  asyncHandler(async (req, res) => {
    const data =
      await service.listDefinitions({
        auth: req.auth,
        query: req.query,
      });

    return sendSuccess(res, {
      message:
        "Scheduled job definitions retrieved successfully",
      data,
    });
  });

const updateStatus =
  asyncHandler(async (req, res) => {
    const data =
      await service.updateDefinitionStatus({
        auth: req.auth,
        definitionId:
          req.params.definitionId,
        status:
          req.body.status,
      });

    return sendSuccess(res, {
      message:
        "Scheduled job status updated successfully",
      data,
    });
  });

const runNow =
  asyncHandler(async (req, res) => {
    const data =
      await service.runNow({
        auth: req.auth,
        definitionId:
          req.params.definitionId,
        body: req.body,
      });

    return sendSuccess(
      res,
      {
        message:
          "Scheduled job queued successfully",
        data,
      },
      202
    );
  });

const listRuns =
  asyncHandler(async (req, res) => {
    const data =
      await service.listRuns({
        auth: req.auth,
        query: req.query,
      });

    return sendSuccess(res, {
      message:
        "Scheduled job runs retrieved successfully",
      data,
    });
  });

module.exports = {
  createDefinition,
  listDefinitions,
  updateStatus,
  runNow,
  listRuns,
};
