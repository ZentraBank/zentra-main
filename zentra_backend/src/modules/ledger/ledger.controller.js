const asyncHandler =
  require("../../utils/asyncHandler");

const {
  sendSuccess,
} = require("../../utils/response");

const service =
  require("./ledger.service");

const createLedgerAccount =
  asyncHandler(async (req, res) => {
    const data =
      await service.createLedgerAccount({
        auth: req.auth,
        body: req.body,
      });

    return sendSuccess(
      res,
      {
        message:
          "Ledger account created successfully",
        data,
      },
      201
    );
  });

const postJournal =
  asyncHandler(async (req, res) => {
    const data =
      await service.postJournal({
        auth: req.auth,
        body: req.body,
      });

    return sendSuccess(
      res,
      {
        message:
          data.idempotent
            ? "Existing ledger journal returned"
            : "Ledger journal posted successfully",
        data,
      },
      data.idempotent
        ? 200
        : 201
    );
  });

const reverseJournal =
  asyncHandler(async (req, res) => {
    const data =
      await service.reverseJournal({
        auth: req.auth,
        journalId:
          req.params.journalId,
        body: req.body,
      });

    return sendSuccess(res, {
      message:
        data.idempotent
          ? "Existing reversal returned"
          : "Ledger journal reversed successfully",
      data,
    });
  });

const getBalance =
  asyncHandler(async (req, res) => {
    const data =
      await service.getBalance({
        auth: req.auth,
        ledgerAccountId:
          req.params.ledgerAccountId,
      });

    return sendSuccess(res, {
      message:
        "Ledger balance retrieved successfully",
      data,
    });
  });

const createHold =
  asyncHandler(async (req, res) => {
    const data =
      await service.createHold({
        auth: req.auth,
        body: req.body,
      });

    return sendSuccess(
      res,
      {
        message:
          "Account hold created successfully",
        data,
      },
      201
    );
  });

const releaseHold =
  asyncHandler(async (req, res) => {
    const data =
      await service.releaseHold({
        auth: req.auth,
        holdId:
          req.params.holdId,
      });

    return sendSuccess(res, {
      message:
        "Account hold released successfully",
      data,
    });
  });

const expireHolds =
  asyncHandler(async (req, res) => {
    const count =
      await service.expireHolds({
        auth: req.auth,
      });

    return sendSuccess(res, {
      message:
        "Expired account holds updated successfully",
      data: {
        updatedCount: count,
      },
    });
  });

const listJournals =
  asyncHandler(async (req, res) => {
    const data =
      await service.listJournals({
        auth: req.auth,
        query: req.query,
      });

    return sendSuccess(res, {
      message:
        "Ledger journals retrieved successfully",
      data,
    });
  });

module.exports = {
  createLedgerAccount,
  postJournal,
  reverseJournal,
  getBalance,
  createHold,
  releaseHold,
  expireHolds,
  listJournals,
};
