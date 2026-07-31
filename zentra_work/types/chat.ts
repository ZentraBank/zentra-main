export type ChatConversation = {
  id: string;
  user_id: string;
  subject: string;
  status: "open" | "closed";
  last_message?: string | null;
  last_message_at?: string | null;
  created_at: string;
};

export type ChatMessage = {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_role?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  message: string;
  created_at: string;
};
