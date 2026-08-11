const asyncHandler =
  require("../../utils/asyncHandler");

const {
  sendSuccess,
} = require("../../utils/response");

const service =
  require("./treasury.service");

const createFeeDefinition =
  asyncHandler(async (req, res) => {
    const data =
      await service.createFeeDefinition({
        auth: req.auth,
        body: req.body,
      });

    return sendSuccess(
      res,
      {
        message:
          "Fee definition created successfully",
        data,
      },
      201
    );
  });

const listFeeDefinitions =
  asyncHandler(async (req, res) => {
    const data =
      await service.listFeeDefinitions({
        auth: req.auth,
        query: req.query,
      });

    return sendSuccess(res, {
      message:
        "Fee definitions retrieved successfully",
      data,
    });
  });

const assessFee =
  asyncHandler(async (req, res) => {
    const data =
      await service.assessFee({
        auth: req.auth,
        body: req.body,
      });

    return sendSuccess(
      res,
      {
        message:
          data.idempotent
            ? "Existing fee assessment returned"
            : data.feeApplicable === false
            ? "No fee was applicable"
            : "Fee assessed successfully",
        data,
      },
      data.idempotent
        ? 200
        : 201
    );
  });

const postFee =
  asyncHandler(async (req, res) => {
    const data =
      await service.postFee({
        auth: req.auth,
        assessmentId:
          req.params.assessmentId,
      });

    return sendSuccess(res, {
      message:
        "Fee posted successfully",
      data,
    });
  });

const waiveFee =
  asyncHandler(async (req, res) => {
    const data =
      await service.waiveFee({
        auth: req.auth,
        assessmentId:
          req.params.assessmentId,
        body: req.body,
      });

    return sendSuccess(res, {
      message:
        "Fee waived successfully",
      data,
    });
  });

const createInterestProduct =
  asyncHandler(async (req, res) => {
    const data =
      await service.createInterestProduct({
        auth: req.auth,
        body: req.body,
      });

    return sendSuccess(
      res,
      {
        message:
          "Interest product created successfully",
        data,
      },
      201
    );
  });

const listInterestProducts =
  asyncHandler(async (req, res) => {
    const data =
      await service.listInterestProducts({
        auth: req.auth,
        query: req.query,
      });

    return sendSuccess(res, {
      message:
        "Interest products retrieved successfully",
      data,
    });
  });

const accrueInterest =
  asyncHandler(async (req, res) => {
    const data =
      await service.accrueInterest({
        auth: req.auth,
        body: req.body,
      });

    return sendSuccess(
      res,
      {
        message:
          data.idempotent
            ? "Existing interest accrual returned"
            : "Interest accrued successfully",
        data,
      },
      data.idempotent
        ? 200
        : 201
    );
  });

const postInterest =
  asyncHandler(async (req, res) => {
    const data =
      await service.postInterest({
        auth: req.auth,
        accrualId:
          req.params.accrualId,
      });

    return sendSuccess(res, {
      message:
        "Interest posted successfully",
      data,
    });
  });

const createTreasuryPosition =
  asyncHandler(async (req, res) => {
    const data =
      await service.createTreasuryPosition({
        auth: req.auth,
        body: req.body,
      });

    return sendSuccess(
      res,
      {
        message:
          "Treasury position calculated successfully",
        data,
      },
      201
    );
  });

module.exports = {
  createFeeDefinition,
  listFeeDefinitions,
  assessFee,
  postFee,
  waiveFee,
  createInterestProduct,
  listInterestProducts,
  accrueInterest,
  postInterest,
  createTreasuryPosition,
};
