import Link from "next/link";

import { ProtectedRoute } from "@/src/components/auth/protected-route";
import { TenantList } from "@/src/components/tenants/tenant-list";

export default function TenantsPage() {
  return (
    <ProtectedRoute permission="platform.tenants.read">
      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-neutral-500">
              Platform management
            </p>

            <h1 className="mt-2 text-3xl font-semibold">
              Tenants
            </h1>
          </div>

          <Link
            href="/tenants/create"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold text-black"
          >
            Create tenant
          </Link>
        </div>

        <TenantList />
      </main>
    </ProtectedRoute>
  );
}
