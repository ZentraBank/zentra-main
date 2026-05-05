import AppShell from "@/components/layout/AppShell";
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Accounts</h1>
        <p className="text-sm text-gray-500">
          View all customer accounts under this tenant.
        </p>
      </div>

      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <SummaryCard label="Total Accounts" value="118" />
        <SummaryCard label="Total Balance" value="₦4.8M" />
        <SummaryCard label="Dormant Accounts" value="12" />
      </div>

      <div className="mb-5 flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
        <Search size={18} className="text-gray-400" />
        <input
          placeholder="Search accounts"
          className="w-full text-sm outline-none"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {accounts.map((account) => (
          <div
            key={account.accountNumber}
            className="flex flex-col gap-4 border-b border-gray-100 p-4 last:border-b-0 lg:flex-row lg:items-center lg:justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-tenant/10 text-tenant">
                <Wallet size={20} />
              </div>

              <div>
                <p className="font-bold">{account.name}</p>
                <p className="text-sm text-gray-500">
                  {account.accountNumber} • {account.type}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <p className="font-bold">{account.balance}</p>

              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  account.status === "Active"
                    ? "bg-green-50 text-green-600"
                    : "bg-yellow-50 text-yellow-600"
                }`}
              >
                {account.status}
              </span>

              <button className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700">
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <h2 className="mt-2 text-2xl font-bold">{value}</h2>
    </div>
  );
}