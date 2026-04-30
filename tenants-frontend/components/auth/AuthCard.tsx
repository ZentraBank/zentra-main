// components/auth/AuthCard.tsx

export default function AuthCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex">
      
      {/* LEFT SIDE (Desktop Only) */}

      <div className="hidden md:flex w-1/2 items-center justify-center bg-gradient-to-br from-black via-gray-900 to-red-700 text-white p-10">
            {/* <div
    className="hidden md:flex w-1/2 items-center justify-center text-white p-10"
    style={{
        background: `linear-gradient(to bottom right, black, var(--tenant-primary))`,
    }}
    > */}
        <div>
          <h1 className="text-4xl font-bold mb-4">
            Welcome to ZentraBank
          </h1>
          <p className="text-sm text-white/70 max-w-sm">
            A white-label financial platform powering modern businesses.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE (Auth Form) */}
      <div className="flex w-full md:w-1/2 items-center justify-center bg-black p-5">
        <div className="w-full max-w-md rounded-xl bg-black p-6 shadow-xl border border-white/10">
          {children}
        </div>
      </div>
    </main>
  );
}