const asyncHandler =
  require("../../utils/asyncHandler");

const {
  sendSuccess,
} = require("../../utils/response");

const service =
  require("./fx.service");

const createRateSource =
  asyncHandler(async (req, res) => {
    const data =
      await service.createRateSource({
        auth: req.auth,
        body: req.body,
      });

    return sendSuccess(
      res,
      {
        message:
          "FX rate source created successfully",
        data,
      },
      201
    );
  });

const createRate =
  asyncHandler(async (req, res) => {
    const data =
      await service.createRate({
        auth: req.auth,
        body: req.body,
      });

    return sendSuccess(
      res,
      {
        message:
          "FX rate created successfully",
        data,
      },
      201
    );
  });

const createSpreadRule =
  asyncHandler(async (req, res) => {
    const data =
      await service.createSpreadRule({
        auth: req.auth,
        body: req.body,
      });

    return sendSuccess(
      res,
      {
        message:
          "FX spread rule created successfully",
        data,
      },
      201
    );
  });

const createQuote =
  asyncHandler(async (req, res) => {
    const data =
      await service.createQuote({
        auth: req.auth,
        body: req.body,
      });

    return sendSuccess(
      res,
      {
        message:
          data.idempotent
            ? "Existing FX quote returned"
            : "FX quote created successfully",
        data,
      },
      data.idempotent
        ? 200
        : 201
    );
  });

const executeConversion =
  asyncHandler(async (req, res) => {
    const data =
      await service.executeConversion({
        auth: req.auth,
        quoteId:
          req.params.quoteId,
        body: req.body,
      });

    return sendSuccess(
      res,
      {
        message:
          "FX conversion posted successfully",
        data,
      },
      201
    );
  });

module.exports = {
  createRateSource,
  createRate,
  createSpreadRule,
  createQuote,
  executeConversion,
};
