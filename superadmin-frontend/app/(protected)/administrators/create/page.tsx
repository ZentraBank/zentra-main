import { ProtectedRoute } from "@/src/components/auth/protected-route";
import { CreateAdministratorForm } from "@/src/components/administrators/create-administrator-form";

export default function CreateAdministratorPage() {
  return (
    <ProtectedRoute permission="platform.administrators.create">
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold">
            Add platform administrator
          </h1>
        </div>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <CreateAdministratorForm />
        </section>
      </main>
    </ProtectedRoute>
  );
}
