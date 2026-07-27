const crypto = require("crypto");
const db = require("../../config/db");
const repo = require("./transfers.repository");

const httpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const featureNumber = (auth, key) => {
  const feature = auth.planFeatures?.[key];
  const value = Number(feature?.value);
  if (!feature?.enabled || !Number.isFinite(value)) {
    throw httpError(403, `Your current plan does not include ${key}`);
  }
  return value;
};

const makeReference = () =>
  `ZTR-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

const createInternalTransfer = async ({ auth, body }) => {
  if (!auth.subscriptionId || !auth.planId) {
    throw httpError(403, "An active subscription is required");
  }

  const transferLimit = featureNumber(auth, "transfer_limit");
  const dailyLimit = featureNumber(auth, "daily_transfer_limit");
  const amount = Number(body.amount);

  if (amount > transferLimit) {
    throw httpError(403, `Your current plan allows a maximum of ${transferLimit} per transfer`);
  }

  const dailyTotal = await repo.getDailyCompletedTotal({
    userId: auth.userId,
    tenantId: auth.tenantId,
  });

  if (dailyTotal + amount > dailyLimit) {
    throw httpError(403, `This transfer would exceed your daily transfer limit of ${dailyLimit}`);
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const source = await repo.findAccountForUpdate({
      connection,
      accountId: body.sourceAccountId,
      tenantId: auth.tenantId,
    });

    if (!source || source.user_id !== auth.userId) {
      throw httpError(404, "Source account not found");
    }

    const destination = await repo.findAccountByNumberForUpdate({
      connection,
      accountNumber: body.destinationAccountNumber,
      tenantId: auth.tenantId,
    });

    if (!destination) throw httpError(404, "Destination account not found");
    if (source.id === destination.id) {
      throw httpError(400, "Source and destination accounts cannot be the same");
    }
    if (source.status !== "active" || destination.status !== "active") {
      throw httpError(403, "Both accounts must be active");
    }
    if (source.currency !== body.currency || destination.currency !== body.currency) {
      throw httpError(400, "Account currency does not match transfer currency");
    }

    const debited = await repo.debitAccount({
      connection,
      accountId: source.id,
      tenantId: auth.tenantId,
      amount,
    });
    if (!debited) throw httpError(400, "Insufficient balance or inactive source account");

    const credited = await repo.creditAccount({
      connection,
      accountId: destination.id,
      tenantId: auth.tenantId,
      amount,
    });
    if (!credited) throw httpError(400, "Unable to credit destination account");

    const transferId = await repo.createTransfer({
      connection,
      tenantId: auth.tenantId,
      userId: auth.userId,
      sourceAccountId: source.id,
      destinationAccountId: destination.id,
      destinationAccountNumber: destination.account_number,
      amount,
      currency: body.currency,
      description: body.description || null,
      status: "completed",
      reference: makeReference(),
    });

    await repo.createLedgerEntry({
      connection,
      tenantId: auth.tenantId,
      accountId: source.id,
      transferId,
      entryType: "debit",
      amount,
      balanceAfter: Number(source.balance) - amount,
      description: body.description || "Internal transfer debit",
    });

    await repo.createLedgerEntry({
      connection,
      tenantId: auth.tenantId,
      accountId: destination.id,
      transferId,
      entryType: "credit",
      amount,
      balanceAfter: Number(destination.balance) + amount,
      description: body.description || "Internal transfer credit",
    });

    await connection.commit();
    return repo.findById({ transferId, tenantId: auth.tenantId });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const listOwn = ({ auth, page, pageSize }) =>
  repo.findByUser({
    userId: auth.userId,
    tenantId: auth.tenantId,
    limit: Math.min(pageSize, 100),
    offset: (page - 1) * Math.min(pageSize, 100),
  });

const getOwn = async ({ auth, transferId }) => {
  const transfer = await repo.findById({ transferId, tenantId: auth.tenantId });
  if (!transfer || transfer.user_id !== auth.userId) {
    throw httpError(404, "Transfer not found");
  }
  return transfer;
};

module.exports = { createInternalTransfer, listOwn, getOwn };
