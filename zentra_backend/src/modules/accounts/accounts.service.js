const repo = require("./accounts.repository");
const generateAccountNumber = require("../../utils/generateAccountNumber");

const httpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const listOwn = ({ userId, tenantId }) =>
  repo.findByUser({ userId, tenantId });

const getOwn = async ({ accountId, userId, tenantId }) => {
  const account = await repo.findById({ accountId, tenantId });
  if (!account || account.user_id !== userId) {
    throw httpError(404, "Account not found");
  }
  return account;
};

const createOwn = async ({ auth, body }) => {
  if (!auth.subscriptionId || !auth.planId) {
    throw httpError(403, "An active subscription is required");
  }

  const feature = auth.planFeatures?.number_of_accounts;
  const limit = Number(feature?.value);

  if (!feature?.enabled || !Number.isFinite(limit)) {
    throw httpError(403, "Your plan does not allow account creation");
  }

  const count = await repo.countByUser({
    userId: auth.userId,
    tenantId: auth.tenantId
  });

  if (count >= limit) {
    throw httpError(
      403,
      `Your current plan allows a maximum of ${limit} account${limit === 1 ? "" : "s"}`
    );
  }

  let accountNumber;
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const candidate = generateAccountNumber();
    const exists = await repo.existsByNumber({
      accountNumber: candidate,
      tenantId: auth.tenantId
    });
    if (!exists) {
      accountNumber = candidate;
      break;
    }
  }

  if (!accountNumber) {
    throw httpError(500, "Unable to generate a unique account number");
  }

  return repo.create({
    userId: auth.userId,
    tenantId: auth.tenantId,
    accountNumber,
    accountName: body.accountName,
    accountType: body.accountType,
    currency: body.currency
  });
};

const setStatus = async ({ accountId, tenantId, status }) => {
  const account = await repo.findById({ accountId, tenantId });
  if (!account) throw httpError(404, "Account not found");
  return repo.updateStatus({ accountId, tenantId, status });
};

const listTenantAccounts = ({ tenantId }) =>
  repo.findByTenant({ tenantId });

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
    const error =
      new Error(
        "Account not found"
      );

    error.statusCode = 404;

    throw error;
  }

  return account;
};

module.exports = { listOwn, getOwn, createOwn, setStatus, listTenantAccounts, getTenantAccount };
