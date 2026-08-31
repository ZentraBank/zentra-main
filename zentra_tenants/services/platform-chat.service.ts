import { api } from "@/lib/api";

export type PlatformChatConversation = {
  id: string;
  tenantId?: string;
  status: "open" | "closed";
  createdAt?: string;
  updatedAt?: string;
  lastMessageAt?: string | null;
};

export type PlatformChatMessage = {
  id: string;
  conversationId: string;
  senderType:
    | "tenant_user"
    | "platform_user";
  senderId: string;
  senderName?: string | null;
  senderEmail?: string | null;
  message: string;
  createdAt: string;
};

export type PlatformChatMessagesResponse = {
  conversation:
    | PlatformChatConversation
    | null;
  messages: PlatformChatMessage[];
  pagination?: {
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

const getConversation =
  async () => {
    const response =
      await api.get<
        ApiResponse<PlatformChatConversation>
      >(
        "/platform-chat/conversation",
      );

    return response.data.data;
  };

const listMessages =
  async ({
    page = 1,
    pageSize = 50,
  }: {
    page?: number;
    pageSize?: number;
  } = {}) => {
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
  ) => {
    const response =
      await api.post<
        ApiResponse<PlatformChatMessage>
      >(
        "/platform-chat/messages",
        {
          message,
        },
      );

    return response.data.data;
  };

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

const getUnreadCount =
  async () => {
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