"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDownLeft, ArrowLeft, ArrowUpRight, RefreshCw, Search } from "lucide-react";
import BottomNav from "@/components/layout/BottomNav";
import { transactionService } from "@/services/transaction.service";
import { formatDateTime, formatMoney } from "@/lib/formatters";
import type { ClientTransaction } from "@/types/transaction";

export default function TransactionHistoryPage() {
  const [transactions, setTransactions] = useState<ClientTransaction[]>([]);
  const [filter, setFilter] = useState<"all" | "credit" | "debit">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true); setError(null);
    try { setTransactions(await transactionService.listMine({ pageSize: 100 })); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to load transaction history"); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);
  
  const visible = useMemo(() => {
    let result = filter === "all" ? transactions : transactions.filter(t => t.entry_type === filter);
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(t => 
        (t.description?.toLowerCase() || "").includes(q) ||
        (t.reference?.toLowerCase() || "").includes(q) ||
        (t.source_account_name?.toLowerCase() || "").includes(q) ||
        (t.destination_account_name?.toLowerCase() || "").includes(q) ||
        (t.destination_bank_name?.toLowerCase() || "").includes(q)
      );
    }
    return result;
  }, [filter, transactions, searchQuery]);

  return (
    <main className="min-h-screen bg-[#E7EBF0] pb-[92px] text-[#1f1f1f]/80 lg:pb-16 lg:px-12 lg:py-16">
      {/* Mobile Layout Wrapper */}
      <section className="mx-auto max-w-[390px] px-4 pt-11 lg:hidden">
        <header className="relative mb-5 flex h-8 items-center justify-center">
          <Link href="/dashboard" className="absolute left-0 top-1/2 -translate-y-1/2"><ArrowLeft size={22}/></Link>
          <h1 className="font-sf-condensed text-[14px] font-bold">Transaction History</h1>
          <button onClick={() => void load()} disabled={isLoading} className="absolute right-0 top-1/2 -translate-y-1/2 disabled:opacity-40" aria-label="Refresh"><RefreshCw size={17} className={isLoading ? "animate-spin" : ""}/></button>
        </header>
        <div className="mb-4 grid grid-cols-3 gap-2">
          {(["all","credit","debit"] as const).map(value => <button key={value} onClick={() => setFilter(value)} className={`rounded-full px-3 py-2 text-[11px] font-semibold capitalize ${filter===value ? "bg-black text-white" : "bg-white/60 text-black/55"}`}>{value}</button>)}
        </div>
        {error ? <State message={error} action={() => void load()} /> : isLoading ? <div className="py-16 text-center text-[12px] text-black/45">Loading your transactions…</div> : visible.length===0 ? <div className="rounded-[8px] bg-white/40 px-4 py-10 text-center text-[12px] text-black/45">No {filter === "all" ? "" : filter} transactions found.</div> : <div className="space-y-3">{visible.map(t => <Row key={t.id} transaction={t}/>)}</div>}
      </section>

      {/* Desktop Layout Wrapper */}
      <section className="hidden lg:mx-auto lg:flex lg:w-full lg:max-w-[1200px] lg:flex-col">
        {/* Desktop Header */}
        <header className="relative mb-10 flex items-center justify-between rounded-[24px] border border-black/5 bg-white/60 px-8 py-6 backdrop-blur-md shadow-sm">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="grid h-10 w-10 place-items-center rounded-full bg-white text-[#1f1f1f] shadow-md transition hover:bg-white/90"
              aria-label="Back to dashboard"
            >
              <ArrowLeft size={20} />
            </Link>

            <div>
              <h1 className="font-heading text-[22px] font-black tracking-tight text-[#1f1f1f]">
                Transaction History & Ledger
              </h1>
              <p className="mt-0.5 text-xs text-black/50">
                Audit complete credit and debit activity, search references, and monitor account balances.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => void load()}
              disabled={isLoading}
              className="flex items-center gap-2 rounded-full bg-black px-6 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-black/80 disabled:opacity-50"
            >
              <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
              Refresh Ledger
            </button>
          </div>
        </header>

        {/* Filters and Search Bar */}
        <div className="mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex gap-2 w-full md:w-auto">
            {(["all", "credit", "debit"] as const).map((value) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`rounded-full px-6 py-2.5 text-xs font-bold capitalize transition shadow-xs ${
                  filter === value
                    ? "bg-black text-white"
                    : "bg-white/80 text-black/60 hover:bg-white"
                }`}
              >
                {value} Transactions
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search description, bank, reference..."
              className="h-12 w-full rounded-[14px] bg-white pl-11 pr-4 text-xs font-semibold text-black outline-none shadow-sm focus:ring-2 focus:ring-black"
            />
          </div>
        </div>

        {error ? (
          <State message={error} action={() => void load()} />
        ) : isLoading ? (
          <div className="py-24 text-center text-sm text-black/50">Loading your secure transaction history…</div>
        ) : visible.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-black/10 bg-white/40 px-6 py-20 text-center text-sm text-black/50 backdrop-blur-sm">
            No {filter === "all" ? "" : filter} transactions found matching your criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visible.map((t) => (
              <RowDesktop key={t.id} transaction={t} />
            ))}
          </div>
        )}
      </section>

      <BottomNav/>
    </main>
  );
}

