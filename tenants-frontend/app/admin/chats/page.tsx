import AppShell from "@/components/layout/AppShell";

export default function AdminChatsPage() {
  return (
    <AppShell>
      <h1 className="text-2xl font-bold">Admin Chats</h1>
      <p className="mb-6 text-sm text-gray-500">
        Respond to customer conversations.
      </p>

      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-500">Admin chat inbox coming soon.</p>
      </div>
    </AppShell>
  );
}