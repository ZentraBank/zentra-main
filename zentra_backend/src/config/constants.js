const USER_ROLES = Object.freeze({
  PLATFORM_SUPERADMIN: "platform_superadmin",
  TENANT_ADMIN: "tenant_admin",
  SUPPORT_AGENT: "support_agent",
  CUSTOMER: "customer",
});

const TENANT_STATUSES = Object.freeze({
  ACTIVE: "active",
  INACTIVE: "inactive",
  SUSPENDED: "suspended",
});

const USER_STATUSES = Object.freeze({
  ACTIVE: "active",
  INACTIVE: "inactive",
  SUSPENDED: "suspended",
  PENDING: "pending",
});

const ACCOUNT_STATUSES = Object.freeze({
  ACTIVE: "active",
  INACTIVE: "inactive",
  FROZEN: "frozen",
  DORMANT: "dormant",
  CLOSED: "closed",
});

const TRANSACTION_STATUSES = Object.freeze({
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELLED: "cancelled",
  REJECTED: "rejected",
});

const TRANSACTION_DIRECTIONS = Object.freeze({
  CREDIT: "credit",
  DEBIT: "debit",
});

const DEFAULT_PAGINATION = Object.freeze({
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
});

module.exports = {
  USER_ROLES,
  TENANT_STATUSES,
  USER_STATUSES,
  ACCOUNT_STATUSES,
  TRANSACTION_STATUSES,
  TRANSACTION_DIRECTIONS,
  DEFAULT_PAGINATION,
};