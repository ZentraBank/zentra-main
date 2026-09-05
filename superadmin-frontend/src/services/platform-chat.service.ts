import { apiRequest } from "@/src/lib/api-client";

export type PlatformChatStatus =
  | "open"
  | "closed";

export type PlatformChatSenderType =
  | "tenant_user"
  | "platform_user";


export type PlatformChatConversation = {
  id: string;

  tenant_id: string;

  tenant_name?: string | null;
  tenant_slug?: string | null;

  status: PlatformChatStatus;

  last_message?: string | null;

  last_message_sender_type?:
    | PlatformChatSenderType
    | null;

  last_message_at?: string | null;

  unread_count?: number;

  created_at: string;
  updated_at: string;
};


export type PlatformChatMessage = {
  id: string;

  conversation_id: string;

  sender_type:
    PlatformChatSenderType;

  sender_id: string;

  sender_name?: string | null;

  message: string;

  created_at: string;
};


export type PlatformChatPagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};


export type PlatformChatConversationList = {
  conversations:
    PlatformChatConversation[];

  pagination:
    PlatformChatPagination;
};


export type PlatformChatMessageList = {
  conversation:
    PlatformChatConversation;

  messages:
    PlatformChatMessage[];

  pagination:
    PlatformChatPagination;
};


export type PlatformChatUnreadCount = {
  unreadCount: number;
};


export type ListPlatformChatConversationsParams = {
  page?: number;

  pageSize?: number;

  status?: PlatformChatStatus;
};


export type ListPlatformChatMessagesParams = {
  page?: number;

  pageSize?: number;
};


/*
|--------------------------------------------------------------------------
| Query helper
|--------------------------------------------------------------------------
*/

const buildQuery = (
  params: Record<
    string,
    string | number | undefined
  >
) => {
  const searchParams =
    new URLSearchParams();

  Object.entries(
    params
  ).forEach(
    ([key, value]) => {
      if (
        value === undefined ||
        value === null ||
        value === ""
      ) {
        return;
      }

      searchParams.set(
        key,
        String(value)
      );
    }
  );

  const query =
    searchParams.toString();

  return query
    ? `?${query}`
    : "";
};


/*
|--------------------------------------------------------------------------
| Platform chat service
|--------------------------------------------------------------------------
*/

class PlatformChatService {
  /*
  |--------------------------------------------------------------------------
  | Conversations
  |--------------------------------------------------------------------------
  */

  async listConversations(
    params: ListPlatformChatConversationsParams = {}
  ): Promise<PlatformChatConversationList> {
    const query =
      buildQuery({
        page:
          params.page,

        pageSize:
          params.pageSize,

        status:
          params.status,
      });

    const response =
      await apiRequest<PlatformChatConversationList>(
        `/superadmin/platform-chat/conversations${query}`,
        {
          method: "GET",

          auth: true,

          cache: "no-store",
        }
      );

    return response.data;
  }


  async getConversation(
    conversationId: string
  ): Promise<PlatformChatConversation> {
    const response =
      await apiRequest<PlatformChatConversation>(
        `/superadmin/platform-chat/conversations/${conversationId}`,
        {
          method: "GET",

          auth: true,

          cache: "no-store",
        }
      );

    return response.data;
  }


  /*
  |--------------------------------------------------------------------------
  | Messages
  |--------------------------------------------------------------------------
  */

  async listMessages(
    conversationId: string,

    params: ListPlatformChatMessagesParams = {}
  ): Promise<PlatformChatMessageList> {
    const query =
      buildQuery({
        page:
          params.page,

        pageSize:
          params.pageSize,
      });

    const response =
      await apiRequest<PlatformChatMessageList>(
        `/superadmin/platform-chat/conversations/${conversationId}/messages${query}`,
        {
          method: "GET",

          auth: true,

          cache: "no-store",
        }
      );

    return response.data;
  }


  async sendMessage(
    conversationId: string,

    message: string
  ): Promise<PlatformChatMessage> {
    const response =
      await apiRequest<PlatformChatMessage>(
        `/superadmin/platform-chat/conversations/${conversationId}/messages`,
        {
          method: "POST",

          auth: true,

          body: JSON.stringify({
            message:
              message.trim(),
          }),
        }
      );

    return response.data;
  }


  /*
  |--------------------------------------------------------------------------
  | Read state
  |--------------------------------------------------------------------------
  */

  async markRead(
    conversationId: string
  ) {
    const response =
      await apiRequest<unknown>(
        `/superadmin/platform-chat/conversations/${conversationId}/read`,
        {
          method: "POST",

          auth: true,

          body:
            JSON.stringify({}),
        }
      );

    return response.data;
  }


  /*
  |--------------------------------------------------------------------------
  | Status
  |--------------------------------------------------------------------------
  */

  async updateStatus(
    conversationId: string,

    status: PlatformChatStatus
  ) {
    const response =
      await apiRequest<PlatformChatConversation>(
        `/superadmin/platform-chat/conversations/${conversationId}/status`,
        {
          method: "PATCH",

          auth: true,

          body:
            JSON.stringify({
              status,
            }),
        }
      );

    return response.data;
  }


  /*
  |--------------------------------------------------------------------------
  | Global unread count
  |--------------------------------------------------------------------------
  */

  async unreadCount(): Promise<number> {
    const response =
      await apiRequest<PlatformChatUnreadCount>(
        "/superadmin/platform-chat/unread-count",
        {
          method: "GET",

          auth: true,

          cache: "no-store",
        }
      );

    return (
      response.data
        ?.unreadCount ?? 0
    );
  }
}


export const platformChatService =
  new PlatformChatService();