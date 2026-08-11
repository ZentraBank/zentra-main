const requireRole = require("../../middleware/role.middleware");

router.post(
  "/admin-credit",
  requireRole("tenant_admin", "super_admin"),
  transactionController.adminCredit
);

router.post(
  "/admin-debit",
  requireRole("tenant_admin", "super_admin"),
  transactionController.adminDebit
);