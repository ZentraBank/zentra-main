const accountRepo = require("./account.repository");

async function getMyAccounts(userId, tenantId) {
  return accountRepo.findAccountsByUserAndTenant(userId, tenantId);
}

async function getAccountDetails(accountId, tenantId, currentUser) {
  const account = await accountRepo.findAccountByIdAndTenant(accountId, tenantId);

  if (!account) {
    throw new Error("Account not found");
  }

  const isOwner = account.user_id === currentUser.id;
  const isAdmin = ["tenant_admin", "super_admin"].includes(currentUser.role);

  if (!isOwner && !isAdmin) {
    throw new Error("You do not have permission to view this account");
  }

  return account;
}

async function getAccountBalance(accountId, tenantId, currentUser) {
  const account = await getAccountDetails(accountId, tenantId, currentUser);

  return {
    account_id: account.id,
    account_number: account.account_number,
    balance: account.balance,
    currency: account.currency,
    status: account.status,
  };
}

module.exports = {
  getMyAccounts,
  getAccountDetails,
  getAccountBalance,
};