import { apiRequest } from "@/src/lib/api-client";
import type {
  PlatformNotification,
} from "@/src/types/platform-operations";

const buildQuery = (filters: {
  page?: number;
  limit?: number;
  severity?: string;
  type?: string;
  unreadOnly?: boolean;
}) => {
  const query = new URLSearchParams();

  if (filters.page) query.set("page", String(filters.page));
  if (filters.limit) query.set("limit", String(filters.limit));
  if (filters.severity) query.set("severity", filters.severity);
  if (filters.type) query.set("type", filters.type);
  if (filters.unreadOnly !== undefined) {
    query.set("unreadOnly", String(filters.unreadOnly));
  }

  const output = query.toString();
  return output ? `?${output}` : "";
};


export type TenantNotificationAudience =
  | {
      audienceType: "single_tenant";
      tenantId: string;
    }
  | {
      audienceType: "selected_tenants";
      tenantIds: string[];
    }
  | {
      audienceType: "all_tenants";
    };

export type SendTenantPlatformNotificationInput =
  TenantNotificationAudience & {
    title: string;
    message: string;

    priority?:
      | "low"
      | "normal"
      | "high"
      | "urgent";

    actionUrl?: string | null;
    entityType?: string | null;
    entityId?: string | null;
    metadata?: Record<string, unknown>;
  };

export type SendTenantPlatformNotificationResult = {
  audienceType:
    | "single_tenant"
    | "selected_tenants"
    | "all_tenants";

  tenantCount: number;
  recipientCount: number;
  notificationCount: number;

  push: {
    attempted: number;
    delivered: number;
    expired: number;
    failed: number;
  };
};

export const platformNotificationsService = {
  list(filters: {
    page?: number;
    limit?: number;
    severity?: string;
    type?: string;
    unreadOnly?: boolean;
  }) {
    return apiRequest<PlatformNotification[]>(
      `/superadmin/notifications${buildQuery(filters)}`
    );
  },

  unreadCount() {
    return apiRequest<{ unreadCount: number }>(
      "/superadmin/notifications/unread-count"
    );
  },

  markRead(notificationId: string) {
    return apiRequest<PlatformNotification>(
      `/superadmin/notifications/${notificationId}/read`,
      {
        method: "PATCH",
      }
    );
  },

  markAllRead() {
    return apiRequest<{ unreadCount: number }>(
      "/superadmin/notifications/read-all",
      {
        method: "PATCH",
      }
    );
  },
  sendToTenants(
  input: SendTenantPlatformNotificationInput,
) {
  return apiRequest<
    SendTenantPlatformNotificationResult
  >(
    "/superadmin/notifications/send-to-tenants",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
},
};
