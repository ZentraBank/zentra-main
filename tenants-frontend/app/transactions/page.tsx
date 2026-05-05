import AppShell from "@/components/layout/AppShell";
import { ArrowDownLeft, ArrowUpRight, Search } from "lucide-react";

const transactions = [
  {
    title: "Account credited",
    date: "Today, 10:24 AM",
    amount: "+₦50,000",
    type: "in",
    status: "Successful",
  },
  {
    title: "Transfer sent",
    date: "Today, 9:10 AM",
    amount: "-₦5,000",
    type: "out",
    status: "Successful",
  },
  {
    title: "Account debited",
    date: "Yesterday, 4:12 PM",
    amount: "-₦10,000",
    type: "out",
    status: "Successful",
  },
];

export default function TransactionsPage() {
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <p className="text-sm text-gray-500">
          Track money in, money out, and recent activity.
        </p>
      </div>

      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <SummaryCard label="Money In" value="₦120,000" type="in" />
        <SummaryCard label="Money Out" value="₦35,000" type="out" />
        <SummaryCard label="Total Transactions" value="24" />
      </div>

      <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-3 py-2 md:w-80">
          <Search size={17} className="text-gray-400" />
          <input
            placeholder="Search transactions"
            className="w-full text-sm outline-none"
          />
        </div>

        <div className="flex gap-2">
          {["All", "Credit", "Debit"].map((tab) => (
            <button
              key={tab}
              className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-tenant hover:text-white"
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {transactions.map((tx) => {
          const isIn = tx.type === "in";

          return (
            <div
              key={`${tx.title}-${tx.date}`}
              className="flex items-center justify-between border-b border-gray-100 p-4 last:border-b-0"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                    isIn
                      ? "bg-green-50 text-green-600"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  {isIn ? (
                    <ArrowDownLeft size={20} />
                  ) : (
                    <ArrowUpRight size={20} />
                  )}
                </div>

                <div>
                  <p className="font-semibold">{tx.title}</p>
                  <p className="text-xs text-gray-500">{tx.date}</p>
                </div>
              </div>

              <div className="text-right">
                <p
                  className={`font-bold ${
                    isIn ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {tx.amount}
                </p>
                <p className="text-xs text-gray-500">{tx.status}</p>
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}

function SummaryCard({
  label,
  value,
  type,
}: {
  label: string;
  value: string;
  type?: "in" | "out";
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <h2
        className={`mt-2 text-2xl font-bold ${
          type === "in"
            ? "text-green-600"
            : type === "out"
            ? "text-red-600"
            : "text-gray-900"
        }`}
      >
        {value}
      </h2>
    </div>
  );
}