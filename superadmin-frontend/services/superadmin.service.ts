import { apiRequest } from "@/lib/api";

export type DashboardSummary = {
  totalTenants: number;
  totalAdministrators: number;
  totalUsers: number;
  totalAccounts: number;
  transactionsToday: number;
  pendingPaymentProofs: number;
  openSecurityAlerts: number;
};

export function getDashboardSummary(token: string) {
  return apiRequest<DashboardSummary>("/superadmin/dashboard/summary", { token });
}
