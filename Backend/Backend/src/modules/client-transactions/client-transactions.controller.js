const asyncHandler = require("../../utils/asyncHandler");
const { sendSuccess } = require("../../utils/response");
const service = require("./client-transactions.service");

const listOwn = asyncHandler(async (req, res) => sendSuccess(res, {
  message: "Transactions retrieved successfully",
  data: await service.listOwn({ auth: req.auth, query: req.query }),
}));

const getOwn = asyncHandler(async (req, res) => sendSuccess(res, {
  message: "Transaction retrieved successfully",
  data: await service.getOwn({ auth: req.auth, id: req.params.id }),
}));

module.exports = { listOwn, getOwn };
