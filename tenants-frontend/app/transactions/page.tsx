"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import { getApiErrorMessage } from "@/lib/api";
import { getMyTransfers } from "@/services/banking.service";
import type { Transfer } from "@/types/banking.types";
import { ArrowUpRight, RefreshCw, Search } from "lucide-react";

const money = (value: string | number, currency: string) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(Number(value || 0));

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setTransactions(await getMyTransfers({ page: 1, pageSize: 100 }));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return transactions.filter((tx) => {
      const matchesStatus = status === "all" || tx.status === status;
      const matchesSearch = !query || [tx.reference, tx.description, tx.destination_account_number, tx.destination_account_name]
        .filter(Boolean).some((value) => String(value).toLowerCase().includes(query));
      return matchesStatus && matchesSearch;
    });
  }, [search, status, transactions]);

  const totals = useMemo(() => {
    const byCurrency = new Map<string, number>();
    for (const tx of transactions) {
      if (tx.status !== "completed") continue;
      byCurrency.set(tx.currency, (byCurrency.get(tx.currency) ?? 0) + Number(tx.amount || 0));
    }
    return Array.from(byCurrency.entries());
  }, [transactions]);

  return (
    <AppShell>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Transactions</h1>
          <p className="text-sm text-white/70">Track your real transfer activity.</p>
        </div>
        <button type="button" onClick={() => void load()} disabled={loading} className="rounded-xl border border-white/20 bg-black/30 p-3 text-white disabled:opacity-50" aria-label="Refresh transactions">
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <SummaryCard label="Total transactions" value={String(transactions.length)} />
        <SummaryCard label="Completed" value={String(transactions.filter((tx) => tx.status === "completed").length)} />
        <SummaryCard label="Transferred" value={totals.length ? totals.map(([currency, total]) => money(total, currency)).join(" · ") : "—"} />
      </div>

      <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-3 py-2 md:w-96">
          <Search size={17} className="text-gray-400" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search reference, account or description" className="w-full text-sm outline-none" />
        </div>
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 outline-none">
          <option value="all">All statuses</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {error ? <div className="mb-5 rounded-2xl bg-red-950/80 p-4 text-red-100">{error}</div> : null}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex min-h-44 items-center justify-center text-gray-600"><RefreshCw className="mr-3 animate-spin" /> Loading transactions…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No transactions match your current filters.</div>
        ) : filtered.map((tx) => (
          <Link key={tx.id} href={`/dashboard/transfer/transaction?id=${tx.id}`} className="flex items-center justify-between gap-4 border-b border-gray-100 p-4 transition hover:bg-gray-50 last:border-b-0">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600"><ArrowUpRight size={20} /></div>
              <div className="min-w-0">
                <p className="truncate font-semibold">{tx.destination_account_name || tx.description || "Transfer sent"}</p>
                <p className="truncate text-xs text-gray-500">{tx.reference} · {new Date(tx.created_at).toLocaleString()}</p>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-bold text-red-600">-{money(tx.amount, tx.currency)}</p>
              <p className="text-xs capitalize text-gray-500">{tx.status}</p>
            </div>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><p className="text-sm text-gray-500">{label}</p><h2 className="mt-2 break-words text-2xl font-bold text-gray-900">{value}</h2></div>;
}
