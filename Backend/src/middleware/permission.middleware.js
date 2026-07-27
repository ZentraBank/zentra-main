const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const requireAllPermissions = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.auth) {
      return next(
        createHttpError(401, "Authentication is required")
      );
    }

    const userPermissions = new Set(
      req.auth.permissions || []
    );

    const missingPermissions =
      requiredPermissions.filter(
        (permission) =>
          !userPermissions.has(permission)
      );

    if (missingPermissions.length > 0) {
      return next(
        createHttpError(
          403,
          `Missing required permission${
            missingPermissions.length > 1 ? "s" : ""
          }: ${missingPermissions.join(", ")}`
        )
      );
    }

    return next();
  };
};

const requireAnyPermission = (...allowedPermissions) => {
  return (req, res, next) => {
    if (!req.auth) {
      return next(
        createHttpError(401, "Authentication is required")
      );
    }

    const userPermissions = new Set(
      req.auth.permissions || []
    );

    const hasPermission =
      allowedPermissions.some((permission) =>
        userPermissions.has(permission)
      );

    if (!hasPermission) {
      return next(
        createHttpError(
          403,
          `One of these permissions is required: ${allowedPermissions.join(
            ", "
          )}`
        )
      );
    }

    return next();
  };
};

module.exports = {
  requireAllPermissions,
  requireAnyPermission,
};