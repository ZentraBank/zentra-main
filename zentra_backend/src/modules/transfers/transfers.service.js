const crypto = require("crypto");
const db = require("../../config/db");
const repo = require("./transfers.repository");
const transactionPinService = require(
  "../transaction-pin/transaction-pin.service"
);
const notifications = require(
  "../notifications/notifications.repository"
);

const httpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const featureNumber = (auth, key) => {
  const feature = auth.planFeatures?.[key];
  const value = Number(feature?.value);

  if (!feature?.enabled || !Number.isFinite(value)) {
    throw httpError(
      403,
      `Your current plan does not include ${key}`
    );
  }

  return value;
};

const getTransferLimits = (auth) => {
  const defaultTransferLimit = 10000;
  const defaultDailyTransferLimit = 25000;

  if (!auth.subscriptionId || !auth.planId) {
    return {
      transferLimit: defaultTransferLimit,
      dailyTransferLimit: defaultDailyTransferLimit,
    };
  }

  return {
    transferLimit: featureNumber(auth, "transfer_limit"),
    dailyTransferLimit: featureNumber(
      auth,
      "daily_transfer_limit"
    ),
  };
};

const makeReference = () =>
  `ZTR-${Date.now()}-${crypto
    .randomBytes(3)
    .toString("hex")
    .toUpperCase()}`;

/*
|--------------------------------------------------------------------------
| Client transfer services
|--------------------------------------------------------------------------
*/

