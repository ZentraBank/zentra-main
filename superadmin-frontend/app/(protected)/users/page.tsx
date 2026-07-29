import { ProtectedRoute } from "@/src/components/auth/protected-route";
import { CrossTenantTable } from "@/src/components/search/cross-tenant-table";

export default function UsersPage() {
  return (
    <ProtectedRoute permission="platform.users.read">
      <main className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="mb-8 text-3xl font-semibold">
          Cross-tenant users
        </h1>

        <CrossTenantTable type="users" />
      </main>
    </ProtectedRoute>
  );
}
