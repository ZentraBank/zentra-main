const asyncHandler =
  require("../../utils/asyncHandler");

const {
  sendSuccess,
} = require("../../utils/response");

const service =
  require("./third-party.service");

const createThirdParty =
  asyncHandler(async (req, res) => {
    const data =
      await service.createThirdParty({
        auth: req.auth,
        body: req.body,
      });

    return sendSuccess(
      res,
      {
        message:
          "Third party created successfully",
        data,
      },
      201
    );
  });

const updateThirdPartyStatus =
  asyncHandler(async (req, res) => {
    const data =
      await service.updateThirdPartyStatus({
        auth: req.auth,
        thirdPartyId:
          req.params.thirdPartyId,
        body: req.body,
      });

    return sendSuccess(res, {
      message:
        "Third-party status updated successfully",
      data,
    });
  });

const createService =
  asyncHandler(async (req, res) => {
    const data =
      await service.createService({
        auth: req.auth,
        thirdPartyId:
          req.params.thirdPartyId,
        body: req.body,
      });

    return sendSuccess(
      res,
      {
        message:
          "Third-party service created successfully",
        data,
      },
      201
    );
  });

const createDueDiligence =
  asyncHandler(async (req, res) => {
    const data =
      await service.createDueDiligence({
        auth: req.auth,
        thirdPartyId:
          req.params.thirdPartyId,
        body: req.body,
      });

    return sendSuccess(
      res,
      {
        message:
          "Third-party due diligence created successfully",
        data,
      },
      201
    );
  });

const completeDueDiligence =
  asyncHandler(async (req, res) => {
    const data =
      await service.completeDueDiligence({
        auth: req.auth,
        assessmentId:
          req.params.assessmentId,
        body: req.body,
      });

    return sendSuccess(res, {
      message:
        "Third-party due diligence completed successfully",
      data,
    });
  });

const reviewDueDiligence =
  asyncHandler(async (req, res) => {
    const data =
      await service.reviewDueDiligence({
        auth: req.auth,
        assessmentId:
          req.params.assessmentId,
        body: req.body,
      });

    return sendSuccess(res, {
      message:
        "Third-party due diligence reviewed successfully",
      data,
    });
  });

const createContract =
  asyncHandler(async (req, res) => {
    const data =
      await service.createContract({
        auth: req.auth,
        thirdPartyId:
          req.params.thirdPartyId,
        body: req.body,
      });

    return sendSuccess(
      res,
      {
        message:
          "Third-party contract created successfully",
        data,
      },
      201
    );
  });

const createSla =
  asyncHandler(async (req, res) => {
    const data =
      await service.createSla({
        auth: req.auth,
        serviceId:
          req.params.serviceId,
        body: req.body,
      });

    return sendSuccess(
      res,
      {
        message:
          "Third-party SLA created successfully",
        data,
      },
      201
    );
  });

const recordSlaMeasurement =
  asyncHandler(async (req, res) => {
    const data =
      await service.recordSlaMeasurement({
        auth: req.auth,
        slaId:
          req.params.slaId,
        body: req.body,
      });

    return sendSuccess(
      res,
      {
        message:
          "SLA measurement recorded successfully",
        data,
      },
      201
    );
  });

const createRiskIssue =
  asyncHandler(async (req, res) => {
    const data =
      await service.createRiskIssue({
        auth: req.auth,
        thirdPartyId:
          req.params.thirdPartyId,
        body: req.body,
      });

    return sendSuccess(
      res,
      {
        message:
          "Third-party risk issue created successfully",
        data,
      },
      201
    );
  });

const createExitPlan =
  asyncHandler(async (req, res) => {
    const data =
      await service.createExitPlan({
        auth: req.auth,
        thirdPartyId:
          req.params.thirdPartyId,
        body: req.body,
      });

    return sendSuccess(
      res,
      {
        message:
          "Third-party exit plan created successfully",
        data,
      },
      201
    );
  });

module.exports = {
  createThirdParty,
  updateThirdPartyStatus,
  createService,
  createDueDiligence,
  completeDueDiligence,
  reviewDueDiligence,
  createContract,
  createSla,
  recordSlaMeasurement,
  createRiskIssue,
  createExitPlan,
};
