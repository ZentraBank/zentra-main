import { apiRequest } from "@/lib/api-client";
import type { ClientTenant } from "@/types/tenant";

type TenantApiResponse = {
  id: number;
  name: string;
  slug: string;
  domain: string;
  branding: {
    appName: string;
    logoUrl?: string | null;
    primaryColor?: string | null;
    secondaryColor?: string | null;
  };
  contact?: {
    email?: string | null;
    phone?: string | null;
  };
  localisation?: {
    countryCode?: string | null;
    currency?: string | null;
    timezone?: string | null;
  };
  settings?: Record<string, unknown>;
  features?: Record<
    string,
    {
      enabled: boolean;
      configuration?: unknown;
    }
  >;
};

export async function getCurrentTenant(): Promise<ClientTenant> {
  const data = await apiRequest<TenantApiResponse>("/tenants/current", {
    skipAuth: true,
  });

  return {
    id: data.id,
    app_name: data.branding.appName || data.name,
    slug: data.slug,
    domain: data.domain,
    logo_url: data.branding.logoUrl,
    primary_color: data.branding.primaryColor,
    secondary_color: data.branding.secondaryColor,
    contact_email: data.contact?.email,
    contact_phone: data.contact?.phone,
    country_code: data.localisation?.countryCode,
    currency: data.localisation?.currency,
    timezone: data.localisation?.timezone,
    settings: data.settings,
    tenant_features: Object.entries(data.features ?? {}).map(
      ([key, feature]) => ({
        key,
        enabled: feature.enabled,
        configuration: feature.configuration,
      }),
    ),
  };
}
