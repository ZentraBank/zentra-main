import { Bell, Building2, CircleDollarSign, FileClock, LayoutDashboard, ReceiptText, Settings, ShieldCheck, Users, WalletCards } from "lucide-react";

export const platformNavigation = [
  ["Dashboard", "/dashboard", "platform.dashboard.read", LayoutDashboard],
  ["Tenants", "/tenants", "platform.tenants.read", Building2],
  ["Administrators", "/administrators", "platform.administrators.read", ShieldCheck],
  ["Subscriptions", "/subscriptions", "platform.subscriptions.read", CircleDollarSign],
  ["Users", "/users", "platform.users.read", Users],
  ["Accounts", "/accounts", "platform.accounts.read", WalletCards],
  ["Transactions", "/transactions", "platform.transactions.read", ReceiptText],
  ["Notifications", "/notifications", "platform.notifications.read", Bell],
  ["Audit logs", "/audit-logs", "platform.audit_logs.read", FileClock],
  ["Settings", "/settings", "platform.settings.read", Settings],
] as const;
