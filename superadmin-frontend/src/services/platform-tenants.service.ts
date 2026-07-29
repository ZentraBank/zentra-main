import { apiRequest } from "@/src/lib/api-client";
import type {
  CreateTenantPayload,
  CreateTenantResponse,
  Tenant,
  TenantDetails,
  TenantFeatureOverride,
  TenantListFilters,
  TenantStatus,
} from "@/src/types/tenant";

const buildQuery = (
  filters: TenantListFilters
) => {
  const query = new URLSearchParams();

  if (filters.page) {
    query.set("page", String(filters.page));
  }

  if (filters.limit) {
    query.set("limit", String(filters.limit));
  }

  if (filters.search) {
    query.set("search", filters.search);
  }

  if (filters.status) {
    query.set("status", filters.status);
  }

  const value = query.toString();
  return value ? `?${value}` : "";
};

export const platformTenantsService = {
  list(filters: TenantListFilters = {}) {
    return apiRequest<Tenant[]>(
      `/superadmin/tenants${buildQuery(filters)}`
    );
  },

  getById(tenantId: string) {
    return apiRequest<TenantDetails>(
      `/superadmin/tenants/${tenantId}`
    );
  },

  create(payload: CreateTenantPayload) {
    return apiRequest<CreateTenantResponse>(
      "/superadmin/tenants",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  },

  updateStatus(
    tenantId: string,
    status: Exclude<TenantStatus, "pending">
  ) {
    return apiRequest<Tenant>(
      `/superadmin/tenants/${tenantId}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }
    );
  },

  updateFeatures(
    tenantId: string,
    features: Record<string, boolean>,
    reason?: string
  ) {
    return apiRequest<TenantFeatureOverride[]>(
      `/superadmin/tenants/${tenantId}/features`,
      {
        method: "PATCH",
        body: JSON.stringify({
          features,
          reason,
        }),
      }
    );
  },
};
