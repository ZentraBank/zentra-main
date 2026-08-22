import { api } from "@/lib/api";

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

export type TenantNotification = {
  id: string;
  tenant_id: string;
  user_id: string;

  notification_type: string;

  title: string;
  message: string;

  entity_type?: string | null;
  entity_id?: string | null;

  priority:
    | "low"
    | "normal"
    | "high";

  action_url?: string | null;

  metadata?: unknown;

  is_read: boolean;
  read_at?: string | null;

  is_archived: boolean;
  created_at: string;
};

export const notificationService = {
  async list(
    page = 1,
    pageSize = 50,
  ): Promise<TenantNotification[]> {
    const params =
      new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });

    const response =
      await api.get<
        ApiResponse<
          TenantNotification[]
        >
      >(
        `/notifications/me?${params.toString()}`,
      );

    return response.data.data;
  },

  async unreadCount(): Promise<number> {
    const response =
      await api.get<
        ApiResponse<
          | number
          | {
              count?: number;
              unreadCount?: number;
              total?: number;
            }
        >
      >(
        "/notifications/me/unread-count",
      );

    const data =
      response.data.data;

    if (
      typeof data ===
      "number"
    ) {
      return data;
    }

    return Number(
      data?.count ??
        data?.unreadCount ??
        data?.total ??
        0,
    );
  },

  async markRead(
    notificationId: string,
  ): Promise<void> {
    await api.patch(
      `/notifications/me/${encodeURIComponent(
        notificationId,
      )}/read`,
      {},
    );
  },

  async markAllRead(): Promise<void> {
    await api.patch(
      "/notifications/me/read-all",
      {},
    );
  },

  async archive(
    notificationId: string,
  ): Promise<void> {
    await api.patch(
      `/notifications/me/${encodeURIComponent(
        notificationId,
      )}/archive`,
      {},
    );
  },
};