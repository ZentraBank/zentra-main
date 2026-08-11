const asyncHandler =
  require("../../utils/asyncHandler");

const {
  sendSuccess,
} = require("../../utils/response");

const service =
  require("./investments.service");

const createProduct =
  asyncHandler(async (req, res) => {
    const data =
      await service.createProduct({
        auth: req.auth,
        body: req.body,
      });

    return sendSuccess(
      res,
      {
        message:
          "Investment product created successfully",
        data,
      },
      201
    );
  });

const listProducts =
  asyncHandler(async (req, res) => {
    const data =
      await service.listProducts({
        auth: req.auth,
        query: req.query,
      });

    return sendSuccess(res, {
      message:
        "Investment products retrieved successfully",
      data,
    });
  });

const updateProduct =
  asyncHandler(async (req, res) => {
    const data =
      await service.updateProduct({
        auth: req.auth,
        productId:
          req.params.productId,
        body: req.body,
      });

    return sendSuccess(res, {
      message:
        "Investment product updated successfully",
      data,
    });
  });

const subscribe =
  asyncHandler(async (req, res) => {
    const data =
      await service.subscribe({
        auth: req.auth,
        body: req.body,
      });

    return sendSuccess(
      res,
      {
        message:
          "Investment started successfully",
        data,
      },
      201
    );
  });

const listMine =
  asyncHandler(async (req, res) => {
    const data =
      await service.listMine({
        auth: req.auth,
        query: req.query,
      });

    return sendSuccess(res, {
      message:
        "Investments retrieved successfully",
      data,
    });
  });

const requestWithdrawal =
  asyncHandler(async (req, res) => {
    const data =
      await service.requestWithdrawal({
        auth: req.auth,
        investmentId:
          req.params.investmentId,
        body: req.body,
      });

    return sendSuccess(
      res,
      {
        message:
          "Investment withdrawal requested successfully",
        data,
      },
      201
    );
  });

const listWithdrawals =
  asyncHandler(async (req, res) => {
    const data =
      await service.listWithdrawals({
        auth: req.auth,
        query: req.query,
      });

    return sendSuccess(res, {
      message:
        "Investment withdrawals retrieved successfully",
      data,
    });
  });

const reviewWithdrawal =
  asyncHandler(async (req, res) => {
    const data =
      await service.reviewWithdrawal({
        auth: req.auth,
        withdrawalId:
          req.params.withdrawalId,
        body: req.body,
      });

    return sendSuccess(res, {
      message:
        "Investment withdrawal reviewed successfully",
      data,
    });
  });

const completeWithdrawal =
  asyncHandler(async (req, res) => {
    const data =
      await service.completeWithdrawal({
        auth: req.auth,
        withdrawalId:
          req.params.withdrawalId,
      });

    return sendSuccess(res, {
      message:
        "Investment withdrawal completed successfully",
      data,
    });
  });

const markMatured =
  asyncHandler(async (req, res) => {
    const count =
      await service.markMatured({
        auth: req.auth,
      });

    return sendSuccess(res, {
      message:
        "Matured investments updated successfully",
      data: {
        updatedCount: count,
      },
    });
  });

module.exports = {
  createProduct,
  listProducts,
  updateProduct,
  subscribe,
  listMine,
  requestWithdrawal,
  listWithdrawals,
  reviewWithdrawal,
  completeWithdrawal,
  markMatured,
};
