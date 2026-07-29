export type TenantStatus =
  | "pending"
  | "active"
  | "suspended"
  | "terminated";

export type Tenant = {
  id: string;
  code: string;
  name: string;
  app_name: string;
  logo_url: string | null;
  primary_color: string;
  status: TenantStatus;
  created_at: string;
  updated_at: string;
};

export type TenantFeatureOverride = {
  id: string;
  tenant_id: string;
  feature_code: string;
  is_enabled: boolean;
  override_reason: string | null;
  effective_from?: string;
  effective_to?: string | null;
  created_at: string;
  updated_at: string;
};

export type TenantDetails = {
  tenant: Tenant;
  featureOverrides: TenantFeatureOverride[];
};

export type CreateTenantPayload = {
  code: string;
  name: string;
  appName: string;
  logoUrl?: string;
  primaryColor: string;
  planId: string;
  ownerFirstName: string;
  ownerLastName: string;
  ownerEmail: string;
};

export type CreateTenantResponse = {
  tenantId: string;
  ownerUserId: string;
  subscriptionId: string;
  status: TenantStatus;
};

export type TenantListFilters = {
  page?: number;
  limit?: number;
  search?: string;
  status?: TenantStatus | "";
};
