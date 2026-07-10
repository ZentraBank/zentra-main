import Link from "next/link";

type LoginPageProps = {
  searchParams: Promise<{
    redirect?: string;
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const redirectTo = params.redirect || "/dashboard";

  return (
    <main className="grid min-h-screen bg-[#eef4ff] lg:grid-cols-2">
      <section className="hidden bg-[#0f1f46] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <p className="text-2xl font-black">ZentraBank</p>
          <p className="mt-1 text-xs uppercase tracking-[0.25em] text-blue-200">
            Superadmin
          </p>
        </div>

        <div className="max-w-xl">
          <p className="text-sm font-semibold text-blue-200">
            Platform control centre
          </p>
          <h1 className="mt-4 text-5xl font-black leading-tight">
            Manage every tenant from one secure portal.
          </h1>
          <p className="mt-5 text-base leading-7 text-blue-100">
            Monitor users, accounts, subscriptions, transactions, security,
            system health, and administrator activity.
          </p>
        </div>

        <p className="text-sm text-blue-200">Restricted access only</p>
      </section>

      <section className="flex items-center justify-center p-5 sm:p-8">
        <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-[0_25px_70px_rgba(15,31,70,0.12)] sm:p-9">
          <div className="lg:hidden">
            <p className="text-xl font-black text-[#0f1f46]">ZentraBank</p>
            <p className="mt-1 text-xs uppercase tracking-[0.22em] text-[#2458e8]">
              Superadmin
            </p>
          </div>

          <h2 className="mt-8 text-3xl font-black tracking-[-0.04em] text-[#14213d] lg:mt-0">
            Welcome back
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Sign in using your authorised Superadmin account.
          </p>

          {params.error && (
            <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              Enter your email address and password.
            </div>
          )}

          <form action="/api/auth/demo-login" method="post" className="mt-7 space-y-5">
            <input type="hidden" name="redirect" value={redirectTo} />

            <label className="block">
              <span className="text-sm font-bold text-slate-700">Email address</span>
              <input
                name="email"
                type="email"
                required
                placeholder="superadmin@zentrabank.com"
                className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-[#2458e8] focus:ring-4 focus:ring-blue-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-bold text-slate-700">Password</span>
              <input
                name="password"
                type="password"
                required
                placeholder="Enter password"
                className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-[#2458e8] focus:ring-4 focus:ring-blue-100"
              />
            </label>

            <div className="flex items-center justify-end">
              <Link
                href="/forgot-password"
                className="text-sm font-bold text-[#2458e8]"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="h-12 w-full rounded-xl bg-[#2458e8] text-sm font-bold text-white transition hover:bg-[#1947ca]"
            >
              Sign in
            </button>
          </form>

          <p className="mt-5 text-center text-xs leading-5 text-slate-400">
            Demo mode accepts any non-empty email and password. Replace the demo
            endpoint before production.
          </p>
        </div>
      </section>
    </main>
  );
}
