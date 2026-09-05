import { api } from "@/lib/api";


export type PlatformChatConversation = {
  id: string;

  tenant_id: string;

  status:
    | "open"
    | "closed";

  created_at: string;

  updated_at: string;

  last_message_at?:
    | string
    | null;

  unread_count?: number;
};


export type PlatformChatMessage = {
  id: string;

  conversation_id: string;

  sender_type:
    | "tenant_user"
    | "platform_user";

  sender_id: string;

  sender_name?:
    | string
    | null;

  sender_email?:
    | string
    | null;

  message: string;

  created_at: string;
};


export type PlatformChatMessagesResponse = {
  conversation:
    PlatformChatConversation;

  messages:
    PlatformChatMessage[];

  pagination: {
    page: number;

    pageSize: number;

    total: number;

    totalPages: number;
  };
};


export type PlatformChatUnreadResponse = {
  unreadCount: number;
};


type ApiResponse<T> = {
  success: boolean;

  message: string;

  data: T;
};


/*
|--------------------------------------------------------------------------
| Conversation
|--------------------------------------------------------------------------
*/

const getConversation =
  async (): Promise<PlatformChatConversation> => {
    const response =
      await api.get<
        ApiResponse<PlatformChatConversation>
      >(
        "/platform-chat/conversation",
      );

    return response.data.data;
  };


/*
|--------------------------------------------------------------------------
| Messages
|--------------------------------------------------------------------------
*/

const listMessages =
  async ({
    page = 1,
    pageSize = 50,
  }: {
    page?: number;
    pageSize?: number;
  } = {}): Promise<PlatformChatMessagesResponse> => {
    const response =
      await api.get<
        ApiResponse<PlatformChatMessagesResponse>
      >(
        "/platform-chat/messages",
        {
          params: {
            page,
            pageSize,
          },
        },
      );

    return response.data.data;
  };


const sendMessage =
  async (
    message: string,
  ): Promise<PlatformChatMessage> => {
    const response =
      await api.post<
        ApiResponse<PlatformChatMessage>
      >(
        "/platform-chat/messages",
        {
          message:
            message.trim(),
        },
      );

    return response.data.data;
  };


/*
|--------------------------------------------------------------------------
| Read state
|--------------------------------------------------------------------------
*/

const markAsRead =
  async () => {
    const response =
      await api.post<
        ApiResponse<unknown>
      >(
        "/platform-chat/read",
        {},
      );

    return response.data.data;
  };


/*
|--------------------------------------------------------------------------
| Unread count
|--------------------------------------------------------------------------
*/

const getUnreadCount =
  async (): Promise<PlatformChatUnreadResponse> => {
    const response =
      await api.get<
        ApiResponse<PlatformChatUnreadResponse>
      >(
        "/platform-chat/unread-count",
      );

    return response.data.data;
  };


export const platformChatService = {
  getConversation,
  listMessages,
  sendMessage,
  markAsRead,
  getUnreadCount,
};