"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDownLeft, ArrowLeft, ArrowUpRight, RefreshCw } from "lucide-react";
import BottomNav from "@/components/layout/BottomNav";
import { transactionService } from "@/services/transaction.service";
import { formatDateTime, formatMoney } from "@/lib/formatters";
import type { ClientTransaction } from "@/types/transaction";

export default function TransactionHistoryPage() {
  const [transactions, setTransactions] = useState<ClientTransaction[]>([]);
  const [filter, setFilter] = useState<"all" | "credit" | "debit">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true); setError(null);
    try { setTransactions(await transactionService.listMine({ pageSize: 100 })); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to load transaction history"); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);
  const visible = useMemo(() => filter === "all" ? transactions : transactions.filter(t => t.entry_type === filter), [filter, transactions]);

  return <main className="min-h-screen bg-[#E7EBF0] pb-[92px] text-[#1f1f1f]/80">
    <section className="mx-auto max-w-[390px] px-4 pt-11">
      <header className="relative mb-5 flex h-8 items-center justify-center">
        <Link href="/dashboard" className="absolute left-0 top-1/2 -translate-y-1/2"><ArrowLeft size={22}/></Link>
        <h1 className="font-sf-condensed text-[14px] font-bold">Transaction History</h1>
        <button onClick={() => void load()} disabled={isLoading} className="absolute right-0 top-1/2 -translate-y-1/2 disabled:opacity-40" aria-label="Refresh"><RefreshCw size={17} className={isLoading ? "animate-spin" : ""}/></button>
      </header>
      <div className="mb-4 grid grid-cols-3 gap-2">
        {(["all","credit","debit"] as const).map(value => <button key={value} onClick={() => setFilter(value)} className={`rounded-full px-3 py-2 text-[11px] font-semibold capitalize ${filter===value ? "bg-black text-white" : "bg-white/60 text-black/55"}`}>{value}</button>)}
      </div>
      {error ? <State message={error} action={() => void load()} /> : isLoading ? <div className="py-16 text-center text-[12px] text-black/45">Loading your transactions…</div> : visible.length===0 ? <div className="rounded-[8px] bg-white/40 px-4 py-10 text-center text-[12px] text-black/45">No {filter === "all" ? "" : filter} transactions found.</div> : <div className="space-y-3">{visible.map(t => <Row key={t.id} transaction={t}/>)}</div>}
    </section><BottomNav/>
  </main>;
}

function State({message,action}:{message:string;action:()=>void}) { return <div className="rounded-[8px] border border-red-200 bg-red-50 px-4 py-4 text-center text-[12px] text-red-700"><p>{message}</p><button onClick={action} className="mt-2 font-semibold underline">Try again</button></div>; }

function Row({transaction:t}:{transaction:ClientTransaction}) {
  const credit=t.entry_type==="credit";
  const counterparty=credit ? (t.source_account_name || t.source_account_number || "Incoming payment") : (t.transfer_destination_account_name || t.destination_account_name || t.destination_account_number_resolved || t.destination_account_number || "Outgoing payment");
  return <article className="flex min-h-[62px] items-center justify-between rounded-[8px] bg-white/30 px-3 py-2 shadow-[0_1px_4px_rgba(0,0,0,0.18)]">
    <div className="flex min-w-0 items-center gap-3"><div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${credit ? "bg-emerald-100" : "bg-[#FBE3E3]"}`}>{credit ? <ArrowDownLeft size={14} className="text-emerald-700"/> : <ArrowUpRight size={14} className="text-[#E0443E]"/>}</div><div className="min-w-0"><p className="truncate text-[10px] text-black/35">{t.description || t.reference || "Account transaction"}</p><h3 className="truncate text-[14px] text-black/60">{counterparty}</h3><p className="mt-0.5 text-[9px] text-black/35">{t.destination_bank_name ? `${t.destination_bank_name} · ` : ""}{formatDateTime(t.created_at)} · Balance {formatMoney(t.balance_after,t.currency)}{t.is_simulated ? " · Demo" : ""}</p></div></div>
    <div className="ml-2 shrink-0 text-right"><p className={`font-sf text-[14px] font-semibold ${credit ? "text-emerald-700" : "text-[#C0392B]/80"}`}>{credit?"+":"-"}{formatMoney(t.amount,t.currency)}</p><p className="mt-0.5 text-[9px] capitalize text-black/35">{t.status || "completed"}</p></div>
  </article>;
}
