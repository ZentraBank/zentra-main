const asyncHandler = require("../../utils/asyncHandler");
const { sendSuccess } = require("../../utils/response");
const service = require("./transfers.service");

const createInternal = asyncHandler(async (req, res) => {
  const data = await service.createInternalTransfer({ auth: req.auth, body: req.body });
  return sendSuccess(res, { message: "Transfer completed successfully", data }, 201);
});

const listOwn = asyncHandler(async (req, res) => {
  const data = await service.listOwn({
    auth: req.auth,
    page: Number(req.query.page),
    pageSize: Number(req.query.pageSize),
  });
  return sendSuccess(res, { message: "Transfers retrieved successfully", data });
});

const getOwn = asyncHandler(async (req, res) => {
  const data = await service.getOwn({ auth: req.auth, transferId: req.params.transferId });
  return sendSuccess(res, { message: "Transfer retrieved successfully", data });
});

module.exports = { createInternal, listOwn, getOwn };
