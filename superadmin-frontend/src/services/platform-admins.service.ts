import { apiRequest } from "@/src/lib/api-client";
import type {
  CreatePlatformAdministratorPayload,
  PlatformAdministrator,
  PlatformAdministratorRole,
  PlatformAdministratorStatus,
} from "@/src/types/platform-admin";

type ListFilters = {
  page?: number;
  limit?: number;
  search?: string;
  role?: PlatformAdministratorRole | "";
  status?: PlatformAdministratorStatus | "";
};

const toQuery = (filters: ListFilters) => {
  const query = new URLSearchParams();

  if (filters.page) query.set("page", String(filters.page));
  if (filters.limit) query.set("limit", String(filters.limit));
  if (filters.search) query.set("search", filters.search);
  if (filters.role) query.set("role", filters.role);
  if (filters.status) query.set("status", filters.status);

  const value = query.toString();
  return value ? `?${value}` : "";
};

export const platformAdminsService = {
  list(filters: ListFilters = {}) {
    return apiRequest<PlatformAdministrator[]>(
      `/superadmin/administrators${toQuery(filters)}`
    );
  },

  getById(userId: string) {
    return apiRequest<PlatformAdministrator>(
      `/superadmin/administrators/${userId}`
    );
  },

  create(payload: CreatePlatformAdministratorPayload) {
    return apiRequest<PlatformAdministrator>(
      "/superadmin/administrators",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  },

  update(
    userId: string,
    payload: Partial<{
      firstName: string;
      lastName: string;
      roleCode: PlatformAdministratorRole;
    }>
  ) {
    return apiRequest<PlatformAdministrator>(
      `/superadmin/administrators/${userId}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      }
    );
  },

  updatePermissions(
    userId: string,
    permissions: string[]
  ) {
    return apiRequest<PlatformAdministrator>(
      `/superadmin/administrators/${userId}/permissions`,
      {
        method: "PATCH",
        body: JSON.stringify({ permissions }),
      }
    );
  },

  updateStatus(
    userId: string,
    status: Exclude<
      PlatformAdministratorStatus,
      "pending"
    >
  ) {
    return apiRequest<PlatformAdministrator>(
      `/superadmin/administrators/${userId}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }
    );
  },
};
