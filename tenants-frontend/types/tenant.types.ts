export type TenantFeature = {
  key: string;
  enabled: boolean;
};

export type Tenant = {
  id: number;
    app_name: string;
  slug: string;
  domain: string;
  logo_url?: string | null;
  primary_color?: string | null;
  status: string;
  subscription_status: string;
  tenant_features?: TenantFeature[];
};