const asyncHandler =
  require("../../utils/asyncHandler");

const {
  sendSuccess,
} = require("../../utils/response");

const service =
  require("./webhooks.service");

const createEndpoint =
  asyncHandler(async (req, res) => {
    const data =
      await service.createEndpoint({
        auth: req.auth,
        body: req.body,
      });

    return sendSuccess(
      res,
      {
        message:
          "Webhook endpoint created successfully",
        data,
      },
      201
    );
  });

const listEndpoints =
  asyncHandler(async (req, res) => {
    const data =
      await service.listEndpoints({
        auth: req.auth,
        query: req.query,
      });

    return sendSuccess(res, {
      message:
        "Webhook endpoints retrieved successfully",
      data,
    });
  });

const updateEndpoint =
  asyncHandler(async (req, res) => {
    const data =
      await service.updateEndpoint({
        auth: req.auth,
        endpointId:
          req.params.endpointId,
        body: req.body,
      });

    return sendSuccess(res, {
      message:
        "Webhook endpoint updated successfully",
      data,
    });
  });

const listDeliveries =
  asyncHandler(async (req, res) => {
    const data =
      await service.listDeliveries({
        auth: req.auth,
        query: req.query,
      });

    return sendSuccess(res, {
      message:
        "Webhook deliveries retrieved successfully",
      data,
    });
  });

const replayDelivery =
  asyncHandler(async (req, res) => {
    const data =
      await service.replayDelivery({
        auth: req.auth,
        deliveryId:
          req.params.deliveryId,
      });

    return sendSuccess(
      res,
      {
        message:
          "Webhook delivery queued for replay",
        data,
      },
      202
    );
  });

module.exports = {
  createEndpoint,
  listEndpoints,
  updateEndpoint,
  listDeliveries,
  replayDelivery,
};
