const asyncHandler = require("../../utils/asyncHandler");
const { sendSuccess } = require("../../utils/response");
const service = require("./platform-subscriptions.service");

module.exports = {
  listPlans: asyncHandler(async (req, res) => {
    const result = await service.listPlans({
      query: req.query,
    });

    return sendSuccess(res, {
      message: "Subscription plans loaded successfully.",
      data: result.rows,
      meta: result.meta,
    });
  }),

  getPlan: asyncHandler(async (req, res) =>
    sendSuccess(res, {
      message: "Subscription plan loaded successfully.",
      data: await service.getPlan(
        req.params.planId
      ),
    })
  ),

  createPlan: asyncHandler(async (req, res) =>
    sendSuccess(
      res,
      {
        message: "Subscription plan created successfully.",
        data: await service.createPlan({
          auth: req.auth,
          body: req.body,
        }),
      },
      201
    )
  ),

  updatePlan: asyncHandler(async (req, res) =>
    sendSuccess(res, {
      message: "Subscription plan updated successfully.",
      data: await service.updatePlan({
        auth: req.auth,
        planId: req.params.planId,
        body: req.body,
      }),
    })
  ),

  updatePlanFeatures: asyncHandler(
    async (req, res) =>
      sendSuccess(res, {
        message:
          "Subscription plan features updated successfully.",
        data:
          await service.updatePlanFeatures({
            planId: req.params.planId,
            features: req.body.features,
          }),
      })
  ),

  getTenantSubscription: asyncHandler(
    async (req, res) =>
      sendSuccess(res, {
        message:
          "Tenant subscription loaded successfully.",
        data:
          await service.getTenantSubscription({
            tenantId: req.params.tenantId,
          }),
      })
  ),

  changeTenantPlan: asyncHandler(
    async (req, res) =>
      sendSuccess(res, {
        message:
          "Tenant subscription plan changed successfully.",
        data:
          await service.changeTenantPlan({
            auth: req.auth,
            tenantId: req.params.tenantId,
            planId: req.body.planId,
            action: req.body.action,
            reason: req.body.reason,
          }),
      })
  ),

  changeTenantStatus: asyncHandler(
    async (req, res) =>
      sendSuccess(res, {
        message:
          "Tenant subscription status updated successfully.",
        data:
          await service.changeTenantSubscriptionStatus({
            auth: req.auth,
            tenantId: req.params.tenantId,
            status: req.body.status,
            action: req.body.action,
            reason: req.body.reason,
          }),
      })
  ),

  renewTenantSubscription: asyncHandler(
    async (req, res) =>
      sendSuccess(res, {
        message:
          "Tenant subscription renewed successfully.",
        data:
          await service.renewTenantSubscription({
            auth: req.auth,
            tenantId: req.params.tenantId,
            expiresAt: req.body.expiresAt,
            reason: req.body.reason,
          }),
      })
  ),

  upsertTenantOverride: asyncHandler(
    async (req, res) =>
      sendSuccess(res, {
        message:
          "Tenant subscription override saved successfully.",
        data:
          await service.upsertTenantOverride({
            auth: req.auth,
            tenantId: req.params.tenantId,
            body: req.body,
          }),
      })
  ),
};
