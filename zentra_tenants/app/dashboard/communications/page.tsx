import {
  api,
  getApiErrorMessage,
} from "@/lib/api";

export type ChatConversation = {
  id: string;

  tenant_id: string;

  client_user_id: string;

  status:
    | "open"
    | "closed"
    | "archived";

  last_message_at:
    | string
    | null;

  created_at: string;

  updated_at: string;

  client_first_name?:
    | string
    | null;

  client_middle_name?:
    | string
    | null;

  client_last_name?:
    | string
    | null;

  client_email?:
    | string
    | null;

  last_message?:
    | string
    | null;

  last_message_created_at?:
    | string
    | null;

  unread_count?: number;
};

export type ChatMessage = {
  id: string;

  tenant_id: string;

  conversation_id: string;

  sender_user_id: string;

  sender_type:
    | "client"
    | "tenant";

  message_type:
    | "text"
    | "system";

  body: string;

  created_at: string;

  edited_at?:
    | string
    | null;

  deleted_at?:
    | string
    | null;

  sender_first_name?:
    | string
    | null;

  sender_middle_name?:
    | string
    | null;

  sender_last_name?:
    | string
    | null;

  sender_email?:
    | string
    | null;
};

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

export const chatService = {
  async listTenantConversations(
    params?: {
      page?: number;
      pageSize?: number;
    },
  ) {
    try {
      const response =
        await api.get<
          ApiEnvelope<{
            conversations:
              ChatConversation[];

            pagination: {
              page: number;
              pageSize: number;
            };
          }>
        >(
          "/chat/tenant/conversations",
          {
            params: {
              page:
                params?.page ??
                1,

              pageSize:
                params?.pageSize ??
                100,
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

  async createConversation(
    clientUserId: string,
  ) {
    try {
      const response =
        await api.post<
          ApiEnvelope<
            ChatConversation
          >
        >(
          `/chat/tenant/conversations/${encodeURIComponent(
            clientUserId,
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

  async listTenantMessages(
    conversationId: string,
    params?: {
      page?: number;
      pageSize?: number;
    },
  ) {
    try {
      const response =
        await api.get<
          ApiEnvelope<{
            messages:
              ChatMessage[];

            pagination: {
              page: number;
              pageSize: number;
              total: number;
              totalPages: number;
            };
          }>
        >(
          `/chat/tenant/conversations/${encodeURIComponent(
            conversationId,
          )}/messages`,
          {
            params: {
              page:
                params?.page ??
                1,

              pageSize:
                params?.pageSize ??
                100,
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

  async sendTenantMessage(
    conversationId: string,
    message: string,
  ) {
    try {
      const response =
        await api.post<
          ApiEnvelope<
            ChatMessage
          >
        >(
          `/chat/tenant/conversations/${encodeURIComponent(
            conversationId,
          )}/messages`,
          {
            message,
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

  async markTenantRead(
    conversationId: string,
    lastReadMessageId?:
      string | null,
  ) {
    try {
      const response =
        await api.post<
          ApiEnvelope<{
            conversation_id: string;
            user_id: string;
            last_read_message_id:
              | string
              | null;
            last_read_at:
              | string
              | null;
          }>
        >(
          `/chat/tenant/conversations/${encodeURIComponent(
            conversationId,
          )}/read`,
          {
            lastReadMessageId:
              lastReadMessageId ??
              null,
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

  async tenantUnreadCount() {
    try {
      const response =
        await api.get<
          ApiEnvelope<{
            unreadCount: number;
          }>
        >(
          "/chat/tenant/unread-count",
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

  async updateConversationStatus(
    conversationId: string,
    status:
      | "open"
      | "closed"
      | "archived",
  ) {
    try {
      const response =
        await api.patch<
          ApiEnvelope<
            ChatConversation
          >
        >(
          `/chat/tenant/conversations/${encodeURIComponent(
            conversationId,
          )}/status`,
          {
            status,
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