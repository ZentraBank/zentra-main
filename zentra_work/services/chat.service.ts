import { apiRequest } from "@/lib/api-client";
import type { ChatConversation, ChatMessage } from "@/types/chat";

export const chatService = {
  async conversations(status?: "open" | "closed") {
    const query = status ? `?status=${status}&limit=50` : "?limit=50";
    const data = await apiRequest<{ conversations: ChatConversation[] }>(`/chats/conversations${query}`);
    return data.conversations;
  },
  async start(subject: string, message: string) {
    return apiRequest<{ conversation_id: string }>("/chats/conversations", {
      method: "POST",
      body: JSON.stringify({ subject, message }),
    });
  },
  async messages(conversationId: string) {
    const data = await apiRequest<{ messages: ChatMessage[] }>(
      `/chats/conversations/${conversationId}/messages?limit=100`,
    );
    return data.messages;
  },
  async send(conversationId: string, message: string) {
    return apiRequest<{ message_id: string }>(`/chats/conversations/${conversationId}/messages`, {
      method: "POST",
      body: JSON.stringify({ message }),
    });
  },
};
