const asyncHandler =
  require("../../utils/asyncHandler");

const {
  sendSuccess,
} = require("../../utils/response");

const service =
  require("./reconciliation.service");

const runLedgerVsAccounts =
  asyncHandler(async (req, res) => {
    const data =
      await service.runLedgerVsAccounts({
        auth: req.auth,
        body: req.body,
      });

    return sendSuccess(
      res,
      {
        message:
          "Ledger reconciliation completed successfully",
        data,
      },
      201
    );
  });

const listRuns =
  asyncHandler(async (req, res) => {
    const data =
      await service.listRuns({
        auth: req.auth,
        query: req.query,
      });

    return sendSuccess(res, {
      message:
        "Reconciliation runs retrieved successfully",
      data,
    });
  });

const getRun =
  asyncHandler(async (req, res) => {
    const data =
      await service.getRun({
        auth: req.auth,
        runId:
          req.params.runId,
      });

    return sendSuccess(res, {
      message:
        "Reconciliation run retrieved successfully",
      data,
    });
  });

const listItems =
  asyncHandler(async (req, res) => {
    const data =
      await service.listItems({
        auth: req.auth,
        runId:
          req.params.runId,
        query: req.query,
      });

    return sendSuccess(res, {
      message:
        "Reconciliation items retrieved successfully",
      data,
    });
  });

const updateItem =
  asyncHandler(async (req, res) => {
    const data =
      await service.updateItem({
        auth: req.auth,
        itemId:
          req.params.itemId,
        body: req.body,
      });

    return sendSuccess(res, {
      message:
        "Reconciliation item updated successfully",
      data,
    });
  });

module.exports = {
  runLedgerVsAccounts,
  listRuns,
  getRun,
  listItems,
  updateItem,
};
