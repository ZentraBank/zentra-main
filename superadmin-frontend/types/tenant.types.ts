export type TenantStatus = "ACTIVE" | "PENDING" | "SUSPENDED" | "DISABLED";

export type Tenant = {
  id: string;
  name: string;
  code: string;
  domain: string;
  country: string;
  currency: string;
  status: TenantStatus;
  subscriptionPlan: string;
  userCount: number;
  createdAt: string;
};
