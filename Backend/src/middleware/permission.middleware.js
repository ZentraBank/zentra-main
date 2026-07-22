const ApiError = require("../utils/ApiError");

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.auth) {
      return next(
        ApiError.unauthorized(
          "Authentication is required"
        )
      );
    }

    if (
      !allowedRoles.includes(req.auth.roleCode)
    ) {
      return next(
        ApiError.forbidden(
          "Your role cannot perform this action"
        )
      );
    }

    return next();
  };
};

const requirePermission = (
  ...requiredPermissions
) => {
  return (req, res, next) => {
    if (!req.auth) {
      return next(
        ApiError.unauthorized(
          "Authentication is required"
        )
      );
    }

    const userPermissions = new Set(
      req.auth.permissions || []
    );

    const hasEveryPermission =
      requiredPermissions.every((permission) =>
        userPermissions.has(permission)
      );

    if (!hasEveryPermission) {
      return next(
        ApiError.forbidden(
          "You do not have permission to perform this action"
        )
      );
    }

    return next();
  };
};

const requireAnyPermission = (
  ...requiredPermissions
) => {
  return (req, res, next) => {
    if (!req.auth) {
      return next(
        ApiError.unauthorized(
          "Authentication is required"
        )
      );
    }

    const userPermissions = new Set(
      req.auth.permissions || []
    );

    const hasPermission =
      requiredPermissions.some((permission) =>
        userPermissions.has(permission)
      );

    if (!hasPermission) {
      return next(
        ApiError.forbidden(
          "You do not have permission to perform this action"
        )
      );
    }

    return next();
  };
};

module.exports = {
  requireRole,
  requirePermission,
  requireAnyPermission,
};