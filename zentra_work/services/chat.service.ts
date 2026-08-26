import {
  apiRequest,
  getApiErrorMessage,
} from "@/lib/api-client";

export type ClientChatConversation = {
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
};

export type ClientChatMessage = {
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

export type ClientChatMessagesResponse = {
  conversation:
    ClientChatConversation;

  messages:
    ClientChatMessage[];

  unreadCount:
    number;

  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export const chatService = {
  async getMyConversation() {
    try {
      return await apiRequest<ClientChatConversation>(
        "/chat/me/conversation",
      );
    } catch (error) {
      throw new Error(
        getApiErrorMessage(
          error,
        ),
      );
    }
  },

  async listMyMessages(
    params?: {
      page?: number;
      pageSize?: number;
    },
  ) {
    try {
      const query =
        new URLSearchParams({
          page:
            String(
              params?.page ??
                1,
            ),

          pageSize:
            String(
              params?.pageSize ??
                100,
            ),
        });

      return await apiRequest<ClientChatMessagesResponse>(
        `/chat/me/messages?${query.toString()}`,
      );
    } catch (error) {
      throw new Error(
        getApiErrorMessage(
          error,
        ),
      );
    }
  },

  async sendMessage(
    message: string,
  ) {
    try {
      return await apiRequest<ClientChatMessage>(
        "/chat/me/messages",
        {
          method:
            "POST",

          body:
            JSON.stringify({
              message,
            }),
        },
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
    lastReadMessageId?:
      string | null,
  ) {
    try {
      return await apiRequest<{
        conversation_id:
          string;

        user_id: string;

        last_read_message_id:
          | string
          | null;

        last_read_at:
          | string
          | null;
      }>(
        "/chat/me/read",
        {
          method:
            "POST",

          body:
            JSON.stringify({
              lastReadMessageId:
                lastReadMessageId ??
                null,
            }),
        },
      );
    } catch (error) {
      throw new Error(
        getApiErrorMessage(
          error,
        ),
      );
    }
  },

  async unreadCount() {
    try {
      return await apiRequest<{
        unreadCount:
          number;
      }>(
        "/chat/me/unread-count",
      );
    } catch (error) {
      throw new Error(
        getApiErrorMessage(
          error,
        ),
      );
    }
  },
};