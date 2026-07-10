export const PERMISSIONS = {
  TENANT_VIEW: "tenant:view",
  TENANT_CREATE: "tenant:create",
  TENANT_UPDATE: "tenant:update",
  TENANT_SUSPEND: "tenant:suspend",
  ADMIN_MANAGE: "admin:manage",
  USER_MANAGE: "user:manage",
  ACCOUNT_MANAGE: "account:manage",
  TRANSACTION_MANAGE: "transaction:manage",
  SUBSCRIPTION_MANAGE: "subscription:manage",
  PAYMENT_PROOF_APPROVE: "payment-proof:approve",
  SECURITY_MANAGE: "security:manage",
  SETTINGS_MANAGE: "settings:manage",
  AUDIT_LOG_VIEW: "audit-log:view",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
