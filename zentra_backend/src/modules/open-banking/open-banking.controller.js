const asyncHandler =
  require("../../utils/asyncHandler");

const {
  sendSuccess,
} = require("../../utils/response");

const service =
  require("./open-banking.service");

const createPartnerApplication =
  asyncHandler(async (req, res) => {
    const data =
      await service
        .createPartnerApplication({
          auth: req.auth,
          body: req.body,
        });

    return sendSuccess(
      res,
      {
        message:
          "Partner application created successfully",
        data,
      },
      201
    );
  });

const approvePartner =
  asyncHandler(async (req, res) => {
    const data =
      await service.approvePartner({
        auth: req.auth,
        partnerId:
          req.params.partnerId,
      });

    return sendSuccess(res, {
      message:
        "Partner application approved successfully",
      data,
    });
  });

const issueToken =
  asyncHandler(async (req, res) => {
    const data =
      await service
        .issueClientCredentialsToken({
          tenantId:
            req.tenant.id,
          body: req.body,
        });

    return sendSuccess(res, {
      message:
        "Access token issued successfully",
      data,
    });
  });

const createConsent =
  asyncHandler(async (req, res) => {
    const data =
      await service.createConsent({
        auth: req.auth,
        partnerId:
          req.params.partnerId,
        body: req.body,
      });

    return sendSuccess(
      res,
      {
        message:
          "Open Banking consent created successfully",
        data,
      },
      201
    );
  });

const authoriseConsent =
  asyncHandler(async (req, res) => {
    const data =
      await service.authoriseConsent({
        auth: req.auth,
        consentId:
          req.params.consentId,
        body: req.body,
      });

    return sendSuccess(res, {
      message:
        "Open Banking consent authorised successfully",
      data,
    });
  });

const revokeConsent =
  asyncHandler(async (req, res) => {
    const data =
      await service.revokeConsent({
        auth: req.auth,
        consentId:
          req.params.consentId,
        body: req.body,
      });

    return sendSuccess(res, {
      message:
        "Open Banking consent revoked successfully",
      data,
    });
  });

const createWebhookSubscription =
  asyncHandler(async (req, res) => {
    const data =
      await service
        .createWebhookSubscription({
          auth: req.auth,
          partnerId:
            req.params.partnerId,
          body: req.body,
        });

    return sendSuccess(
      res,
      {
        message:
          "Partner webhook subscription created successfully",
        data,
      },
      201
    );
  });

const createRateLimitPolicy =
  asyncHandler(async (req, res) => {
    const data =
      await service
        .createRateLimitPolicy({
          auth: req.auth,
          body: req.body,
        });

    return sendSuccess(
      res,
      {
        message:
          "API rate-limit policy created successfully",
        data,
      },
      201
    );
  });

module.exports = {
  createPartnerApplication,
  approvePartner,
  issueToken,
  createConsent,
  authoriseConsent,
  revokeConsent,
  createWebhookSubscription,
  createRateLimitPolicy,
};
