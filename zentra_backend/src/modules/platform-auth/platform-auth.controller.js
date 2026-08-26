const env = require("../../config/env");
const asyncHandler = require("../../utils/asyncHandler");
const { sendSuccess } = require("../../utils/response");
const service = require("./platform-auth.service");

const PLATFORM_REFRESH_COOKIE_NAME =
  "zentrabank_platform_refresh_token";

const PLATFORM_AUTH_COOKIE_PATH =
  `${env.apiPrefix}/superadmin/auth`;

const contextFrom = (req) => ({
  ipAddress:
    req.headers["x-forwarded-for"] ||
    req.ip ||
    req.socket?.remoteAddress ||
    null,

  userAgent:
    req.headers["user-agent"] || null,
});

const getRefreshCookieOptions = (
  expiresAt
) => {
  const options = {
    httpOnly: true,
    secure: env.cookies.secure,
    sameSite: env.cookies.sameSite,
    path: PLATFORM_AUTH_COOKIE_PATH,
  };

  if (expiresAt instanceof Date) {
    options.expires = expiresAt;
  }

  return options;
};

const getRefreshTokenFromRequest = (
  req
) => {
  return (
    req.cookies?.[
      PLATFORM_REFRESH_COOKIE_NAME
    ] ||
    null
  );
};

module.exports = {
  login: asyncHandler(async (req, res) => {
    const result = await service.login({
      email: req.body.email,
      password: req.body.password,
      deviceName:
        req.body.deviceName || null,
      requestContext: contextFrom(req),
    });

    if (!result.refreshToken) {
      const error = new Error(
        "Platform login did not generate a refresh token."
      );

      error.statusCode = 500;
      throw error;
    }

    res.cookie(
      PLATFORM_REFRESH_COOKIE_NAME,
      result.refreshToken,
      getRefreshCookieOptions(
        result.refreshTokenExpiresAt
      )
    );

    return sendSuccess(res, {
      message:
        "Platform login successful.",
      data: {
        user: result.user,
        accessToken:
          result.accessToken,
        accessTokenExpiresIn:
          result.accessTokenExpiresIn,
      },
    });
  }),

  refresh: asyncHandler(
    async (req, res) => {
      const refreshToken =
        getRefreshTokenFromRequest(req);

      if (!refreshToken) {
        const error = new Error(
          "Platform refresh token is missing."
        );

        error.statusCode = 401;
        throw error;
      }

      const result =
        await service.refresh({
          refreshToken,
          deviceName:
            req.body?.deviceName || null,
          requestContext:
            contextFrom(req),
        });

      if (!result.refreshToken) {
        const error = new Error(
          "Platform refresh did not generate a replacement refresh token."
        );

        error.statusCode = 500;
        throw error;
      }

      res.cookie(
        PLATFORM_REFRESH_COOKIE_NAME,
        result.refreshToken,
        getRefreshCookieOptions(
          result.refreshTokenExpiresAt
        )
      );

      return sendSuccess(res, {
        message:
          "Platform session refreshed.",
        data: {
          user: result.user,
          accessToken:
            result.accessToken,
          accessTokenExpiresIn:
            result.accessTokenExpiresIn,
        },
      });
    }
  ),

  logout: asyncHandler(
    async (req, res) => {
      const refreshToken =
        getRefreshTokenFromRequest(req);

      if (refreshToken) {
        await service.logout({
          refreshToken,
        });
      }

      res.clearCookie(
        PLATFORM_REFRESH_COOKIE_NAME,
        {
          httpOnly: true,
          secure:
            env.cookies.secure,
          sameSite:
            env.cookies.sameSite,
          path:
            PLATFORM_AUTH_COOKIE_PATH,
        }
      );

      return sendSuccess(res, {
        message:
          "Platform logout successful.",
        data: null,
      });
    }
  ),

  me: asyncHandler(async (req, res) => {
    const data =
      await service.getCurrentUser(
        req.auth.userId
      );

    return sendSuccess(res, {
      message:
        "Platform user loaded successfully.",
      data,
    });
  }),
};