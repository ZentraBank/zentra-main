const subscriptionService =
  require("../modules/subscriptions/subscriptions.service");

const createHttpError = (
  statusCode,
  message,
  {
    code,
    feature,
    currentPlan,
    limit,
    requestedValue,
  } = {}
) => {
  const error = new Error(message);

  error.statusCode = statusCode;

  if (code) {
    error.code = code;
  }

  if (feature) {
    error.feature = feature;
  }

  if (currentPlan) {
    error.currentPlan = currentPlan;
  }

  if (limit !== undefined) {
    error.limit = limit;
  }

  if (requestedValue !== undefined) {
    error.requestedValue = requestedValue;
  }

  return error;
};

const getTenantId = (req) => {
  return (
    req.auth?.tenantId ||
    req.tenant?.id ||
    null
  );
};

/**
 * Loads the tenant's current active subscription and entitlements.
 *
 * The result is cached on the request so that multiple subscription
 * middleware checks during the same request do not repeatedly query
 * the database.
 */
const loadSubscriptionContext = async (req) => {
  if (req.subscriptionContext) {
    return req.subscriptionContext;
  }

  if (!req.auth) {
    throw createHttpError(
      401,
      "Authentication is required",
      {
        code: "AUTHENTICATION_REQUIRED",
      }
    );
  }

  const tenantId = getTenantId(req);

  if (!tenantId) {
    throw createHttpError(
      400,
      "Tenant context is required",
      {
        code: "TENANT_CONTEXT_REQUIRED",
      }
    );
  }

  const result =
    await subscriptionService.getTenantEntitlements({
      tenantId,
    });

  req.subscriptionContext = {
    subscription:
      result?.subscription || null,

    entitlements:
      result?.entitlements || {},
  };

  return req.subscriptionContext;
};

/**
 * Ensures that the tenant has an active subscription.
 */
const requireActiveSubscription = async (
  req,
  res,
  next
) => {
  try {
    const {
      subscription,
      entitlements,
    } =
      await loadSubscriptionContext(req);

    if (!subscription) {
      return next(
        createHttpError(
          403,
          "An active subscription is required",
          {
            code:
              "ACTIVE_SUBSCRIPTION_REQUIRED",
          }
        )
      );
    }

    req.subscription = subscription;
    req.entitlements = entitlements;

    return next();
  } catch (error) {
    return next(error);
  }
};

/**
 * Requires a boolean subscription feature.
 *
 * Examples:
 *
 * requirePlanFeature("virtual_cards")
 * requirePlanFeature("fx_access")
 * requirePlanFeature("investment_access")
 * requirePlanFeature("platform_chat")
 */
const requirePlanFeature = (featureKey) => {
  return async (req, res, next) => {
    try {
      const {
        subscription,
        entitlements,
      } =
        await loadSubscriptionContext(req);

      if (!subscription) {
        return next(
          createHttpError(
            403,
            "An active subscription is required",
            {
              code:
                "ACTIVE_SUBSCRIPTION_REQUIRED",
              feature: featureKey,
            }
          )
        );
      }

      const featureValue =
        entitlements[featureKey];

      /*
       * Boolean subscription features must explicitly
       * resolve to true.
       *
       * false     -> unavailable
       * undefined -> unavailable / not configured
       */
      if (featureValue !== true) {
        return next(
          createHttpError(
            403,
            `${featureKey} is not included in your current subscription plan`,
            {
              code:
                "SUBSCRIPTION_FEATURE_REQUIRED",

              feature:
                featureKey,

              currentPlan:
                subscription.plan_code ||
                subscription.plan_name ||
                null,
            }
          )
        );
      }

      req.subscription = subscription;
      req.entitlements = entitlements;

      req.planFeature = {
        key: featureKey,
        value: featureValue,
      };

      return next();
    } catch (error) {
      return next(error);
    }
  };
};

/**
 * Requires a numeric subscription limit.
 *
 * Feature contract:
 *
 * number -> enforce limit
 * null   -> unlimited by subscription plan
 * false  -> feature unavailable
 *
 * Example:
 *
 * requirePlanLimit(
 *   "transfer_limit",
 *   (req) => req.body.amount
 * )
 */
const requirePlanLimit = (
  featureKey,
  getRequestedValue
) => {
  return async (req, res, next) => {
    try {
      const {
        subscription,
        entitlements,
      } =
        await loadSubscriptionContext(req);

      if (!subscription) {
        return next(
          createHttpError(
            403,
            "An active subscription is required",
            {
              code:
                "ACTIVE_SUBSCRIPTION_REQUIRED",
              feature: featureKey,
            }
          )
        );
      }

      if (
        !Object.prototype.hasOwnProperty.call(
          entitlements,
          featureKey
        )
      ) {
        return next(
          createHttpError(
            500,
            `Subscription feature ${featureKey} is not configured`,
            {
              code:
                "SUBSCRIPTION_FEATURE_NOT_CONFIGURED",

              feature:
                featureKey,

              currentPlan:
                subscription.plan_code ||
                subscription.plan_name ||
                null,
            }
          )
        );
      }

      const featureValue =
        entitlements[featureKey];

      /*
       * A literal false means the capability
       * is unavailable for the plan.
       */
      if (featureValue === false) {
        return next(
          createHttpError(
            403,
            `${featureKey} is not included in your current subscription plan`,
            {
              code:
                "SUBSCRIPTION_FEATURE_REQUIRED",

              feature:
                featureKey,

              currentPlan:
                subscription.plan_code ||
                subscription.plan_name ||
                null,
            }
          )
        );
      }

      const requestedValue = Number(
        getRequestedValue(req)
      );

      if (
        !Number.isFinite(requestedValue) ||
        requestedValue < 0
      ) {
        return next(
          createHttpError(
            400,
            `Invalid value supplied for ${featureKey}`,
            {
              code:
                "INVALID_SUBSCRIPTION_LIMIT_VALUE",

              feature:
                featureKey,
            }
          )
        );
      }

      /*
       * null means unlimited by the subscription.
       *
       * This is critical for Diamond.
       *
       * We DO NOT convert null with Number(null),
       * because Number(null) would become 0.
       */
      if (featureValue === null) {
        req.subscription = subscription;
        req.entitlements = entitlements;

        req.planLimit = {
          key: featureKey,
          limit: null,
          unlimited: true,
          requestedValue,
        };

        return next();
      }

      const limit = Number(featureValue);

      if (
        !Number.isFinite(limit) ||
        limit < 0
      ) {
        return next(
          createHttpError(
            500,
            `Invalid ${featureKey} subscription configuration`,
            {
              code:
                "INVALID_SUBSCRIPTION_CONFIGURATION",

              feature:
                featureKey,

              currentPlan:
                subscription.plan_code ||
                subscription.plan_name ||
                null,
            }
          )
        );
      }

      if (requestedValue > limit) {
        return next(
          createHttpError(
            403,
            `Your current subscription plan allows a maximum ${featureKey} of ${limit}`,
            {
              code:
                "SUBSCRIPTION_LIMIT_EXCEEDED",

              feature:
                featureKey,

              currentPlan:
                subscription.plan_code ||
                subscription.plan_name ||
                null,

              limit,

              requestedValue,
            }
          )
        );
      }

      req.subscription = subscription;
      req.entitlements = entitlements;

      req.planLimit = {
        key: featureKey,
        limit,
        unlimited: false,
        requestedValue,
      };

      return next();
    } catch (error) {
      return next(error);
    }
  };
};

module.exports = {
  loadSubscriptionContext,
  requireActiveSubscription,
  requirePlanFeature,
  requirePlanLimit,
};