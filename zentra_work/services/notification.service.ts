import { apiRequest } from "@/lib/api-client";
import type { ClientNotification } from "@/types/notification";

export const notificationService = {
  list(page = 1, pageSize = 50) {
    return apiRequest<ClientNotification[]>(`/notifications/me?page=${page}&pageSize=${pageSize}`);
  },
unreadCount() {
  return apiRequest<number>("/notifications/me/unread-count");
},
  markRead(notificationId: string) {
    return apiRequest<ClientNotification>(`/notifications/me/${notificationId}/read`, { method: "PATCH" });
  },
  markAllRead() {
    return apiRequest<{ updatedCount: number }>("/notifications/me/read-all", { method: "PATCH" });
  },
  archive(notificationId: string) {
    return apiRequest<ClientNotification>(`/notifications/me/${notificationId}/archive`, { method: "PATCH" });
  },
};
