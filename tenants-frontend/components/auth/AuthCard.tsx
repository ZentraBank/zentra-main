// components/auth/AuthCard.tsx

type AuthCardProps = {
  children: React.ReactNode;
  bordered?: boolean;
};

export default function AuthCard({ children, bordered = false }: AuthCardProps) {
  return (
    <main className="flex min-h-screen">
      {/* LEFT SIDE (Desktop Only) */}
      <div className="hidden w-1/2 items-center justify-center bg-gradient-to-br from-black via-gray-900 to-red-700 p-10 text-white md:flex">
        <div>
          <h1 className="mb-4 text-4xl font-bold">Welcome to ZentraBank</h1>
          <p className="max-w-sm text-sm text-white/70">
            A white-label financial platform powering modern businesses.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE (Auth Form) */}
      <div className="flex w-full items-center justify-center bg-black p-5 md:w-1/2">
        <div
          className={`w-full max-w-md rounded-xl bg-black p-6 shadow-xl ${
            bordered ? "border border-white/10" : ""
          }`}
        >
          {children}
        </div>
      </div>
    </main>
  );
}