const subscriptionService = require("./subscription.service");

async function requestSubscription(req, res, next) {
  try {
    const result = await subscriptionService.requestSubscription({
      tenantId: req.tenant.id,
      user: req.user,
      ...req.body,
    });

    return res.status(201).json({
      success: true,
      message: "Subscription request submitted",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

async function getCurrentSubscription(req, res, next) {
  try {
    const subscription = await subscriptionService.getCurrentSubscription({
      tenantId: req.tenant.id,
    });

    return res.json({
      success: true,
      data: { subscription },
    });
  } catch (error) {
    next(error);
  }
}

async function getSubscriptionRequests(req, res, next) {
  try {
    const subscriptions = await subscriptionService.getSubscriptionRequests({
      tenantId: req.tenant.id,
      user: req.user,
    });

    return res.json({
      success: true,
      data: { subscriptions },
    });
  } catch (error) {
    next(error);
  }
}

async function approveSubscription(req, res, next) {
  try {
    await subscriptionService.approveSubscription({
      tenantId: req.tenant.id,
      user: req.user,
      id: req.params.id,
    });

    return res.json({
      success: true,
      message: "Subscription approved",
    });
  } catch (error) {
    next(error);
  }
}

async function rejectSubscription(req, res, next) {
  try {
    await subscriptionService.rejectSubscription({
      tenantId: req.tenant.id,
      user: req.user,
      id: req.params.id,
    });

    return res.json({
      success: true,
      message: "Subscription rejected",
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  requestSubscription,
  getCurrentSubscription,
  getSubscriptionRequests,
  approveSubscription,
  rejectSubscription,
};