const asyncHandler = require("../../utils/asyncHandler");
const { sendSuccess } = require("../../utils/response");
const service = require("./transfers.service");

const createOwn = asyncHandler(async (req, res) => {
  const data = await service.createInternalTransfer({
    auth: req.auth,
    body: req.body,
  });

  return sendSuccess(
    res,
    {
      message: "Transfer completed successfully",
      data,
    },
    201
  );
});

const listOwn = asyncHandler(async (req, res) => {
  const data = await service.listOwn({
    auth: req.auth,
    page: Number(req.query.page) || 1,
    pageSize: Number(req.query.pageSize) || 20,
  });

  return sendSuccess(res, {
    message: "Transfers retrieved successfully",
    data,
  });
});

const getOwn = asyncHandler(async (req, res) => {
  const data = await service.getOwn({
    auth: req.auth,
    transferId: req.params.transferId,
  });

  return sendSuccess(res, {
    message: "Transfer retrieved successfully",
    data,
  });
});

/*
|--------------------------------------------------------------------------
| Tenant administrator controllers
|--------------------------------------------------------------------------
*/

const listTenant = asyncHandler(async (req, res) => {
  const data = await service.listTenant({
    auth: req.auth,
    page: Number(req.query.page) || 1,
    pageSize: Number(req.query.pageSize) || 20,
  });

  return sendSuccess(res, {
    message: "Tenant transfers retrieved successfully",
    data,
  });
});

const getTenant = asyncHandler(async (req, res) => {
  const data = await service.getTenant({
    auth: req.auth,
    transferId: req.params.transferId,
  });

  return sendSuccess(res, {
    message: "Tenant transfer retrieved successfully",
    data,
  });
});

const updateTenant = asyncHandler(async (req, res) => {
  const data = await service.updateTenant({
    auth: req.auth,
    transferId: req.params.transferId,
    body: req.body,
  });

  return sendSuccess(res, {
    message: "Transfer updated successfully",
    data,
  });
});

module.exports = {
  createOwn,
  listOwn,
  getOwn,
  listTenant,
  getTenant,
  updateTenant,
};