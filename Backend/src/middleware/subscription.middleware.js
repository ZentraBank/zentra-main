function subscriptionMiddleware(req, res, next) {
  const allowedPaths = [
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/logout",
    "/api/auth/me",
    "/api/subscriptions/request",
    "/api/subscriptions/current",
  ];

  const currentPath = req.originalUrl.split("?")[0];

  if (allowedPaths.includes(currentPath)) {
    return next();
  }

  if (!req.tenant) {
    return res.status(400).json({
      success: false,
      message: "Tenant not resolved",
    });
  }

  if (req.tenant.subscription_status !== "active") {
    return res.status(403).json({
      success: false,
      message: "Tenant subscription is not active",
    });
  }

  next();
}

module.exports = subscriptionMiddleware;