const jwt = require("jsonwebtoken");

const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const env = require("../config/env");

const {
  verifyAccessToken,
} = require("../utils/jwt");

const authRepository = require(
  "../modules/auth/auth.repository"
);

const platformAuthRepository = require(
  "../modules/platform-auth/platform-auth.repository"
);

// const extractBearerToken = (req) => {
//   const authorizationHeader =
//     req.get("authorization");

//   if (!authorizationHeader) {
//     return null;
//   }

//   const [scheme, token] =
//     authorizationHeader.split(" ");

//   if (
//     scheme?.toLowerCase() !== "bearer" ||
//     !token
//   ) {
//     return null;
//   }

//   return token;
// };


const extractBearerToken = (req) => {
  console.log("========== AUTH DEBUG ==========");
  console.log("req.headers.authorization:", req.headers.authorization);
  console.log("req.get('authorization'):", req.get("authorization"));
  console.log("req.get('Authorization'):", req.get("Authorization"));
  console.log("================================");

  const authorizationHeader =
    req.headers.authorization || req.get("authorization");

  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(" ");

  if (
    scheme?.toLowerCase() !== "bearer" ||
    !token
  ) {
    return null;
  }

  return token;
};
const convertJwtError = (error) => {
  if (
    error?.name === "TokenExpiredError" ||
    error?.message === "jwt expired"
  ) {
    return ApiError.unauthorized(
      "Access token has expired"
    );
  }

  if (
    error?.name === "JsonWebTokenError" ||
    error?.name === "NotBeforeError"
  ) {
    return ApiError.unauthorized(
      "Invalid access token"
    );
  }

  return error;
};

const verifyPlatformAccessToken = (token) => {
  try {
    return jwt.verify(
      token,
      env.jwt.accessSecret,
      {
        issuer: env.appName,
        audience: "zentrabank-platform",
      }
    );
  } catch (error) {
    throw convertJwtError(error);
  }
};

const verifyTenantAccessToken = (token) => {
  try {
    return verifyAccessToken(token);
  } catch (error) {
    throw convertJwtError(error);
  }
};

const verifyTokenByScope = (token) => {
  const decoded = jwt.decode(token);

  if (!decoded || typeof decoded !== "object") {
    throw ApiError.unauthorized(
      "Invalid access token"
    );
  }

  return decoded.scope === "platform"
    ? verifyPlatformAccessToken(token)
    : verifyTenantAccessToken(token);
};

const attachPlatformAuthentication = async (
  req,
  payload
) => {
  const platformUser =
    await platformAuthRepository.findUserById(
      payload.sub
    );

  if (!platformUser) {
    throw ApiError.unauthorized(
      "The authenticated platform user was not found"
    );
  }

  if (platformUser.status !== "active") {
    throw ApiError.forbidden(
      "Your platform account is not active"
    );
  }

  const permissions =
    await platformAuthRepository.listPermissions(
      platformUser.id
    );

  req.auth = {
    userId: platformUser.id,
    platformUserId: platformUser.id,
    tenantId: null,
    roleCode: platformUser.role_code,
    scope: "platform",
    permissions,
  };

  req.user = platformUser;
};

const attachTenantAuthentication = async (
  req,
  payload
) => {
const authenticationContext =
  await authRepository.findAuthContextByIdentity({
    userId: payload.sub,
    tenantId: payload.tenantId,
  });

  console.log(
  "AUTHENTICATION CONTEXT:",
  authenticationContext
);


  if (!authenticationContext) {
    throw ApiError.unauthorized(
      "The authenticated user was not found"
    );
  }

  if (
    authenticationContext.user_status !==
    "active"
  ) {
    throw ApiError.forbidden(
      "Your user account is not active"
    );
  }

  if (
    authenticationContext.membership_status !==
    "active"
  ) {
    throw ApiError.forbidden(
      "Your tenant membership is not active"
    );
  }

  if (
    authenticationContext.tenant_status !==
    "active"
  ) {
    throw ApiError.forbidden(
      "This tenant is currently unavailable"
    );
  }

  if (
    !Boolean(
      authenticationContext.role_is_active
    )
  ) {
    throw ApiError.forbidden(
      "Your assigned role is not active"
    );
  }

  if (
    req.tenantId &&
    req.tenantId !==
      authenticationContext.tenant_id
  ) {
    throw ApiError.forbidden(
      "The access token belongs to a different tenant"
    );
  }

  const permissions =
    await authRepository.findPermissionsByRoleId(
      authenticationContext.role_id
    );

  req.auth = {
    userId: authenticationContext.id,

    tenantId:
      authenticationContext.tenant_id,

    tenantSlug:
      authenticationContext.tenant_slug,

    membershipId:
      authenticationContext.membership_id,

    roleId:
      authenticationContext.role_id,

    roleCode:
      authenticationContext.role_code,

    scope: "tenant",

    permissions: permissions.map(
      (permission) => permission.code
    ),
  };

  req.user = authenticationContext;
};

const authenticate = asyncHandler(
  async (req, res, next) => {
    const token = extractBearerToken(req);

    if (!token) {
      throw ApiError.unauthorized(
        "Authentication is required"
      );
    }

    const payload = verifyTokenByScope(token);

    if (payload.scope === "platform") {
      await attachPlatformAuthentication(
        req,
        payload
      );

      return next();
    }

    await attachTenantAuthentication(
      req,
      payload
    );

    return next();
  }
);

const optionalAuthenticate = asyncHandler(
  async (req, res, next) => {
    const token = extractBearerToken(req);

    if (!token) {
      return next();
    }

    let payload;

    try {
      payload = verifyTokenByScope(token);
    } catch (error) {
      /*
       * Optional authentication should not reject
       * anonymous requests because of a missing,
       * invalid, or expired token.
       */
      if (error?.statusCode === 401) {
        return next();
      }

      throw error;
    }

    if (payload.scope === "platform") {
      try {
        await attachPlatformAuthentication(
          req,
          payload
        );
      } catch (error) {
        if (
          error?.statusCode === 401 ||
          error?.statusCode === 403
        ) {
          return next();
        }

        throw error;
      }

      return next();
    }

    try {
      await attachTenantAuthentication(
        req,
        payload
      );
    } catch (error) {
      if (
        error?.statusCode === 401 ||
        error?.statusCode === 403
      ) {
        return next();
      }

      throw error;
    }

    return next();
  }
);

module.exports = {
  authenticate,
  optionalAuthenticate,
  extractBearerToken,
};