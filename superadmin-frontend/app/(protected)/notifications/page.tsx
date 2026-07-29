import { ProtectedRoute } from "@/src/components/auth/protected-route";
import { NotificationList } from "@/src/components/notifications/notification-list";

export default function NotificationsPage() {
  return (
    <ProtectedRoute permission="platform.notifications.read">
      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="mb-8 text-3xl font-semibold">
          Platform notifications
        </h1>

        <NotificationList />
      </main>
    </ProtectedRoute>
  );
}
