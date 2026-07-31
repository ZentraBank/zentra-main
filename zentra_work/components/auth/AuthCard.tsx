// components/auth/AuthCard.tsx

type AuthCardProps = {
  children: React.ReactNode;
  bordered?: boolean;
};

export default function AuthCard({ children, bordered = false }: AuthCardProps) {
  return (
    <main className="flex min-h-screen items-center justify-center px-3 py-10 md:px-10">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[32px] bg-white shadow-[0_30px_90px_rgba(0,0,0,0.45)] md:grid-cols-2">
        {/* LEFT SIDE - DESKTOP */}
        <div className="hidden min-h-[720px] flex-col justify-between bg-gradient-to-br from-[#050505] via-[#111827] to-[#B91C1C] p-12 text-white md:flex">
          <div>
            <p className="mb-5 text-sm font-medium uppercase tracking-[0.28em] text-white/60">
              ZentraBank
            </p>

            <h1 className="max-w-md text-[56px] font-semibold leading-[0.95] tracking-[-0.04em]">
              Secure access for modern banking.
            </h1>

            <p className="mt-6 max-w-sm text-[17px] leading-[28px] text-white/70">
              Register, log in and manage your banking tools from one clean,
              simple and protected workspace.
            </p>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/10 p-5 backdrop-blur-md">
            <p className="text-sm leading-[24px] text-white/75">
              Built for billing formats, subscriptions, cards and client
              management.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE - FORM */}
        <div className="flex min-h-[720px] items-start justify-center bg-black px-4 py-8 md:items-center md:px-10">
          <div
            className={`w-full max-w-[360px] rounded-[24px] bg-black p-4 md:max-w-[390px] md:p-6 ${
              bordered ? "border border-white/10" : ""
            }`}
          >
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}