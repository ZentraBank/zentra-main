const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const requireActiveSubscription = (req, res, next) => {
  if (!req.auth) {
    return next(createHttpError(401, "Authentication is required"));
  }

  if (!req.auth.subscriptionId || !req.auth.planId) {
    return next(createHttpError(403, "An active subscription is required"));
  }

  return next();
};

const requirePlanFeature = (featureKey) => {
  return (req, res, next) => {
    if (!req.auth) {
      return next(createHttpError(401, "Authentication is required"));
    }

    const feature = req.auth.planFeatures?.[featureKey];

    if (!feature?.enabled) {
      return next(
        createHttpError(
          403,
          `Your current subscription does not include ${featureKey}`
        )
      );
    }

    req.planFeature = feature;
    return next();
  };
};

const requirePlanLimit = (featureKey, getRequestedValue) => {
  return (req, res, next) => {
    if (!req.auth) {
      return next(createHttpError(401, "Authentication is required"));
    }

    const feature = req.auth.planFeatures?.[featureKey];

    if (!feature?.enabled) {
      return next(
        createHttpError(
          403,
          `Your current subscription does not include ${featureKey}`
        )
      );
    }

    const limit = Number(feature.value);
    const requestedValue = Number(getRequestedValue(req));

    if (!Number.isFinite(limit) || !Number.isFinite(requestedValue)) {
      return next(
        createHttpError(500, `Invalid ${featureKey} configuration`)
      );
    }

    if (requestedValue > limit) {
      return next(
        createHttpError(
          403,
          `Your current plan allows a maximum ${featureKey} of ${limit}`
        )
      );
    }

    req.planLimit = limit;
    return next();
  };
};

module.exports = {
  requireActiveSubscription,
  requirePlanFeature,
  requirePlanLimit,
};
