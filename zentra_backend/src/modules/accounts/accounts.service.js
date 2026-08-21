const repo = require("./accounts.repository");
const db = require("../../config/db");
const generateAccountNumber = require("../../utils/generateAccountNumber");
const notificationsRepo =
  require("../notifications/notifications.repository");

const httpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const listOwn = ({ userId, tenantId }) =>
  repo.findByUser({
    userId,
    tenantId,
  });

const getOwn = async ({
  accountId,
  userId,
  tenantId,
}) => {
  const account =
    await repo.findById({
      accountId,
      tenantId,
    });

  if (
    !account ||
    account.user_id !== userId
  ) {
    throw httpError(
      404,
      "Account not found"
    );
  }

  return account;
};

const createOwn = async ({
  auth,
  body,
}) => {
  /*
   * Clients can create accounts without
   * requiring a subscription plan.
   */

  let accountNumber;

  for (
    let attempt = 0;
    attempt < 10;
    attempt += 1
  ) {
    const candidate =
      generateAccountNumber();

    const exists =
      await repo.existsByNumber({
        accountNumber:
          candidate,

        tenantId:
          auth.tenantId,
      });

    if (!exists) {
      accountNumber =
        candidate;

      break;
    }
  }

  if (!accountNumber) {
    throw httpError(
      500,
      "Unable to generate a unique account number"
    );
  }

  return repo.create({
    userId:
      auth.userId,

    tenantId:
      auth.tenantId,

    accountNumber,

    accountName:
      body.accountName,

    accountType:
      body.accountType,

    currency:
      body.currency,
  });
};

const setStatus = async ({
  accountId,
  tenantId,
  status,
}) => {
  const account =
    await repo.findById({
      accountId,
      tenantId,
    });

  if (!account) {
    throw httpError(
      404,
      "Account not found"
    );
  }

  return repo.updateStatus({
    accountId,
    tenantId,
    status,
  });
};

const listTenantAccounts = ({
  tenantId,
}) =>
  repo.findByTenant({
    tenantId,
  });

const getTenantAccount = async ({
  tenantId,
  accountId,
}) => {
  const account =
    await repo.findTenantAccountById({
      tenantId,
      accountId,
    });

  if (!account) {
    throw httpError(
      404,
      "Account not found"
    );
  }

  return account;
};

const setBalance = async ({
  accountId,
  tenantId,
  balance,
}) => {
  const account =
    await repo.findById({
      accountId,
      tenantId,
    });

  if (!account) {
    throw httpError(
      404,
      "Account not found"
    );
  }

  const nextBalance =
    Number(balance);

  if (
    !Number.isFinite(nextBalance) ||
    nextBalance < 0
  ) {
    throw httpError(
      422,
      "Balance must be a valid non-negative number"
    );
  }

  return repo.updateBalance({
    accountId,
    tenantId,
    balance: nextBalance,
  });
};

const adjustTenantBalance = async ({
  accountId,
  tenantId,
  body,
}) => {
  const amount =
    Number(body.amount);

  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    throw httpError(
      422,
      "Adjustment amount must be greater than zero"
    );
  }

  const adjustment =
    body.type === "credit"
      ? amount
      : -amount;

  const connection =
  await db.pool.getConnection();

  try {
    await connection.beginTransaction();

    const account =
      await repo.findByIdForUpdate({
        connection,
        accountId,
        tenantId,
      });

    if (!account) {
      throw httpError(
        404,
        "Account not found"
      );
    }

    if (
      account.status === "closed"
    ) {
      throw httpError(
        422,
        "Closed accounts cannot be adjusted"
      );
    }

    const currentBalance =
      Number(account.balance || 0);

    const nextBalance =
      currentBalance +
      adjustment;

    if (nextBalance < 0) {
      throw httpError(
        422,
        "Debit adjustment would make the account balance negative"
      );
    }

    const updated =
      await repo.adjustBalance({
        connection,
        accountId,
        tenantId,
        amount:
          adjustment,
      });

    if (!updated) {
      throw httpError(
        500,
        "Unable to adjust account balance"
      );
    }

    await repo.createAdjustmentLedgerEntry({
      connection,
      tenantId,
      accountId,

      entryType:
        body.type ===
        "credit"
          ? "credit"
          : "debit",

      amount,

      balanceAfter:
        nextBalance,

      description:
        body.description ||
        `${
          body.type ===
          "credit"
            ? "Credit"
            : "Debit"
        } adjustment`,
    });
    const formattedAmount =
  new Intl.NumberFormat(
    "en-GB",
    {
      style: "currency",
      currency: account.currency,
    }
  ).format(amount);

await notificationsRepo.create({
  connection,

  tenantId,

  userId:
    account.user_id,

  notificationType:
    body.type === "credit"
      ? "account_credited"
      : "account_debited",

  title:
    body.type === "credit"
      ? "Account credited"
      : "Account debited",

  message:
    body.type === "credit"
      ? `${formattedAmount} has been credited to your ${account.account_type} account.`
      : `${formattedAmount} has been debited from your ${account.account_type} account.`,

  entityType:
    "account",

  entityId:
    account.id,

  priority:
    "normal",

  actionUrl:
    "/transactions",

  metadata: {
    accountId:
      account.id,

    accountNumber:
      account.account_number,

    accountType:
      account.account_type,

    currency:
      account.currency,

    amount,

    adjustmentType:
      body.type,

    balanceAfter:
      nextBalance,

    description:
      body.description ||
      null,
  },
});
    await connection.commit();

    return repo.findById({
      accountId,
      tenantId,
    });
  } catch (error) {
    await connection.rollback();

    throw error;
  } finally {
    connection.release();
  }
};

const listOwnActivity = async ({
  auth,
  page = 1,
  pageSize = 20,
}) => {
  const safePage =
    Number(page) > 0
      ? Number(page)
      : 1;

  const safePageSize =
    Number(pageSize) > 0
      ? Math.min(
          Number(pageSize),
          100
        )
      : 20;

  const offset =
    (safePage - 1) *
    safePageSize;

  const [
    activity,
    total,
  ] =
    await Promise.all([
      repo.findActivityByUser({
        userId:
          auth.userId,

        tenantId:
          auth.tenantId,

        limit:
          safePageSize,

        offset,
      }),

      repo.countActivityByUser({
        userId:
          auth.userId,

        tenantId:
          auth.tenantId,
      }),
    ]);

  return {
    activity,

    pagination: {
      page:
        safePage,

      pageSize:
        safePageSize,

      total,

      totalPages:
        Math.ceil(
          total /
            safePageSize
        ),
    },
  };
};

module.exports = {
  listOwn,
  getOwn,
  createOwn,
  setStatus,
  listTenantAccounts,
  getTenantAccount,
  setBalance,
  adjustTenantBalance,
  listOwnActivity,
};