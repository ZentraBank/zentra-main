import { apiRequest } from "@/src/lib/api-client";

export type PlatformDomainStatus =
  | "pending"
  | "verification_pending"
  | "verified"
  | "provisioning"
  | "active"
  | "failed"
  | "disconnected";

export type PlatformDomainType =
  | "temporary"
  | "custom";

export type PlatformDomainListItem = {
  id: string;

  tenant_id: string;

  domain: string;

  domain_type:
    PlatformDomainType;

  status:
    PlatformDomainStatus;

  is_primary:
    boolean | number;

  verification_method:
    | "dns_txt"
    | "dns_cname"
    | null;

  target_host:
    string | null;

  ssl_status:
    | "pending"
    | "active"
    | "failed"
    | null;

  provider:
    string | null;

  provider_hostname_id:
    string | null;

  verification_attempts:
    number;

  last_verification_at:
    string | null;

  verified_at:
    string | null;

  activated_at:
    string | null;

  failure_reason:
    string | null;

  created_at:
    string;

  updated_at:
    string;

  tenant_name:
    string;

  tenant_slug:
    string;

  tenant_app_name:
    string | null;

  tenant_status:
    string;
};

export type PlatformDomainDetails = {
  id: string;

  tenantId: string;

  domain: string;

  type:
    PlatformDomainType;

  status:
    PlatformDomainStatus;

  isPrimary:
    boolean;

  verificationMethod:
    | "dns_txt"
    | "dns_cname"
    | null;

  targetHost:
    string | null;

  sslStatus:
    | "pending"
    | "active"
    | "failed"
    | null;

  provider:
    string | null;

  providerHostnameId:
    string | null;

  verificationAttempts:
    number;

  lastVerificationAt:
    string | null;

  verifiedAt:
    string | null;

  activatedAt:
    string | null;

  failureReason:
    string | null;

  createdAt:
    string;

  updatedAt:
    string;

  tenant: {
    name: string;
    slug: string;
    appName: string | null;
    status: string;
  };
};

export type PlatformDomainListParams = {
  page?: number;
  limit?: number;
  search?: string;

  status?:
    PlatformDomainStatus;

  domainType?:
    PlatformDomainType;

  tenantId?: string;
};

const buildQuery = (
  params: PlatformDomainListParams = {}
) => {
  const searchParams =
    new URLSearchParams();

  if (params.page) {
    searchParams.set(
      "page",
      String(params.page)
    );
  }

  if (params.limit) {
    searchParams.set(
      "limit",
      String(params.limit)
    );
  }

  if (params.search) {
    searchParams.set(
      "search",
      params.search
    );
  }

  if (params.status) {
    searchParams.set(
      "status",
      params.status
    );
  }

  if (params.domainType) {
    searchParams.set(
      "domainType",
      params.domainType
    );
  }

  if (params.tenantId) {
    searchParams.set(
      "tenantId",
      params.tenantId
    );
  }

  const query =
    searchParams.toString();

  return query
    ? `?${query}`
    : "";
};

export const platformDomainsService = {
  list(
    params: PlatformDomainListParams = {}
  ) {
    return apiRequest<
      PlatformDomainListItem[]
    >(
      `/superadmin/domains${buildQuery(
        params
      )}`
    );
  },

  get(domainId: string) {
    return apiRequest<
      PlatformDomainDetails
    >(
      `/superadmin/domains/${domainId}`
    );
  },
};