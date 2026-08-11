const asyncHandler = require("../../utils/asyncHandler");
const { sendSuccess } = require("../../utils/response");
const service = require("./platform-auth.service");

const contextFrom = (req) => ({
  ipAddress:
    req.headers["x-forwarded-for"] ||
    req.socket?.remoteAddress ||
    null,
  userAgent: req.headers["user-agent"] || null,
});

module.exports = {
  login: asyncHandler(async (req, res) => {
    const data = await service.login({
      email: req.body.email,
      password: req.body.password,
      deviceName: req.body.deviceName,
      requestContext: contextFrom(req),
    });

    return sendSuccess(res, {
      message: "Platform login successful.",
      data,
    });
  }),

  refresh: asyncHandler(async (req, res) => {
    const data = await service.refresh({
      refreshToken: req.body.refreshToken,
      deviceName: req.body.deviceName,
      requestContext: contextFrom(req),
    });

    return sendSuccess(res, {
      message: "Platform session refreshed.",
      data,
    });
  }),

  logout: asyncHandler(async (req, res) => {
    await service.logout({
      refreshToken: req.body.refreshToken,
    });

    return sendSuccess(res, {
      message: "Platform logout successful.",
      data: null,
    });
  }),

  me: asyncHandler(async (req, res) => {
    const data = await service.getCurrentUser(
      req.auth.userId
    );

    return sendSuccess(res, {
      message: "Platform user loaded successfully.",
      data,
    });
  }),
};
