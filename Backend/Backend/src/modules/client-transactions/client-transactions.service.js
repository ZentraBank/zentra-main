const ApiError = require("../../utils/ApiError");
const repository = require("./client-transactions.repository");

async function listOwn({ auth, query }) {
  const page = Math.max(1, Number(query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 20));
  const entryType = ["credit", "debit"].includes(query.type) ? query.type : undefined;
  return repository.listOwn({
    tenantId: auth.tenantId,
    userId: auth.userId,
    accountId: query.accountId || undefined,
    entryType,
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });
}

async function getOwn({ auth, id }) {
  const transaction = await repository.findOwnById({
    id,
    tenantId: auth.tenantId,
    userId: auth.userId,
  });
  if (!transaction) throw ApiError.notFound("Transaction not found");
  return transaction;
}

module.exports = { listOwn, getOwn };