const createInternalTransfer = async ({ auth, body }) => {
  const amount = Number(body.amount);
  const transferType = body.transferType || "internal";

  if (!Number.isFinite(amount) || amount <= 0) {
    throw httpError(
      400,
      "Transfer amount must be greater than zero"
    );
  }

  const {
    transferLimit,
    dailyTransferLimit,
  } = getTransferLimits(auth);

  await transactionPinService.verify({
    userId: auth.userId,
    pin: body.transactionPin,
  });

  if (amount > transferLimit) {
    throw httpError(
      403,
      `Your current account allows a maximum of ${transferLimit} per transfer`
    );
  }

  const dailyTotal =
    Number(
      await repo.getDailyCompletedTotal({
        userId: auth.userId,
        tenantId: auth.tenantId,
      })
    ) || 0;

  if (dailyTotal + amount > dailyTransferLimit) {
    throw httpError(
      403,
      `Your current account allows a maximum of ${dailyTransferLimit} per day`
    );
  }

  if (
    transferType === "external" &&
    (process.env.PAYMENT_MODE || "simulation") !==
      "simulation"
  ) {
    throw httpError(
      503,
      "External payment providers are not configured"
    );
  }

  const connection = await db.pool.getConnection();

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

    if (source.status !== "active") {
      throw httpError(
        403,
        "The source account must be active"
      );
    }

    if (source.currency !== body.currency) {
      throw httpError(
        400,
        "Account currency does not match transfer currency"
      );
    }

    let destination = null;

    if (transferType === "internal") {
      destination =
        await repo.findAccountByNumberForUpdate({
          connection,
          accountNumber:
            body.destinationAccountNumber,
          tenantId: auth.tenantId,
        });

      if (!destination) {
        throw httpError(
          404,
          "Destination account not found"
        );
      }

      if (source.id === destination.id) {
        throw httpError(
          400,
          "Source and destination accounts cannot be the same"
        );
      }

      if (destination.status !== "active") {
        throw httpError(
          403,
          "The destination account must be active"
        );
      }

      if (destination.currency !== body.currency) {
        throw httpError(
          400,
          "Account currency does not match transfer currency"
        );
      }
    }

    const debited = await repo.debitAccount({
      connection,
      accountId: source.id,
      tenantId: auth.tenantId,
      amount,
    });

    if (!debited) {
      throw httpError(
        400,
        "Insufficient balance or inactive source account"
      );
    }

    if (destination) {
      const credited = await repo.creditAccount({
        connection,
        accountId: destination.id,
        tenantId: auth.tenantId,
        amount,
      });

      if (!credited) {
        throw httpError(
          400,
          "Unable to credit destination account"
        );
      }
    }

    const reference = makeReference();

    const transferId = await repo.createTransfer({
      connection,
      tenantId: auth.tenantId,
      userId: auth.userId,
      sourceAccountId: source.id,
      destinationAccountId: destination?.id || null,
      destinationAccountNumber:
        body.destinationAccountNumber,
      transferType,
      destinationAccountName:
        destination?.account_name ||
        body.destinationAccountName ||
        null,
      destinationBankName: destination
        ? "ZentraBank"
        : body.destinationBankName,
      destinationBankCode: destination
        ? "ZENTRA"
        : body.destinationBankCode,
      settlementMode: destination
        ? "internal"
        : "simulation",
      isSimulated: !destination,
      amount,
      currency: body.currency,
      description: body.description || null,
      status: "completed",
      reference,
    });

    await repo.createLedgerEntry({
      connection,
      tenantId: auth.tenantId,
      accountId: source.id,
      transferId,
      entryType: "debit",
      amount,
      balanceAfter: Number(source.balance) - amount,
      description:
        body.description ||
        `${
          transferType === "external"
            ? "Simulated external"
            : "Internal"
        } transfer debit`,
    });

    if (destination) {
      await repo.createLedgerEntry({
        connection,
        tenantId: auth.tenantId,
        accountId: destination.id,
        transferId,
        entryType: "credit",
        amount,
        balanceAfter:
          Number(destination.balance) + amount,
        description:
          body.description ||
          "Internal transfer credit",
      });
    }

    await notifications.create({
      connection,
      tenantId: auth.tenantId,
      userId: auth.userId,
      notificationType: "transfer_sent",
      title:
        transferType === "external"
          ? "Demo transfer completed"
          : "Transfer completed",
      message: `${amount.toFixed(2)} ${
        body.currency
      } was sent to ${
        destination?.account_name ||
        body.destinationAccountName ||
        body.destinationAccountNumber
      }.`,
      entityType: "transfer",
      entityId: transferId,
      priority: "normal",
      actionUrl: `/receipt?transferId=${transferId}`,
      metadata: {
        reference,
        transferType,
        settlementMode: destination
          ? "internal"
          : "simulation",
      },
    });

    if (destination?.user_id) {
      await notifications.create({
        connection,
        tenantId: auth.tenantId,
        userId: destination.user_id,
        notificationType: "transfer_received",
        title: "Money received",
        message: `${amount.toFixed(2)} ${
          body.currency
        } was credited to your account.`,
        entityType: "transfer",
        entityId: transferId,
        priority: "normal",
        actionUrl: "/transactions",
        metadata: {
          reference,
          sourceAccountNumber:
            source.account_number,
        },
      });
    }

    await connection.commit();

    return repo.findById({
      transferId,
      tenantId: auth.tenantId,
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const listOwn = ({
  auth,
  page,
  pageSize,
}) => {
  const limit = Math.min(pageSize, 100);
  const offset = (page - 1) * limit;

  return repo.findByUser({
    userId: auth.userId,
    tenantId: auth.tenantId,
    limit,
    offset,
  });
};

const getOwn = async ({
  auth,
  transferId,
}) => {
  const transfer = await repo.findById({
    transferId,
    tenantId: auth.tenantId,
  });

  if (!transfer || transfer.user_id !== auth.userId) {
    throw httpError(404, "Transfer not found");
  }

  return transfer;
};

/*
|--------------------------------------------------------------------------
| Tenant administrator services
|--------------------------------------------------------------------------
*/

const listTenant = async ({
  auth,
  page,
  pageSize,
}) => {
  const limit = Math.min(pageSize, 100);
  const offset = (page - 1) * limit;

  const [transfers, total] =
    await Promise.all([
      repo.findByTenant({
        tenantId: auth.tenantId,
        limit,
        offset,
      }),
      repo.countByTenant({
        tenantId: auth.tenantId,
      }),
    ]);

  return {
    transfers,
    pagination: {
      page,
      pageSize: limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getTenant = async ({
  auth,
  transferId,
}) => {
  const transfer = await repo.findById({
    transferId,
    tenantId: auth.tenantId,
  });

  if (!transfer) {
    throw httpError(404, "Transfer not found");
  }

  return transfer;
};

const updateTenant = async ({
  auth,
  transferId,
  body,
}) => {
  const connection = await db.pool.getConnection();

  try {
    await connection.beginTransaction();

    const transfer =
      await repo.findByIdForUpdate({
        connection,
        transferId,
        tenantId: auth.tenantId,
      });

    if (!transfer) {
      throw httpError(
        404,
        "Transfer not found"
      );
    }

    const description =
      typeof body.description === "string"
        ? body.description.trim() || null
        : transfer.description;

    const updated =
      await repo.updateDescription({
        connection,
        transferId,
        tenantId: auth.tenantId,
        description,
      });

    if (!updated) {
      throw httpError(
        400,
        "Unable to update transfer"
      );
    }

    await connection.commit();

    return repo.findById({
      transferId,
      tenantId: auth.tenantId,
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  createInternalTransfer,
  listOwn,
  getOwn,
  listTenant,
  getTenant,
  updateTenant,
};