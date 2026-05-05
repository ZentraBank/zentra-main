// app/dashboard/page.tsx

import AppShell from "@/components/layout/AppShell";
import { ArrowDownLeft, ArrowUpRight, Wallet, Plus } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Overview of your financial activity.
        </p>
      </div>

      {/* Balance Card */}
<div
  className="rounded-3xl p-6 text-white shadow-lg"
  style={{
    background:
      "linear-gradient(135deg, var(--tenant-primary), #111827)",
  }}
>
  <p className="text-sm font-medium text-white/80">Available Balance</p>

  <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-white">
    ₦250,000
  </h2>

  <p className="mt-2 text-sm text-white/70">Wallet Account • 3022222222</p>

  <div className="mt-6 flex flex-wrap gap-3">
    <Link
      href="/transactions"
      className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-gray-900"
    >
      <ArrowDownLeft size={16} />
      Deposit
    </Link>

    <Link
      href="/transactions"
      className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white"
    >
      <ArrowUpRight size={16} />
      Transfer
    </Link>
  </div>
</div>

      {/* Quick Actions */}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <QuickCard
          title="Add Client"
          href="/clients/add"
        />
        <QuickCard
          title="View Transactions"
          href="/transactions"
        />
        <QuickCard
          title="Open Chat"
          href="/chat"
        />
      </div>

      {/* Recent Transactions */}
      <div className="mt-6 rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-bold">Recent Transactions</h2>

        <div className="space-y-4">
          {[
            { title: "Account credited", amount: "+₦50,000", type: "in" },
            { title: "Transfer sent", amount: "-₦5,000", type: "out" },
          ].map((tx) => (
            <div
              key={tx.title}
              className="flex items-center justify-between border-b pb-3"
            >
              <p className="text-sm">{tx.title}</p>

              <p
                className={`font-bold ${
                  tx.type === "in" ? "text-green-600" : "text-red-600"
                }`}
              >
                {tx.amount}
              </p>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

function QuickCard({
  title,
  href,
}: {
  title: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md"
    >
      <span className="font-semibold">{title}</span>
      <Plus size={18} />
    </Link>
  );
}