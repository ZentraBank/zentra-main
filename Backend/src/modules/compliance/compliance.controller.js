const asyncHandler =
  require("../../utils/asyncHandler");

const {
  sendSuccess,
} = require("../../utils/response");

const service =
  require("./compliance.service");

const screen =
  asyncHandler(async (req, res) => {
    const data =
      await service.screen({
        auth: req.auth,
        body: req.body,
      });

    return sendSuccess(
      res,
      {
        message:
          data.idempotent
            ? "Existing compliance screening returned"
            : "Compliance screening completed successfully",
        data,
      },
      data.idempotent
        ? 200
        : 201
    );
  });

const monitorTransaction =
  asyncHandler(async (req, res) => {
    const data =
      await service.monitorTransaction({
        auth: req.auth,
        body: req.body,
      });

    return sendSuccess(
      res,
      {
        message:
          data.alertCreated
            ? "Transaction monitoring alert created"
            : "Transaction monitoring completed with no alert",
        data,
      },
      data.alertCreated
        ? 201
        : 200
    );
  });

const createMonitoringRule =
  asyncHandler(async (req, res) => {
    const data =
      await service.createMonitoringRule({
        auth: req.auth,
        body: req.body,
      });

    return sendSuccess(
      res,
      {
        message:
          "Transaction monitoring rule created successfully",
        data,
      },
      201
    );
  });

const updateRiskProfile =
  asyncHandler(async (req, res) => {
    const data =
      await service.updateRiskProfile({
        auth: req.auth,
        userId:
          req.params.userId,
        body: req.body,
      });

    return sendSuccess(res, {
      message:
        "Customer risk profile updated successfully",
      data,
    });
  });

const listAlerts =
  asyncHandler(async (req, res) => {
    const data =
      await service.listAlerts({
        auth: req.auth,
        query: req.query,
      });

    return sendSuccess(res, {
      message:
        "Compliance alerts retrieved successfully",
      data,
    });
  });

const updateAlert =
  asyncHandler(async (req, res) => {
    const data =
      await service.updateAlert({
        auth: req.auth,
        alertId:
          req.params.alertId,
        body: req.body,
      });

    return sendSuccess(res, {
      message:
        "Compliance alert updated successfully",
      data,
    });
  });

const createCase =
  asyncHandler(async (req, res) => {
    const data =
      await service.createCase({
        auth: req.auth,
        body: req.body,
      });

    return sendSuccess(
      res,
      {
        message:
          "Compliance case created successfully",
        data,
      },
      201
    );
  });

const getCase =
  asyncHandler(async (req, res) => {
    const data =
      await service.getCase({
        auth: req.auth,
        caseId:
          req.params.caseId,
      });

    return sendSuccess(res, {
      message:
        "Compliance case retrieved successfully",
      data,
    });
  });

const updateCase =
  asyncHandler(async (req, res) => {
    const data =
      await service.updateCase({
        auth: req.auth,
        caseId:
          req.params.caseId,
        body: req.body,
      });

    return sendSuccess(res, {
      message:
        "Compliance case updated successfully",
      data,
    });
  });

const createSar =
  asyncHandler(async (req, res) => {
    const data =
      await service.createSar({
        auth: req.auth,
        caseId:
          req.params.caseId,
        body: req.body,
      });

    return sendSuccess(
      res,
      {
        message:
          "Suspicious activity report draft created successfully",
        data,
      },
      201
    );
  });

module.exports = {
  screen,
  monitorTransaction,
  createMonitoringRule,
  updateRiskProfile,
  listAlerts,
  updateAlert,
  createCase,
  getCase,
  updateCase,
  createSar,
};
