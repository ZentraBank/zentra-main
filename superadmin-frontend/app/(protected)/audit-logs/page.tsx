import { ProtectedRoute } from "@/src/components/auth/protected-route";
import { AuditLogList } from "@/src/components/audit/audit-log-list";

export default function AuditLogsPage() {
  return (
    <ProtectedRoute permission="platform.audit_logs.read">
      <main className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="mb-8 text-3xl font-semibold">
          Platform audit logs
        </h1>

        <AuditLogList />
      </main>
    </ProtectedRoute>
  );
}
