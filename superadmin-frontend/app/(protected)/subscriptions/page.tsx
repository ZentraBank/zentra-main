import Link from "next/link";

import { ProtectedRoute } from "@/src/components/auth/protected-route";
import { PlanList } from "@/src/components/subscriptions/plan-list";

export default function SubscriptionsPage() {
  return (
    <ProtectedRoute permission="platform.subscriptions.read">
      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-neutral-500">
              Commercial management
            </p>

            <h1 className="mt-2 text-3xl font-semibold">
              Subscription plans
            </h1>
          </div>

          <Link
            href="/subscriptions/plans/create"
            className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black"
          >
            Create plan
          </Link>
        </div>

        <PlanList />
      </main>
    </ProtectedRoute>
  );
}
