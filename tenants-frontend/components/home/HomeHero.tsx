import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

export default function HomeHero() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black">
      <Image
        src="/images/hero-bg.png"
        alt=""
        fill
        priority
        className="object-cover"
      />

      <div className="absolute inset-0 bg-black/35" />

      <section className="relative z-10 mx-auto grid min-h-screen max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:px-16">
        <div className="max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur">
            <ShieldCheck size={16} />
            Secure white-label banking platform
          </div>

          <h1 className="font-heading text-5xl font-bold leading-tight tracking-tight text-white lg:text-7xl">
            ZentraBank
            <span className="block text-[var(--primary)]">
              Online Banking
            </span>
          </h1>

          <p className="mt-6 max-w-xl font-body text-lg leading-8 text-white/75">
            Manage accounts, customers, transactions, subscriptions and support
            from one simple digital banking dashboard.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-4 text-sm font-semibold text-white shadow-lg transition hover:bg-[var(--primary-dark)]"
            >
              Get started
              <ArrowRight size={18} />
            </Link>

            <Link
              href="/register"
              className="rounded-xl border border-white/20 bg-white/10 px-6 py-4 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              Create account
            </Link>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur-xl">
          <div className="rounded-[1.5rem] bg-white p-6">
            <p className="text-sm font-medium text-gray-500">Total Balance</p>
            <h2 className="mt-2 text-4xl font-bold text-gray-950">
              ₦24,500,000
            </h2>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <MiniStat label="Active users" value="2,430" />
              <MiniStat label="Transactions" value="18.7k" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gray-50 p-4">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-lg font-bold text-gray-950">{value}</p>
    </div>
  );
}