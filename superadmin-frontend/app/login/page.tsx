import { LoginForm } from "@/src/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-400">
          ZentraBank
        </p>

        <h1 className="mt-3 text-3xl font-semibold">
          Platform administration
        </h1>

        <p className="mt-2 text-sm leading-6 text-neutral-400">
          Sign in with your platform
          administrator credentials.
        </p>

        <div className="mt-8">
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
