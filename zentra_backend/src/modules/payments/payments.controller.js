const asyncHandler =
  require("../../utils/asyncHandler");

const {
  sendSuccess,
} = require("../../utils/response");

const service =
  require("./payments.service");

const createRail =
  asyncHandler(async (req, res) => {
    const data =
      await service.createRail({
        auth: req.auth,
        body: req.body,
      });

    return sendSuccess(
      res,
      {
        message:
          "Payment rail created successfully",
        data,
      },
      201
    );
  });

const listRails =
  asyncHandler(async (req, res) => {
    const data =
      await service.listRails({
        auth: req.auth,
        query: req.query,
      });

    return sendSuccess(res, {
      message:
        "Payment rails retrieved successfully",
      data,
    });
  });

const createInstruction =
  asyncHandler(async (req, res) => {
    const data =
      await service.createInstruction({
        auth: req.auth,
        body: req.body,
      });

    return sendSuccess(
      res,
      {
        message:
          data.idempotent
            ? "Existing payment instruction returned"
            : "Payment instruction created successfully",
        data,
      },
      data.idempotent ? 200 : 201
    );
  });

const listMine =
  asyncHandler(async (req, res) => {
    const data =
      await service.listInstructions({
        auth: req.auth,
        query: req.query,
        mine: true,
      });

    return sendSuccess(res, {
      message:
        "Your payment instructions were retrieved successfully",
      data,
    });
  });

const listInstructions =
  asyncHandler(async (req, res) => {
    const data =
      await service.listInstructions({
        auth: req.auth,
        query: req.query,
      });

    return sendSuccess(res, {
      message:
        "Payment instructions retrieved successfully",
      data,
    });
  });

const validateInstruction =
  asyncHandler(async (req, res) => {
    const data =
      await service.validateInstruction({
        auth: req.auth,
        instructionId:
          req.params.instructionId,
      });

    return sendSuccess(res, {
      message:
        "Payment instruction validated successfully",
      data,
    });
  });

const submitInstruction =
  asyncHandler(async (req, res) => {
    const data =
      await service.submitInstruction({
        auth: req.auth,
        instructionId:
          req.params.instructionId,
        body: req.body,
      });

    return sendSuccess(res, {
      message:
        "Payment instruction status updated successfully",
      data,
    });
  });

const markCleared =
  asyncHandler(async (req, res) => {
    const data =
      await service.markCleared({
        auth: req.auth,
        instructionId:
          req.params.instructionId,
        body: req.body,
      });

    return sendSuccess(res, {
      message:
        "Payment instruction marked as cleared",
      data,
    });
  });

const createClearingBatch =
  asyncHandler(async (req, res) => {
    const data =
      await service.createClearingBatch({
        auth: req.auth,
        body: req.body,
      });

    return sendSuccess(
      res,
      {
        message:
          "Clearing batch created successfully",
        data,
      },
      201
    );
  });

const addInstructionToBatch =
  asyncHandler(async (req, res) => {
    const data =
      await service.addInstructionToBatch({
        auth: req.auth,
        batchId:
          req.params.batchId,
        instructionId:
          req.params.instructionId,
      });

    return sendSuccess(res, {
      message:
        "Payment instruction added to clearing batch",
      data,
    });
  });

const calculateSettlement =
  asyncHandler(async (req, res) => {
    const data =
      await service.calculateSettlement({
        auth: req.auth,
        body: req.body,
      });

    return sendSuccess(
      res,
      {
        message:
          "Settlement batch calculated successfully",
        data,
      },
      201
    );
  });

const postSettlement =
  asyncHandler(async (req, res) => {
    const data =
      await service.postSettlement({
        auth: req.auth,
        settlementBatchId:
          req.params.settlementBatchId,
      });

    return sendSuccess(res, {
      message:
        "Settlement batch posted successfully",
      data,
    });
  });

module.exports = {
  createRail,
  listRails,
  createInstruction,
  listMine,
  listInstructions,
  validateInstruction,
  submitInstruction,
  markCleared,
  createClearingBatch,
  addInstructionToBatch,
  calculateSettlement,
  postSettlement,
};
