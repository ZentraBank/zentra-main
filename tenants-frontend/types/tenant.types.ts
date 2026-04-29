export type TenantFeature = {
  key: string;
  enabled: boolean;
};

export type Tenant = {
  id: number;
  app_name: string;
  logo_url?: string | null;
  primary_color?: string | null;
  tenant_features?: TenantFeature[];
};