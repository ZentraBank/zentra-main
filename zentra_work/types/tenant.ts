export type TenantFeature = {
  key: string;
  enabled: boolean;
  configuration?: unknown;
};

export type ClientTenant = {
  id: string;
  app_name: string;
  slug: string;
  domain: string;
  logo_url?: string | null;
  primary_color?: string | null;
  secondary_color?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  country_code?: string | null;
  currency?: string | null;
  timezone?: string | null;
  tenant_features: TenantFeature[];
  settings?: Record<string, unknown>;
};
