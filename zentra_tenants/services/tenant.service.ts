import { api } from "@/lib/api";
import type { Tenant } from "@/types/tenant.types";

type TenantApiResponse = {
  id: string;
  name: string;
  slug: string;
  domain: string | null;

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

export type UpdateTenantProfilePayload = {
  name?: string;
  appName?: string;
  logoUrl?: string | null;
  primaryColor?: string;
  secondaryColor?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  countryCode?: string;
  defaultCurrency?: string;
  timezone?: string;
};

export type TenantDomainStatus =
  | "pending"
  | "verification_pending"
  | "verified"
  | "provisioning"
  | "active"
  | "failed"
  | "disconnected";

export type TenantDomain = {
  id: string;
  domain: string;

  type:
    | "temporary"
    | "custom";

  status: TenantDomainStatus;

  isPrimary: boolean;

  verificationMethod:
    | "dns_txt"
    | "dns_cname"
    | null;

  targetHost:
    | string
    | null;

  sslStatus:
    | "pending"
    | "active"
    | "failed"
    | null;

  verificationAttempts: number;

  lastVerificationAt:
    | string
    | null;

  verifiedAt:
    | string
    | null;

  activatedAt:
    | string
    | null;

  failureReason:
    | string
    | null;

  createdAt: string;
  updatedAt: string;
};

export type CreateDomainResponse = {
  id: string;
  domain: string;

  type:
    | "temporary"
    | "custom";

  status: TenantDomainStatus;

  isPrimary: boolean;

  sslStatus:
    | "pending"
    | "active"
    | "failed"
    | null;

  verification: {
    method: "dns_txt";
    recordType: "TXT";
    host: string;
    value: string;
  };

  connection: {
    record?: {
      type: string;
      host: string;
      value: string;
    };

    targetHost: string;
  };
};

export type DomainStatusResponse = {
  id: string;
  domain: string;
  status: TenantDomainStatus;

  sslStatus?:
    | string
    | null;

  isPrimary?: boolean;

  provider?: string;

  providerStatus?: string;

  ownershipVerification?:
    unknown;

  ownershipVerificationHttp?:
    unknown;
};

const mapTenant = (
  data: TenantApiResponse
): Tenant => {
  return {
    id: data.id,

    app_name:
      data.branding.appName ||
      data.name,

    slug:
      data.slug,

    domain:
      data.domain,

    logo_url:
      data.branding.logoUrl,

    primary_color:
      data.branding.primaryColor,

    secondary_color:
      data.branding.secondaryColor,

    contact_email:
      data.contact?.email,

    contact_phone:
      data.contact?.phone,

    country_code:
      data.localisation
        ?.countryCode,

    currency:
      data.localisation
        ?.currency,

    timezone:
      data.localisation
        ?.timezone,

    settings:
      data.settings,

    tenant_features:
      Object.entries(
        data.features || {}
      ).map(
        ([
          key,
          feature,
        ]) => ({
          key,
          enabled:
            feature.enabled,

          configuration:
            feature.configuration,
        })
      ),
  };
};

export async function getCurrentTenant(): Promise<Tenant> {
  const response =
    await api.get<{
      data: TenantApiResponse;
    }>(
      "/tenants/current"
    );

  return mapTenant(
    response.data.data
  );
}

export async function updateCurrentTenant(
  payload: UpdateTenantProfilePayload
): Promise<Tenant> {
  const response =
    await api.patch<{
      data: TenantApiResponse;
    }>(
      "/tenants/current",
      payload
    );

  return mapTenant(
    response.data.data
  );
}

export async function listTenantDomains(): Promise<
  TenantDomain[]
> {
  const response =
    await api.get<{
      data: TenantDomain[];
    }>(
      "/tenants/current/domains"
    );

  return (
    response.data.data || []
  );
}

export async function createTenantDomain(
  domain: string
): Promise<CreateDomainResponse> {
  const response =
    await api.post<{
      data: CreateDomainResponse;
    }>(
      "/tenants/current/domains",
      {
        domain,
      }
    );

  return response.data.data;
}

export async function verifyTenantDomain(
  domainId: string
) {
  const response =
    await api.post(
      `/tenants/current/domains/${domainId}/verify`,
      {}
    );

  return response.data.data;
}

export async function provisionTenantDomain(
  domainId: string
) {
  const response =
    await api.post(
      `/tenants/current/domains/${domainId}/provision`,
      {}
    );

  return response.data.data;
}

export async function refreshTenantDomainStatus(
  domainId: string
): Promise<DomainStatusResponse> {
  const response =
    await api.get<{
      data: DomainStatusResponse;
    }>(
      `/tenants/current/domains/${domainId}/status`
    );

  return response.data.data;
}

export async function disconnectTenantDomain(
  domainId: string
) {
  const response =
    await api.delete(
      `/tenants/current/domains/${domainId}`
    );

  return response.data.data;
}

export type TenantPlatformSettings = {
  "platform.domains"?: {
    purchaseUrl?: string;
    purchaseLabel?: string;
    supportEmail?: string;
  };
};

export async function getTenantPlatformSettings(): Promise<TenantPlatformSettings> {
  const response =
    await api.get<{
      data: TenantPlatformSettings;
    }>(
      "/tenants/current/platform-settings"
    );

  return response.data.data || {};
}


export const tenantService = {
  getCurrentTenant,
  updateCurrentTenant,

  listTenantDomains,
  createTenantDomain,
  verifyTenantDomain,
  provisionTenantDomain,
  refreshTenantDomainStatus,
  disconnectTenantDomain,

  getTenantPlatformSettings,
};