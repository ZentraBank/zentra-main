const asyncHandler =
  require("../../utils/asyncHandler");

const {
  sendSuccess,
} = require("../../utils/response");

const service =
  require("./fraud-risk.service");

const evaluate =
  asyncHandler(async (req, res) => {
    const data =
      await service.evaluate({
        auth: req.auth,
        body: req.body,
      });

    return sendSuccess(
      res,
      {
        message:
          data.idempotent
            ? "Existing risk evaluation returned"
            : "Risk evaluation completed successfully",
        data,
      },
      data.idempotent
        ? 200
        : 201
    );
  });

const createRule =
  asyncHandler(async (req, res) => {
    const data =
      await service.createRule({
        auth: req.auth,
        body: req.body,
      });

    return sendSuccess(
      res,
      {
        message:
          "Risk rule created successfully",
        data,
      },
      201
    );
  });

const listRules =
  asyncHandler(async (req, res) => {
    const data =
      await service.listRules({
        auth: req.auth,
        query: req.query,
      });

    return sendSuccess(res, {
      message:
        "Risk rules retrieved successfully",
      data,
    });
  });

const updateRule =
  asyncHandler(async (req, res) => {
    const data =
      await service.updateRule({
        auth: req.auth,
        ruleId:
          req.params.ruleId,
        body: req.body,
      });

    return sendSuccess(res, {
      message:
        "Risk rule updated successfully",
      data,
    });
  });

const listFraudCases =
  asyncHandler(async (req, res) => {
    const data =
      await service.listFraudCases({
        auth: req.auth,
        query: req.query,
      });

    return sendSuccess(res, {
      message:
        "Fraud cases retrieved successfully",
      data,
    });
  });

const getFraudCase =
  asyncHandler(async (req, res) => {
    const data =
      await service.getFraudCase({
        auth: req.auth,
        caseId:
          req.params.caseId,
      });

    return sendSuccess(res, {
      message:
        "Fraud case retrieved successfully",
      data,
    });
  });

const updateFraudCase =
  asyncHandler(async (req, res) => {
    const data =
      await service.updateFraudCase({
        auth: req.auth,
        caseId:
          req.params.caseId,
        body: req.body,
      });

    return sendSuccess(res, {
      message:
        "Fraud case updated successfully",
      data,
    });
  });

module.exports = {
  evaluate,
  createRule,
  listRules,
  updateRule,
  listFraudCases,
  getFraudCase,
  updateFraudCase,
};
