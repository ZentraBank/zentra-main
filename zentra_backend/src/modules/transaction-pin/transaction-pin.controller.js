const asyncHandler =
  require("../../utils/asyncHandler");

const {
  sendSuccess,
} = require("../../utils/response");

const service =
  require("./transaction-pin.service");

const status = asyncHandler(
  async (req, res) =>
    sendSuccess(res, {
      message:
        "Transaction PIN status retrieved",
      data:
        await service.getStatus({
          userId:
            req.auth.userId,
        }),
    })
);

const setup = asyncHandler(
  async (req, res) =>
    sendSuccess(res, {
      statusCode: 201,
      message:
        "Transaction PIN created",
      data:
        await service.setup({
          userId:
            req.auth.userId,
          ...req.body,
        }),
    })
);

const change = asyncHandler(
  async (req, res) =>
    sendSuccess(res, {
      message:
        "Transaction PIN changed",
      data:
        await service.change({
          userId:
            req.auth.userId,
          ...req.body,
        }),
    })
);

/*
|--------------------------------------------------------------------------
| Forgot PIN
|--------------------------------------------------------------------------
*/

const requestReset = asyncHandler(
  async (req, res) => {
    const data =
      await service.requestReset({
        userId:
          req.auth.userId,
        tenantId:
          req.auth.tenantId,
      });

    return sendSuccess(res, {
      message:
        "Transaction PIN reset code sent",
      data,
    });
  }
);

const reset = asyncHandler(
  async (req, res) => {
    const data =
      await service.reset({
        userId:
          req.auth.userId,
        tenantId:
          req.auth.tenantId,
        ...req.body,
      });

    return sendSuccess(res, {
      message:
        "Transaction PIN reset successfully",
      data,
    });
  }
);

module.exports = {
  status,
  setup,
  change,
  requestReset,
  reset,
};