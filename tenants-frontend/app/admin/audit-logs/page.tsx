import AppShell from "@/components/layout/AppShell";

export default function AdminAuditLogsPage() {
  return (
    <AppShell>
      <h1 className="text-2xl font-bold">Audit Logs</h1>
      <p className="mb-6 text-sm text-gray-500">
        Track sensitive tenant actions.
      </p>

      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-500">Audit logs coming soon.</p>
      </div>
    </AppShell>
  );
}