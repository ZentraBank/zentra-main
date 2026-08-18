const asyncHandler = require("../../utils/asyncHandler");
const { sendSuccess } = require("../../utils/response");
const service = require("./clients.service");

const create = asyncHandler(async (req, res) => {
  const data = await service.create({
    tenantId: req.auth.tenantId,
    body: req.body,
  });

  return sendSuccess(res, {
    statusCode: 201,
    message: "Client created successfully",
    data,
  });
});

const list = asyncHandler(async (req, res) => {
  const data = await service.list({
    tenantId: req.auth.tenantId,
  });

  return sendSuccess(res, {
    message: "Clients retrieved successfully",
    data,
  });
});

const get = asyncHandler(async (req, res) => {
  const data = await service.get({
    tenantId: req.auth.tenantId,
    clientId: req.params.clientId,
  });

  return sendSuccess(res, {
    message: "Client retrieved successfully",
    data,
  });
});

const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    const error = new Error(
      "Profile picture is required"
    );

    error.statusCode = 400;

    throw error;
  }

  const data = await service.uploadAvatar({
    tenantId: req.auth.tenantId,
    clientId: req.params.clientId,
    file: req.file,
  });

  return sendSuccess(res, {
    message:
      "Client profile picture updated successfully",
    data,
  });
});

const getAvatar = asyncHandler(async (req, res) => {
  const data = await service.getAvatar({
    tenantId: req.auth.tenantId,
    clientId: req.params.clientId,
  });

  res.setHeader(
    "Content-Type",
    data.mimeType
  );

  res.setHeader(
    "Cache-Control",
    "private, max-age=3600"
  );

  return res.send(
    data.buffer
  );
});

const resetPassword = asyncHandler(async (req, res) => {
  const data = await service.resetPassword({
    tenantId: req.auth.tenantId,
    clientId: req.params.clientId,
    password: req.body.password,
  });

  return sendSuccess(res, {
    message: "Client password reset successfully",
    data,
  });
});

module.exports = {
  create,
  list,
  get,
  uploadAvatar,
  getAvatar,
  resetPassword,
};