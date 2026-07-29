import { ProtectedRoute } from "@/src/components/auth/protected-route";
import { DashboardOverview } from "@/src/components/dashboard/dashboard-overview";

export default function DashboardPage() {
  return (
    <ProtectedRoute permission="platform.dashboard.read">
      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.18em] text-neutral-500">
            Platform overview
          </p>

          <h1 className="mt-2 text-3xl font-semibold">
            Superadmin Dashboard
          </h1>
        </div>

        <DashboardOverview />
      </main>
    </ProtectedRoute>
  );
}
