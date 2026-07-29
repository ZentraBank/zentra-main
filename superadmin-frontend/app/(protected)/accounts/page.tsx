import { ProtectedRoute } from "@/src/components/auth/protected-route";
import { CrossTenantTable } from "@/src/components/search/cross-tenant-table";

export default function AccountsPage() {
  return (
    <ProtectedRoute permission="platform.accounts.read">
      <main className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="mb-8 text-3xl font-semibold">
          Cross-tenant accounts
        </h1>

        <CrossTenantTable type="accounts" />
      </main>
    </ProtectedRoute>
  );
}
