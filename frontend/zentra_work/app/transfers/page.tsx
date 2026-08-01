"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ChevronRight, RefreshCw, Search } from "lucide-react";
import { beneficiaryService } from "@/services/beneficiary.service";
import { transferService } from "@/services/transfer.service";
import type { Beneficiary } from "@/types/beneficiary";
import type { ClientTransfer } from "@/types/transfer";

type TransferTab = "recent" | "beneficiaries";

type TransferContact = {
  id: string;
  name: string;
  bank: string;
  account: string;
  currency: string;
  transferable: boolean;
  type: "internal" | "external";
  bankCode?: string;
};

export default function TransferPage() {
  const [amount, setAmount] = useState("");
  const [activeTab, setActiveTab] = useState<TransferTab>("recent");
  const [search, setSearch] = useState("");
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [recentTransfers, setRecentTransfers] = useState<ClientTransfer[]>([]);
  const [selected, setSelected] = useState<TransferContact | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [saved, recent] = await Promise.all([
        beneficiaryService.listMine("", 1, 100),
        transferService.listMine(1, 30),
      ]);
      setBeneficiaries(saved);
      setRecentTransfers(recent);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load transfer contacts");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const contacts = useMemo<TransferContact[]>(() => {
    const items = activeTab === "beneficiaries"
      ? beneficiaries.map((item) => ({
          id: item.id,
          name: item.display_name || item.account_name,
          bank: item.bank_name || "ZentraBank",
          account: item.account_number,
          currency: item.currency,
          transferable: true,
          type: item.beneficiary_type,
          bankCode: item.bank_code || undefined,
        }))
      : Array.from(
          new Map(
            recentTransfers.map((item) => [
              item.destination_account_number,
              {
                id: item.destination_account_number,
                name: item.destination_account_name || item.destination_account_number,
                bank: item.destination_bank_name || "ZentraBank",
                account: item.destination_account_number,
                currency: item.currency,
                transferable: true,
                type: item.transfer_type || "internal",
                bankCode: item.destination_bank_code || undefined,
              },
            ]),
          ).values(),
        );

    const term = search.trim().toLowerCase();
    return term
      ? items.filter((item) => `${item.name} ${item.bank} ${item.account}`.toLowerCase().includes(term))
      : items;
  }, [activeTab, beneficiaries, recentTransfers, search]);

  const continueHref = selected?.transferable
    ? `/transfers/send-money?accountNumber=${encodeURIComponent(selected.account)}&name=${encodeURIComponent(selected.name)}&amount=${encodeURIComponent(amount)}&currency=${encodeURIComponent(selected.currency)}&transferType=${selected.type}&bankName=${encodeURIComponent(selected.bank)}&bankCode=${encodeURIComponent(selected.bankCode || "")}`
    : "#";

  return (
    <main className="min-h-screen bg-[#E7EBF0] text-[#3F3F3F]">
      <section className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col px-5 pb-6 pt-12">
        <header className="relative flex items-center justify-center">
          <Link href="/dashboard" className="absolute left-0 text-black/60"><ArrowLeft size={21} /></Link>
          <h1 className="font-heading text-[13px] font-bold tracking-[0.08em]">Transfer</h1>
          <button type="button" onClick={() => void load()} disabled={isLoading} className="absolute right-0 text-black/45 disabled:opacity-40" aria-label="Refresh">
            <RefreshCw size={17} className={isLoading ? "animate-spin" : ""} />
          </button>
        </header>

        <section className="mt-8 flex-1 rounded-[15px] bg-white px-3 pb-5 pt-7">
          <div className="border-b border-black/20 pb-2">
            <label className="flex items-center text-[30px] font-semibold leading-none">
              <span>{selected?.currency === "USD" ? "$" : selected?.currency || "$"}</span>
              <input value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))} inputMode="decimal" placeholder="0.00" className="w-full bg-transparent text-[30px] font-semibold outline-none placeholder:text-black/20" />
            </label>
          </div>

          <Link href="/transfers/add-bank" className="flex h-[48px] items-center justify-center gap-6 text-[13px] font-medium text-[#4F4F4F]">
            Add a new beneficiary <ChevronRight size={18} />
          </Link>

          <section className="rounded-[5px] bg-[#90C5F8] px-2 pb-3 pt-3">
            <div className="grid grid-cols-2 rounded-[14px] bg-[#A9D4FF] p-1">
              {(["recent", "beneficiaries"] as const).map((tab) => (
                <button key={tab} onClick={() => { setActiveTab(tab); setSelected(null); }} className={`h-[28px] rounded-[12px] text-[12px] font-medium ${activeTab === tab ? "bg-[#BBDFFF] text-[#37597A]" : "text-[#3F3F3F]"}`}>
                  {tab === "recent" ? "Recent Transfers" : "Beneficiaries"}
                </button>
              ))}
            </div>

            <div className="relative mt-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/35" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search beneficiaries" className="h-[30px] w-full rounded-full bg-white pl-9 pr-3 text-[12px] outline-none placeholder:text-black/45" />
            </div>

            <div className="mt-2 space-y-2">
              {error ? (
                <div className="rounded-[6px] bg-red-50 px-3 py-4 text-center text-[11px] text-red-700">{error}</div>
              ) : isLoading ? (
                <div className="py-8 text-center text-[11px] text-black/45">Loading…</div>
              ) : contacts.length === 0 ? (
                <div className="py-8 text-center text-[11px] text-black/45">No {activeTab === "recent" ? "recent transfers" : "saved beneficiaries"} found.</div>
              ) : contacts.map((item) => (
                <button key={item.id} onClick={() => setSelected(item)} className={`flex min-h-[54px] w-full items-center gap-3 rounded-[6px] bg-[#EEF3F8] px-2 py-2 text-left shadow-sm transition active:scale-[0.99] ${selected?.id === item.id ? "ring-2 ring-[#2458E8]" : "ring-1 ring-[#BBDFFF]"}`}>
                  <div className="relative h-[40px] w-[40px] shrink-0"><Image src="/images/bank-icon.png" alt={item.bank} fill className="object-contain" /></div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-[14px] font-semibold leading-[16px] text-[#252525]">{item.name}</h3>
                    <p className="truncate text-[12px] leading-[14px] text-[#4F4F4F]">{item.bank} - {item.account}</p>
                    {item.type === "external" && <p className="mt-0.5 text-[9px] font-semibold text-blue-700">Demo settlement — database only</p>}
                  </div>
                </button>
              ))}
            </div>
          </section>
        </section>

        {selected?.type === "external" && <p className="mt-2 text-center text-[11px] text-blue-700">This external transfer will be simulated in the database; no bank settlement will occur.</p>}
        <Link href={continueHref} aria-disabled={!selected?.transferable || !amount || Number(amount) <= 0} onClick={(e) => { if (!selected?.transferable || !amount || Number(amount) <= 0) e.preventDefault(); }} className={`mt-3 flex h-[42px] w-full items-center justify-center rounded-[8px] text-[14px] font-bold text-white ${selected?.transferable && Number(amount) > 0 ? "bg-[#2458E8]" : "pointer-events-none bg-[#2458E8]/40"}`}>
          Continue
        </Link>
      </section>
    </main>
  );
}
