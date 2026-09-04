import {
  api,
  getApiErrorMessage,
} from "@/lib/api";

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

/*
|--------------------------------------------------------------------------
| Existing notification types
|--------------------------------------------------------------------------
*/

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
  | "high"
  | "urgent";

  action_url?: string | null;

  metadata?: unknown;

  is_read: boolean;
  read_at?: string | null;

  is_archived: boolean;
  created_at: string;
};

/*
|--------------------------------------------------------------------------
| Template types
|--------------------------------------------------------------------------
*/

export type NotificationPriority =
  | "low"
  | "normal"
  | "high"
  | "urgent";

export type NotificationTemplateStatus =
  | "active"
  | "inactive";

export type NotificationTemplate = {
  id: string;

  tenant_id: string;

  name: string;

  category:
    | string
    | null;

  title: string;

  message: string;

  priority:
    NotificationPriority;

  action_url:
    | string
    | null;

  status:
    NotificationTemplateStatus;

  created_by: string;

  created_at: string;

  updated_at: string;
};

export type CreateNotificationTemplateInput = {
  name: string;

  category?:
    | string
    | null;

  title: string;

  message: string;

  priority:
    NotificationPriority;

  actionUrl?:
    | string
    | null;

  status:
    NotificationTemplateStatus;
};

export type UpdateNotificationTemplateInput =
  Partial<
    CreateNotificationTemplateInput
  >;

/*
|--------------------------------------------------------------------------
| Push notification types
|--------------------------------------------------------------------------
*/

export type SendNotificationAudience =
  | {
      audienceType:
        "user";

      userId: string;
    }
  | {
      audienceType:
        "users";

      userIds:
        string[];
    }
  | {
      audienceType:
        "all_clients";
    };

export type SendClientNotificationInput =
  SendNotificationAudience & {
    templateId?:
      string;

    title?:
      string;

    message?:
      string;

    priority?:
      NotificationPriority;

    actionUrl?:
      string | null;
  };

  export type BrowserPushSubscriptionInput = {
  endpoint: string;

  keys: {
    p256dh: string;
    auth: string;
  };
};

export type BrowserPushSubscriptionRecord = {
  id: string;
  tenant_id: string;
  user_id: string;
  endpoint: string;
  user_agent?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};


/*
|--------------------------------------------------------------------------
| Service
|--------------------------------------------------------------------------
*/

export const notificationService = {
  /*
  |--------------------------------------------------------------------------
  | Existing tenant inbox
  |--------------------------------------------------------------------------
  */

  async list(
    page = 1,
    pageSize = 50,
  ): Promise<TenantNotification[]> {
    try {
      const params =
        new URLSearchParams({
          page:
            String(page),

          pageSize:
            String(pageSize),
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
    } catch (error) {
      throw new Error(
        getApiErrorMessage(
          error,
        ),
      );
    }
  },

  async unreadCount(): Promise<number> {
    try {
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
    } catch (error) {
      throw new Error(
        getApiErrorMessage(
          error,
        ),
      );
    }
  },

  async markRead(
    notificationId: string,
  ): Promise<void> {
    try {
      await api.patch(
        `/notifications/me/${encodeURIComponent(
          notificationId,
        )}/read`,
        {},
      );
    } catch (error) {
      throw new Error(
        getApiErrorMessage(
          error,
        ),
      );
    }
  },

  async markAllRead(): Promise<void> {
    try {
      await api.patch(
        "/notifications/me/read-all",
        {},
      );
    } catch (error) {
      throw new Error(
        getApiErrorMessage(
          error,
        ),
      );
    }
  },

  async archive(
    notificationId: string,
  ): Promise<void> {
    try {
      await api.patch(
        `/notifications/me/${encodeURIComponent(
          notificationId,
        )}/archive`,
        {},
      );
    } catch (error) {
      throw new Error(
        getApiErrorMessage(
          error,
        ),
      );
    }
  },

  /*
  |--------------------------------------------------------------------------
  | Templates
  |--------------------------------------------------------------------------
  */

  async listTemplates(
    params?: {
      status?:
        | "active"
        | "inactive"
        | "all";
    },
  ): Promise<
    NotificationTemplate[]
  > {
    try {
      const response =
        await api.get<
          ApiResponse<
            NotificationTemplate[]
          >
        >(
          "/notifications/admin/templates",
          {
            params: {
              status:
                params?.status ??
                "all",
            },
          },
        );

      return response.data.data;
    } catch (error) {
      throw new Error(
        getApiErrorMessage(
          error,
        ),
      );
    }
  },

  async createTemplate(
    input:
      CreateNotificationTemplateInput,
  ): Promise<NotificationTemplate> {
    try {
      const response =
        await api.post<
          ApiResponse<
            NotificationTemplate
          >
        >(
          "/notifications/admin/templates",
          input,
        );

      return response.data.data;
    } catch (error) {
      throw new Error(
        getApiErrorMessage(
          error,
        ),
      );
    }
  },

  async updateTemplate(
    templateId: string,

    input:
      UpdateNotificationTemplateInput,
  ): Promise<NotificationTemplate> {
    try {
      const response =
        await api.patch<
          ApiResponse<
            NotificationTemplate
          >
        >(
          `/notifications/admin/templates/${encodeURIComponent(
            templateId,
          )}`,
          input,
        );

      return response.data.data;
    } catch (error) {
      throw new Error(
        getApiErrorMessage(
          error,
        ),
      );
    }
  },

  async deleteTemplate(
    templateId: string,
  ): Promise<{
    deleted: boolean;
  }> {
    try {
      const response =
        await api.delete<
          ApiResponse<{
            deleted: boolean;
          }>
        >(
          `/notifications/admin/templates/${encodeURIComponent(
            templateId,
          )}`,
        );

      return response.data.data;
    } catch (error) {
      throw new Error(
        getApiErrorMessage(
          error,
        ),
      );
    }
  },

  /*
  |--------------------------------------------------------------------------
  | Push notifications
  |--------------------------------------------------------------------------
  */

  async sendToClients(
    input:
      SendClientNotificationInput,
  ): Promise<{
    sentCount: number;
  }> {
    try {
      const response =
        await api.post<
          ApiResponse<{
            sentCount: number;
          }>
        >(
          "/notifications/admin/send",
          input,
        );

      return response.data.data;
    } catch (error) {
      throw new Error(
        getApiErrorMessage(
          error,
        ),
      );
    }
  },
  async savePushSubscription(
  input:
    BrowserPushSubscriptionInput,
): Promise<BrowserPushSubscriptionRecord> {
  try {
    const response =
      await api.post<
        ApiResponse<
          BrowserPushSubscriptionRecord
        >
      >(
        "/notifications/push/subscription",
        input,
      );

    return response.data.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(
        error,
      ),
    );
  }
},
async removePushSubscription(
  endpoint: string,
): Promise<{
  removed: boolean;
}> {
  try {
    const response =
      await api.delete<
        ApiResponse<{
          removed: boolean;
        }>
      >(
        "/notifications/push/subscription",
        {
          data: {
            endpoint,
          },
        },
      );

    return response.data.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(
        error,
      ),
    );
  }
},
};