const ApiError = require("../utils/ApiError");
const asyncHandler = require(
  "../utils/asyncHandler"
);

const {
  verifyAccessToken,
} = require("../utils/jwt");

const authRepository = require(
  "../modules/auth/auth.repository"
);

const extractBearerToken = (req) => {
  const authorizationHeader =
    req.get("authorization");

  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] =
    authorizationHeader.split(" ");

  if (
    scheme?.toLowerCase() !== "bearer" ||
    !token
  ) {
    return null;
  }

  return token;
};

const authenticate = asyncHandler(
  async (req, res, next) => {
    const token = extractBearerToken(req);

    if (!token) {
      throw ApiError.unauthorized(
        "Authentication is required"
      );
    }

    const payload = verifyAccessToken(token);

    const authenticationContext =
      await authRepository.findAuthenticationContext({
        userId: payload.sub,
        membershipId: payload.membershipId,
        tenantId: payload.tenantId,
      });

    if (!authenticationContext) {
      throw ApiError.unauthorized(
        "The authenticated user was not found"
      );
    }

    if (
      authenticationContext.user_status !== "active"
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

      permissions: permissions.map(
        (permission) => permission.code
      ),
    };

    req.user = authenticationContext;

    next();
  }
);

const optionalAuthenticate = asyncHandler(
  async (req, res, next) => {
    const token = extractBearerToken(req);

    if (!token) {
      return next();
    }

    const payload = verifyAccessToken(token);

    const authenticationContext =
      await authRepository.findAuthenticationContext({
        userId: payload.sub,
        membershipId: payload.membershipId,
        tenantId: payload.tenantId,
      });

    if (!authenticationContext) {
      return next();
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
      permissions: permissions.map(
        (permission) => permission.code
      ),
    };

    req.user = authenticationContext;

    return next();
  }
);

module.exports = {
  authenticate,
  optionalAuthenticate,
  extractBearerToken,
};