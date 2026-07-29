import { ProtectedRoute } from "@/src/components/auth/protected-route";
import { CreateTenantForm } from "@/src/components/tenants/create-tenant-form";

export default function CreateTenantPage() {
  return (
    <ProtectedRoute permission="platform.tenants.create">
      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.18em] text-neutral-500">
            Tenant onboarding
          </p>

          <h1 className="mt-2 text-3xl font-semibold">
            Create tenant
          </h1>

          <p className="mt-2 text-sm text-neutral-400">
            This creates the tenant, tenant
            owner, and initial subscription
            in one onboarding transaction.
          </p>
        </div>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <CreateTenantForm />
        </section>
      </main>
    </ProtectedRoute>
  );
}
