const asyncHandler =
  require("../../utils/asyncHandler");

const {
  sendSuccess,
} = require("../../utils/response");

const service =
  require("./virtual-accounts.service");

const createProgram =
  asyncHandler(async (req, res) => {
    const data =
      await service.createProgram({
        auth: req.auth,
        body: req.body,
      });

    return sendSuccess(
      res,
      {
        message:
          "Virtual account program created successfully",
        data,
      },
      201
    );
  });

const createVirtualAccount =
  asyncHandler(async (req, res) => {
    const data =
      await service.createVirtualAccount({
        auth: req.auth,
        body: req.body,
      });

    return sendSuccess(
      res,
      {
        message:
          "Virtual account created successfully",
        data,
      },
      201
    );
  });

const listMine =
  asyncHandler(async (req, res) => {
    const data =
      await service.listVirtualAccounts({
        auth: req.auth,
        query: req.query,
        mine: true,
      });

    return sendSuccess(res, {
      message:
        "Your virtual accounts were retrieved successfully",
      data,
    });
  });

const listVirtualAccounts =
  asyncHandler(async (req, res) => {
    const data =
      await service.listVirtualAccounts({
        auth: req.auth,
        query: req.query,
      });

    return sendSuccess(res, {
      message:
        "Virtual accounts retrieved successfully",
      data,
    });
  });

const ingestCollection =
  asyncHandler(async (req, res) => {
    const data =
      await service.ingestCollection({
        auth: req.auth,
        body: req.body,
      });

    return sendSuccess(
      res,
      {
        message:
          data.idempotent
            ? "Existing collection returned"
            : "Collection ingested successfully",
        data,
      },
      data.idempotent
        ? 200
        : 201
    );
  });

const manualMatchCollection =
  asyncHandler(async (req, res) => {
    const data =
      await service.manualMatchCollection({
        auth: req.auth,
        collectionId:
          req.params.collectionId,
        body: req.body,
      });

    return sendSuccess(res, {
      message:
        "Collection matched successfully",
      data,
    });
  });

const createSweepRule =
  asyncHandler(async (req, res) => {
    const data =
      await service.createSweepRule({
        auth: req.auth,
        body: req.body,
      });

    return sendSuccess(
      res,
      {
        message:
          "Sweep rule created successfully",
        data,
      },
      201
    );
  });

module.exports = {
  createProgram,
  createVirtualAccount,
  listMine,
  listVirtualAccounts,
  ingestCollection,
  manualMatchCollection,
  createSweepRule,
};
