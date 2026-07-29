import { apiRequest } from "@/src/lib/api-client";
import type {
  CrossTenantAccount,
  CrossTenantTransaction,
  CrossTenantUser,
} from "@/src/types/platform-operations";

const buildQuery = (
  values: Record<string, string | number | undefined>
) => {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(values)) {
    if (
      value !== undefined &&
      value !== ""
    ) {
      query.set(key, String(value));
    }
  }

  const output = query.toString();
  return output ? `?${output}` : "";
};

export const platformSearchService = {
  users(filters: {
    page?: number;
    limit?: number;
    search?: string;
    tenantId?: string;
    status?: string;
    userType?: string;
  }) {
    return apiRequest<CrossTenantUser[]>(
      `/superadmin/search/users${buildQuery(filters)}`
    );
  },

  accounts(filters: {
    page?: number;
    limit?: number;
    search?: string;
    tenantId?: string;
    status?: string;
    accountType?: string;
  }) {
    return apiRequest<CrossTenantAccount[]>(
      `/superadmin/search/accounts${buildQuery(filters)}`
    );
  },

  transactions(filters: {
    page?: number;
    limit?: number;
    search?: string;
    tenantId?: string;
    status?: string;
    transactionType?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    return apiRequest<CrossTenantTransaction[]>(
      `/superadmin/search/transactions${buildQuery(filters)}`
    );
  },
};
