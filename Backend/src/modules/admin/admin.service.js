const adminRepo = require("./admin.repository");

function isAdmin(user) {
  return ["tenant_admin", "super_admin"].includes(user.role);
}

async function getDashboardStats({ tenantId, user }) {
  if (!isAdmin(user)) {
    throw new Error("Only admins can view analytics");
  }

  const [overview, transaction_summary, recent_transactions, recent_users] =
    await Promise.all([
      adminRepo.getOverviewStats(tenantId),
      adminRepo.getTransactionSummary(tenantId),
      adminRepo.getRecentTransactions(tenantId, 10),
      adminRepo.getRecentUsers(tenantId, 10),
    ]);

  return {
    overview,
    transaction_summary,
    recent_transactions,
    recent_users,
  };
}

module.exports = {
  getDashboardStats,
};