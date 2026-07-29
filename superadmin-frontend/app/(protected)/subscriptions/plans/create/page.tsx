import { ProtectedRoute } from "@/src/components/auth/protected-route";
import { CreatePlanForm } from "@/src/components/subscriptions/create-plan-form";

export default function CreatePlanPage() {
  return (
    <ProtectedRoute permission="platform.subscriptions.create">
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold">
            Create subscription plan
          </h1>
        </div>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <CreatePlanForm />
        </section>
      </main>
    </ProtectedRoute>
  );
}
