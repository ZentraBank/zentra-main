export type NotificationPriority = "low" | "normal" | "high" | "urgent";

export type ClientNotification = {
  id: string;
  notification_type: string;
  title: string;
  message: string;
  priority: NotificationPriority;
  action_url: string | null;
  metadata: unknown | null;
  is_read: number | boolean;
  read_at: string | null;
  is_archived: number | boolean;
  created_at: string;
};
