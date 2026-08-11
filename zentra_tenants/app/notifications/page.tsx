import AppShell from "@/components/layout/AppShell";
import { Bell, CheckCheck, CreditCard, MessageCircle, ShieldAlert } from "lucide-react";

const notifications = [
  {
    title: "Account credited",
    message: "Your account has been credited with ₦50,000.",
    time: "Today, 10:24 AM",
    type: "transaction",
    unread: true,
  },
  {
    title: "New support message",
    message: "A tenant admin replied to your conversation.",
    time: "Today, 9:15 AM",
    type: "chat",
    unread: true,
  },
  {
    title: "Security reminder",
    message: "Complete your profile setup to unlock more features.",
    time: "Yesterday, 4:12 PM",
    type: "security",
    unread: false,
  },
];

export default function NotificationsPage() {
  return (
    <AppShell>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-sm text-gray-500">
            Track alerts, transaction updates, and support activity.
          </p>
        </div>

        <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-tenant px-4 py-3 text-sm font-semibold text-white">
          <CheckCheck size={18} />
          Mark all as read
        </button>
      </div>

      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <Summary label="Unread" value="2" />
        <Summary label="Transaction Alerts" value="1" />
        <Summary label="Support Updates" value="1" />
      </div>

      <div className="space-y-3">
        {notifications.map((item) => (
          <div
            key={`${item.title}-${item.time}`}
            className={`rounded-2xl border bg-white p-4 shadow-sm ${
              item.unread ? "border-tenant" : "border-gray-200"
            }`}
          >
            <div className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-tenant/10 text-tenant">
                <NotificationIcon type={item.type} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-bold">{item.title}</h2>
                    <p className="mt-1 text-sm text-gray-600">{item.message}</p>
                  </div>

                  {item.unread && (
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-tenant" />
                  )}
                </div>

                <p className="mt-3 text-xs text-gray-400">{item.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <h2 className="mt-2 text-2xl font-bold">{value}</h2>
    </div>
  );
}

function NotificationIcon({ type }: { type: string }) {
  if (type === "transaction") return <CreditCard size={20} />;
  if (type === "chat") return <MessageCircle size={20} />;
  if (type === "security") return <ShieldAlert size={20} />;

  return <Bell size={20} />;
}