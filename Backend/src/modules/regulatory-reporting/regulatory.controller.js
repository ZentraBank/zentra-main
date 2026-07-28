const asyncHandler =
  require("../../utils/asyncHandler");

const {
  sendSuccess,
} = require("../../utils/response");

const service =
  require("./regulatory.service");

const createAuthority =
  asyncHandler(async (req, res) => {
    const data =
      await service.createAuthority({
        auth: req.auth,
        body: req.body,
      });

    return sendSuccess(
      res,
      {
        message:
          "Regulatory authority created successfully",
        data,
      },
      201
    );
  });

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
          "Regulatory report definition created successfully",
        data,
      },
      201
    );
  });

const createRun =
  asyncHandler(async (req, res) => {
    const data =
      await service.createRun({
        auth: req.auth,
        body: req.body,
      });

    return sendSuccess(
      res,
      {
        message:
          "Regulatory report run created successfully",
        data,
      },
      201
    );
  });

const uploadRecords =
  asyncHandler(async (req, res) => {
    const data =
      await service.uploadRecords({
        auth: req.auth,
        runId:
          req.params.runId,
        body: req.body,
      });

    return sendSuccess(res, {
      message:
        "Regulatory report records loaded successfully",
      data,
    });
  });

const validateRun =
  asyncHandler(async (req, res) => {
    const data =
      await service.validateRun({
        auth: req.auth,
        runId:
          req.params.runId,
        body: req.body,
      });

    return sendSuccess(res, {
      message:
        "Regulatory report validation completed",
      data,
    });
  });

const approveRun =
  asyncHandler(async (req, res) => {
    const data =
      await service.approveRun({
        auth: req.auth,
        runId:
          req.params.runId,
      });

    return sendSuccess(res, {
      message:
        "Regulatory report approved successfully",
      data,
    });
  });

const attachGeneratedFile =
  asyncHandler(async (req, res) => {
    const data =
      await service.attachGeneratedFile({
        auth: req.auth,
        runId:
          req.params.runId,
        body: req.body,
      });

    return sendSuccess(res, {
      message:
        "Generated regulatory report file attached successfully",
      data,
    });
  });

const createSubmission =
  asyncHandler(async (req, res) => {
    const data =
      await service.createSubmission({
        auth: req.auth,
        runId:
          req.params.runId,
      });

    return sendSuccess(
      res,
      {
        message:
          "Regulatory submission created successfully",
        data,
      },
      201
    );
  });

const updateSubmission =
  asyncHandler(async (req, res) => {
    const data =
      await service.updateSubmission({
        auth: req.auth,
        submissionId:
          req.params.submissionId,
        body: req.body,
      });

    return sendSuccess(res, {
      message:
        "Regulatory submission status updated successfully",
      data,
    });
  });

module.exports = {
  createAuthority,
  createDefinition,
  createRun,
  uploadRecords,
  validateRun,
  approveRun,
  attachGeneratedFile,
  createSubmission,
  updateSubmission,
};