function State({message,action}:{message:string;action:()=>void}) { return <div className="rounded-[16px] border border-red-200 bg-red-50 px-6 py-6 text-center text-xs font-medium text-red-700 shadow-sm"><p>{message}</p><button onClick={action} className="mt-2 font-bold underline">Try again</button></div>; }

function Row({transaction:t}:{transaction:ClientTransaction}) {
  const credit=t.entry_type==="credit";
  const counterparty=credit ? (t.source_account_name || t.source_account_number || "Incoming payment") : (t.transfer_destination_account_name || t.destination_account_name || t.destination_account_number_resolved || t.destination_account_number || "Outgoing payment");
  return <article className="flex min-h-[62px] items-center justify-between rounded-[8px] bg-white/30 px-3 py-2 shadow-[0_1px_4px_rgba(0,0,0,0.18)]">
    <div className="flex min-w-0 items-center gap-3"><div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${credit ? "bg-emerald-100" : "bg-[#FBE3E3]"}`}>{credit ? <ArrowDownLeft size={14} className="text-emerald-700"/> : <ArrowUpRight size={14} className="text-[#E0443E]"/>}</div><div className="min-w-0"><p className="truncate text-[10px] text-black/35">{t.description || t.reference || "Account transaction"}</p><h3 className="truncate text-[14px] text-black/60">{counterparty}</h3><p className="mt-0.5 text-[9px] text-black/35">{t.destination_bank_name ? `${t.destination_bank_name} · ` : ""}{formatDateTime(t.created_at)} · Balance {formatMoney(t.balance_after,t.currency)}{t.is_simulated ? " · Demo" : ""}</p></div></div>
    <div className="ml-2 shrink-0 text-right"><p className={`font-sf text-[14px] font-semibold ${credit ? "text-emerald-700" : "text-[#C0392B]/80"}`}>{credit?"+":"-"}{formatMoney(t.amount,t.currency)}</p><p className="mt-0.5 text-[9px] capitalize text-black/35">{t.status || "completed"}</p></div>
  </article>;
}

function RowDesktop({ transaction: t }: { transaction: ClientTransaction }) {
  const credit = t.entry_type === "credit";
  const counterparty = credit 
    ? (t.source_account_name || t.source_account_number || "Incoming payment") 
    : (t.transfer_destination_account_name || t.destination_account_name || t.destination_account_number_resolved || t.destination_account_number || "Outgoing payment");

  return (
    <article className="flex items-center justify-between rounded-[20px] border border-black/5 bg-white/70 p-6 shadow-sm backdrop-blur-md transition hover:bg-white hover:shadow-md">
      <div className="flex items-center gap-4 min-w-0">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${credit ? "bg-emerald-100" : "bg-red-100"}`}>
          {credit ? <ArrowDownLeft size={20} className="text-emerald-700" /> : <ArrowUpRight size={20} className="text-red-600" />}
        </div>
        
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-black/40">
            {t.description || t.reference || "Account transaction"}
          </p>
          <h3 className="truncate text-base font-black text-[#1f1f1f] mt-0.5">
            {counterparty}
          </h3>
          <p className="mt-1 text-xs font-medium text-black/50">
            {t.destination_bank_name ? `${t.destination_bank_name} · ` : ""}
            {formatDateTime(t.created_at)}
            {" · Balance "}
            <span className="font-bold text-[#1f1f1f]">{formatMoney(t.balance_after, t.currency)}</span>
            {t.is_simulated ? " · Demo" : ""}
          </p>
        </div>
      </div>

      <div className="ml-4 shrink-0 text-right">
        <p className={`text-lg font-black tracking-tight ${credit ? "text-emerald-700" : "text-red-600"}`}>
          {credit ? "+" : "-"}{formatMoney(t.amount, t.currency)}
        </p>
        <span className={`inline-block mt-1 rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
          (t.status || "completed") === "completed" ? "bg-black/5 text-black/60" : "bg-amber-100 text-amber-800"
        }`}>
          {t.status || "completed"}
        </span>
      </div>
    </article>
  );
}