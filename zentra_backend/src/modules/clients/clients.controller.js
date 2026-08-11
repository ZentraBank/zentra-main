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
  const data = await service.list({ tenantId: req.auth.tenantId });
  return sendSuccess(res, { message: "Clients retrieved successfully", data });
});

const get = asyncHandler(async (req, res) => {
  const data = await service.get({
    tenantId: req.auth.tenantId,
    clientId: req.params.clientId,
  });
  return sendSuccess(res, { message: "Client retrieved successfully", data });
});

module.exports = { create, list, get };
