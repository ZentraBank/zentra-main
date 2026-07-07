import AppShell from "@/components/layout/AppShell";
import Image from "next/image";
import { Search, Wallet } from "lucide-react";

const accounts = [
  {
    name: "Gregory Winter",
    accountNumber: "3022222222",
    balance: "₦250,000",
    type: "Wallet",
    status: "Active",
  },
  {
    name: "Amaka James",
    accountNumber: "3022222223",
    balance: "₦80,500",
    type: "Savings",
    status: "Dormant",
  },
];

export default function AdminAccountsPage() {
  return (
    <AppShell>
      <main className="relative min-h-[calc(100svh-32px)] overflow-hidden rounded-[28px] bg-black">
        <Image
          src="/images/Background_1.png"
          alt="Accounts background"
          fill
          priority
          className="object-cover"
        />

        {/* <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" /> */}

        <div className="relative z-10 p-4 text-white md:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-black md:text-4xl">Accounts</h1>
            <p className="mt-1 text-sm font-medium text-white/70">
              View all customer accounts under this tenant.
            </p>
          </div>

          <div className="mb-5 grid gap-4 md:grid-cols-3">
            <SummaryCard label="Total Accounts" value="118" />
            <SummaryCard label="Total Balance" value="₦4.8M" />
            <SummaryCard label="Dormant Accounts" value="12" />
          </div>

          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-black shadow-xl backdrop-blur-md">
            <Search size={18} className="text-gray-500" />
            <input
              placeholder="Search accounts"
              className="w-full bg-transparent text-sm font-medium text-black outline-none placeholder:text-gray-500"
            />
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/20 bg-white/90 text-black shadow-2xl backdrop-blur-md">
            {accounts.map((account) => (
              <div
                key={account.accountNumber}
                className="flex flex-col gap-4 border-b border-black/10 p-4 last:border-b-0 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-700/10 text-blue-700">
                    <Wallet size={20} />
                  </div>

                  <div>
                    <p className="font-bold">{account.name}</p>
                    <p className="text-sm font-medium text-gray-500">
                      {account.accountNumber} • {account.type}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <p className="font-bold">{account.balance}</p>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      account.status === "Active"
                        ? "bg-green-50 text-green-600"
                        : "bg-yellow-50 text-yellow-600"
                    }`}
                  >
                    {account.status}
                  </span>

                  <button className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-bold !text-black shadow-sm">
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </AppShell>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/90 p-5 text-black shadow-xl backdrop-blur-md">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <h2 className="mt-2 text-2xl font-black">{value}</h2>
    </div>
  );
}