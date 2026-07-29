import Link from "next/link";

import { ProtectedRoute } from "@/src/components/auth/protected-route";
import { AdministratorList } from "@/src/components/administrators/administrator-list";

export default function AdministratorsPage() {
  return (
    <ProtectedRoute permission="platform.administrators.read">
      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-neutral-500">
              Platform access
            </p>

            <h1 className="mt-2 text-3xl font-semibold">
              Administrators
            </h1>
          </div>

          <Link
            href="/administrators/create"
            className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black"
          >
            Add administrator
          </Link>
        </div>

        <AdministratorList />
      </main>
    </ProtectedRoute>
  );
}
