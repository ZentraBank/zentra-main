import AppShell from "@/components/layout/AppShell";
import Link from "next/link";

export default function SubscriptionSuccessPage() {
  return (
    <AppShell>
      <div
        className="flex min-h-[calc(100vh-6rem)] items-center justify-center rounded-3xl p-5"
        style={{
          background:
            "radial-gradient(circle at top left, rgba(255,255,255,0.35), transparent 18%), linear-gradient(135deg, var(--tenant-primary), #020617 75%)",
        }}
      >
        <div className="w-full max-w-lg rounded-3xl border-4 border-yellow-500 bg-black p-6 text-center text-white shadow-2xl md:p-8">
          <h1 className="text-3xl font-extrabold">Congratulations!</h1>

          <div className="mx-auto my-8 h-40 max-w-xs rounded-t-full bg-[radial-gradient(circle,#ecfdf5_0%,#bbf7d0_45%,#047857_100%)]" />

          <p className="text-sm leading-6 text-white/85">
            Your account has just been subscribed for the selected service.
          </p>

          <div className="mx-auto my-8 h-px w-3/4 bg-white/40" />

          <Link
            href="/dashboard"
            className="block w-full rounded-xl bg-tenant px-4 py-3 text-sm font-bold text-white"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </AppShell>
  );
}