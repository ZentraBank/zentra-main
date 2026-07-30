const ApiError = require("../utils/ApiError");

const isPlatformSuperadmin = (auth) => {
  return auth?.roleCode === "platform_superadmin";
};

const getPermissionCodes = (req) => {
  const permissions =
    req.auth?.permissions ||
    req.user?.permissions ||
    [];

  return permissions
    .map((permission) => {
      if (typeof permission === "string") {
        return permission;
      }

      return (
        permission.code ||
        permission.permission_code ||
        null
      );
    })
    .filter(Boolean);
};

const requireAllPermissions = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.auth) {
      return next(
        ApiError.unauthorized(
          "Authentication is required"
        )
      );
    }

    if (isPlatformSuperadmin(req.auth)) {
      return next();
    }

    const permissionCodes = getPermissionCodes(req);

    console.log("AUTH PERMISSIONS:", permissionCodes);
    console.log("REQUIRED:", requiredPermissions);

    const hasAllPermissions =
      requiredPermissions.every((permission) =>
        permissionCodes.includes(permission)
      );

    if (!hasAllPermissions) {
      return next(
        ApiError.forbidden(
          `Required permissions: ${requiredPermissions.join(
            ", "
          )}`
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
        ApiError.unauthorized(
          "Authentication is required"
        )
      );
    }

    if (isPlatformSuperadmin(req.auth)) {
      return next();
    }

    const permissionCodes = getPermissionCodes(req);

    const hasPermission =
      allowedPermissions.some((permission) =>
        permissionCodes.includes(permission)
      );

    if (!hasPermission) {
      return next(
        ApiError.forbidden(
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