import { ProtectedRoute } from "@/src/components/auth/protected-route";
import { NotificationList } from "@/src/components/notifications/notification-list";
import { SendTenantNotification } from "@/src/components/notifications/send-tenant-notification";

export default function NotificationsPage() {
  return (
    <ProtectedRoute permission="platform.notifications.read">
      <main className="mx-auto max-w-[1500px] px-6 py-8 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">
            Platform notifications
          </h1>

          <p className="mt-2 text-sm text-neutral-500">
            Monitor platform activity and communicate
            directly with tenant administrators.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
          <div className="xl:sticky xl:top-6 xl:self-start">
            <SendTenantNotification />
          </div>

          <div className="min-w-0">
            <NotificationList />
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}