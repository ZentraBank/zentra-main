import { apiRequest } from "@/src/lib/api-client";
import type {
  PlatformAuditLog,
} from "@/src/types/platform-operations";

export const platformAuditService = {
  list(filters: {
    page?: number;
    limit?: number;
    action?: string;
    entityType?: string;
    tenantId?: string;
    actorUserId?: string;
  } = {}) {
    const query = new URLSearchParams();

    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== "") {
        query.set(key, String(value));
      }
    }

    const suffix = query.toString()
      ? `?${query.toString()}`
      : "";

    return apiRequest<PlatformAuditLog[]>(
      `/superadmin/audit-logs${suffix}`
    );
  },
};
