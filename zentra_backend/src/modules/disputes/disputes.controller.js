const asyncHandler =
  require("../../utils/asyncHandler");

const {
  sendSuccess,
} = require("../../utils/response");

const service =
  require("./disputes.service");

const createDispute =
  asyncHandler(async (req, res) => {
    const data =
      await service.createDispute({
        auth: req.auth,
        body: req.body,
      });

    return sendSuccess(
      res,
      {
        message:
          "Dispute submitted successfully",
        data,
      },
      201
    );
  });

const listMine =
  asyncHandler(async (req, res) => {
    const data =
      await service.listDisputes({
        auth: req.auth,
        query: req.query,
        mine: true,
      });

    return sendSuccess(res, {
      message:
        "Your disputes were retrieved successfully",
      data,
    });
  });

const listDisputes =
  asyncHandler(async (req, res) => {
    const data =
      await service.listDisputes({
        auth: req.auth,
        query: req.query,
      });

    return sendSuccess(res, {
      message:
        "Disputes retrieved successfully",
      data,
    });
  });

const getDispute =
  asyncHandler(async (req, res) => {
    const data =
      await service.getDispute({
        auth: req.auth,
        disputeId:
          req.params.disputeId,
      });

    return sendSuccess(res, {
      message:
        "Dispute retrieved successfully",
      data,
    });
  });

const updateDispute =
  asyncHandler(async (req, res) => {
    const data =
      await service.updateDispute({
        auth: req.auth,
        disputeId:
          req.params.disputeId,
        body: req.body,
      });

    return sendSuccess(res, {
      message:
        "Dispute updated successfully",
      data,
    });
  });

const addEvidence =
  asyncHandler(async (req, res) => {
    const data =
      await service.addEvidence({
        auth: req.auth,
        disputeId:
          req.params.disputeId,
        body: req.body,
        submitterType:
          req.body.submitterType ||
          "customer",
      });

    return sendSuccess(
      res,
      {
        message:
          "Dispute evidence added successfully",
        data,
      },
      201
    );
  });

const reviewEvidence =
  asyncHandler(async (req, res) => {
    const data =
      await service.reviewEvidence({
        auth: req.auth,
        evidenceId:
          req.params.evidenceId,
        body: req.body,
      });

    return sendSuccess(res, {
      message:
        "Dispute evidence reviewed successfully",
      data,
    });
  });

const createRefund =
  asyncHandler(async (req, res) => {
    const data =
      await service.createAndPostRefund({
        auth: req.auth,
        disputeId:
          req.params.disputeId,
        body: req.body,
      });

    return sendSuccess(
      res,
      {
        message:
          data.idempotent
            ? "Existing dispute refund returned"
            : "Dispute refund posted successfully",
        data,
      },
      data.idempotent
        ? 200
        : 201
    );
  });

const createChargeback =
  asyncHandler(async (req, res) => {
    const data =
      await service.createChargeback({
        auth: req.auth,
        disputeId:
          req.params.disputeId,
        body: req.body,
      });

    return sendSuccess(
      res,
      {
        message:
          "Chargeback record created successfully",
        data,
      },
      201
    );
  });

const updateChargeback =
  asyncHandler(async (req, res) => {
    const data =
      await service.updateChargeback({
        auth: req.auth,
        chargebackId:
          req.params.chargebackId,
        body: req.body,
      });

    return sendSuccess(res, {
      message:
        "Chargeback record updated successfully",
      data,
    });
  });

module.exports = {
  createDispute,
  listMine,
  listDisputes,
  getDispute,
  updateDispute,
  addEvidence,
  reviewEvidence,
  createRefund,
  createChargeback,
  updateChargeback,
};
