const asyncHandler = require("../../utils/asyncHandler");
const { sendSuccess } = require("../../utils/response");
const service = require("./platform-search.service");

const respond = ({
  res,
  message,
  result,
}) =>
  sendSuccess(res, {
    message,
    data: result.rows,
    meta: result.meta,
  });

module.exports = {
  users: asyncHandler(async (req, res) =>
    respond({
      res,
      message:
        "Cross-tenant users loaded successfully.",
      result: await service.searchUsers({
        query: req.query,
      }),
    })
  ),

  accounts: asyncHandler(async (req, res) =>
    respond({
      res,
      message:
        "Cross-tenant accounts loaded successfully.",
      result:
        await service.searchAccounts({
          query: req.query,
        }),
    })
  ),

  transactions: asyncHandler(
    async (req, res) =>
      respond({
        res,
        message:
          "Cross-tenant transactions loaded successfully.",
        result:
          await service.searchTransactions({
            query: req.query,
          }),
      })
  ),
};
