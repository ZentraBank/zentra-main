const transactionRepo = require("./transaction.repository");
const accountRepo = require("../accounts/account.repository");

function validateAmount(amount) {
  if (!amount || Number(amount) <= 0) {
    throw new Error("Amount must be greater than zero");
  }
}

function isAdmin(user) {
  return ["tenant_admin", "super_admin"].includes(user.role);
}

async function getAccountTransactions({
  accountId,
  tenantId,
  user,
  limit,
  offset,
  filters,
}) {
  const account = await accountRepo.findAccountByIdAndTenant(accountId, tenantId);

  if (!account) {
    throw new Error("Account not found");
  }

  const ownsAccount = account.user_id === user.id;

  if (!ownsAccount && !isAdmin(user)) {
    throw new Error("You do not have permission to view these transactions");
  }

  return transactionRepo.findTransactionsByAccount({
    accountId,
    tenantId,
    limit,
    offset,
    type: filters.type,
    status: filters.status,
  });
}

async function getTransactionDetails({ transactionId, tenantId, user }) {
  const transaction = await transactionRepo.findTransactionById(
    transactionId,
    tenantId
  );

  if (!transaction) {
    throw new Error("Transaction not found");
  }

  const account = await accountRepo.findAccountByIdAndTenant(
    transaction.account_id,
    tenantId
  );

  const ownsAccount = account && account.user_id === user.id;

  if (!ownsAccount && !isAdmin(user)) {
    throw new Error("You do not have permission to view this transaction");
  }

  return transaction;
}

async function transfer({ tenantId, user, from_account_id, to_account_number, amount, description }) {
  validateAmount(amount);

  const fromAccount = await accountRepo.findAccountByIdAndTenant(
    from_account_id,
    tenantId
  );

  if (!fromAccount) {
    throw new Error("Sender account not found");
  }

  if (fromAccount.user_id !== user.id && !isAdmin(user)) {
    throw new Error("You do not have permission to transfer from this account");
  }

  const toAccount = await accountRepo.findAccountByNumberAndTenant(
    to_account_number,
    tenantId
  );

  if (!toAccount) {
    throw new Error("Receiver account not found");
  }

  if (fromAccount.id === toAccount.id) {
    throw new Error("Cannot transfer to the same account");
  }

  return transactionRepo.createInternalTransfer({
    tenantId,
    fromAccountId: fromAccount.id,
    toAccountId: toAccount.id,
    amount,
    description,
    createdBy: user.id,
  });
}

async function adminCredit({ tenantId, user, account_id, amount, description }) {
  validateAmount(amount);

  if (!isAdmin(user)) {
    throw new Error("Only admins can credit accounts");
  }

  return transactionRepo.createAdminCredit({
    tenantId,
    accountId: account_id,
    amount,
    description,
    createdBy: user.id,
  });
}

async function adminDebit({ tenantId, user, account_id, amount, description }) {
  validateAmount(amount);

  if (!isAdmin(user)) {
    throw new Error("Only admins can debit accounts");
  }

  return transactionRepo.createAdminDebit({
    tenantId,
    accountId: account_id,
    amount,
    description,
    createdBy: user.id,
  });
}

module.exports = {
  getAccountTransactions,
  getTransactionDetails,
  transfer,
  adminCredit,
  adminDebit,
};