"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type MouseEvent, type ReactNode } from "react";
import { ArrowLeft, ArrowUpRight, Mail, MessageSquare, SendHorizontal, Share2, Shield, X } from "lucide-react";
import { transferService } from "@/services/transfer.service";
import { accountService } from "@/services/account.service";
import { formatDateTime, formatMoney } from "@/lib/formatters";
import type { ClientTransfer } from "@/types/transfer";
import type { ClientAccount } from "@/types/account";

export default function TransactionReceiptPage() {
  const [showShareOverlay, setShowShareOverlay] = useState(false);
  const [transfer, setTransfer] = useState<ClientTransfer | null>(null);
  const [sourceAccount, setSourceAccount] = useState<ClientAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const transferId = new URLSearchParams(window.location.search).get("transferId");
    if (!transferId) {
      setError("No transfer was selected.");
      setIsLoading(false);
      return;
    }

    transferService.getMine(transferId)
      .then(async (item) => {
        setTransfer(item);
        try {
          setSourceAccount(await accountService.getMine(item.source_account_id));
        } catch {
          setSourceAccount(null);
        }
      })
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Unable to load this receipt"))
      .finally(() => setIsLoading(false));
  }, []);

  const receiptText = useMemo(() => {
    if (!transfer) return "";
    return [
      "ZentraBank Transfer Receipt",
      `Amount: ${formatMoney(transfer.amount, transfer.currency)}`,
      `Status: ${transfer.status}`,
      `Sent to: ${transfer.destination_account_name || transfer.destination_account_number}`,
      `Reference: ${transfer.reference}`,
      `Date: ${formatDateTime(transfer.completed_at || transfer.created_at)}`,
    ].join("\n");
  }, [transfer]);

  const handleShareOption = (type: string) => {
    const encodedText = encodeURIComponent(receiptText);
    if (type === "whatsapp") window.open(`https://wa.me/?text=${encodedText}`, "_blank");
    if (type === "email") window.location.href = `mailto:?subject=ZentraBank Transfer Receipt&body=${encodedText}`;
    if (type === "sms") window.location.href = `sms:?body=${encodedText}`;
    if (type === "telegram") window.open(`https://t.me/share/url?url=&text=${encodedText}`, "_blank");
  };

  if (isLoading) {
    return <main className="min-h-screen bg-[#e8edf3] px-5 pt-24 text-center text-[13px] text-black/45">Loading receipt…</main>;
  }

  if (error || !transfer) {
    return <main className="min-h-screen bg-[#e8edf3] px-5 pt-24 text-center"><p className="text-[13px] text-red-700">{error || "Transfer not found"}</p><Link href="/transactions" className="mt-4 inline-block text-[13px] font-semibold text-blue-700 underline">Back to transactions</Link></main>;
  }

  const recipient = transfer.destination_account_name || transfer.destination_account_number;
  const isSimulated = Boolean(transfer.is_simulated) || transfer.settlement_mode === "simulation";
  const date = new Date(transfer.completed_at || transfer.created_at);
  const statusSuccessful = transfer.status === "completed";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#e8edf3] px-5 pb-10 pt-8 text-[#3f3f3f]">
      <section className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col px-5 pb-7 pt-12">
        <header className="relative flex items-center justify-center">
          <Link href="/transactions" className="absolute left-0 text-[#555]"><ArrowLeft size={20} /></Link>
          <h1 className="font-heading text-[13px] font-bold tracking-[0.14em]">Transaction Receipt</h1>
        </header>

        <div className="mt-5 flex flex-col items-center">
          <div className="relative h-[62px] w-[62px] overflow-hidden rounded-[8px] bg-white shadow-sm"><Image src="/images/logo.png" alt="ZentraBank" fill priority className="object-contain p-1" /></div>
          <p className="mt-3 text-[12px] font-semibold text-[#777]">ZentraBank</p>
          <h2 className="mt-3 text-[31px] font-semibold tracking-[0.03em] text-[#d85b4f]">-{formatMoney(transfer.amount, transfer.currency)}</h2>
          <p className={`mt-2 text-[12px] font-semibold capitalize ${statusSuccessful ? "text-[#168d5a]" : "text-amber-700"}`}>{transfer.status}</p>
          <div className="mt-7 text-center">
            <p className="text-[12px] font-medium text-[#777]">Sent to <ArrowUpRight size={14} className="ml-2 inline-block text-[#d85b4f]" /></p>
            <p className="mt-2 text-[15px] font-bold text-[#3d3d3d]">{recipient}</p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <Detail label="Type" value={transfer.transfer_type === "external" ? "External bank transfer" : "Internal transfer"} />
          {transfer.destination_bank_name && <Detail label="Destination bank" value={transfer.destination_bank_name} />}
          {isSimulated && <Detail label="Settlement" value="Demo simulation — database only" valueClassName="font-bold text-blue-700" />}
          <Detail label="Transaction status" value={transfer.status} valueClassName={statusSuccessful ? "font-bold text-[#168d5a] capitalize" : "font-bold text-amber-700 capitalize"} />
          <Detail label="Transaction date" value={date.toLocaleDateString()} />
          <Detail label="Transaction time" value={date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} />
          <Detail label="Amount" value={formatMoney(transfer.amount, transfer.currency)} />
          <Detail label="Fee" value={formatMoney(0, transfer.currency)} />
          <Detail label="Reference" value={transfer.reference} />
          <Detail label="Transaction ID" value={transfer.id} />
          <Detail label="From account" value={sourceAccount ? `${sourceAccount.account_name} • ${sourceAccount.account_number}` : transfer.source_account_number || transfer.source_account_id} />
          <Detail label="Destination account" value={transfer.destination_account_number} />
          {transfer.description && <Detail label="Description" value={transfer.description} />}
        </div>

        <p className="mt-auto pt-10 text-center text-[12px] font-medium text-[#777]">Thank you for banking with ZentraBank!</p>
        <div className="mt-10 grid grid-cols-2 gap-3">
          <button type="button" onClick={() => setShowShareOverlay(true)} className="flex h-[39px] items-center justify-center gap-3 rounded-[10px] bg-white text-[15px] font-semibold shadow-sm active:scale-[0.98]">Share <Share2 size={17} className="text-[#d85b4f]" /></button>
          <Link href="/transactions" className="flex h-[39px] items-center justify-center gap-3 rounded-[10px] bg-white text-[15px] font-semibold shadow-sm active:scale-[0.98]">Close <X size={17} className="text-[#d85b4f]" /></Link>
        </div>
      </section>

      <ShareReceiptOverlay open={showShareOverlay} onClose={() => setShowShareOverlay(false)} onSelect={handleShareOption} />
    </main>
  );
}

function Detail({ label, value, valueClassName = "" }: { label: string; value: string; valueClassName?: string }) {
  return <div className="grid grid-cols-[145px_1fr] gap-4 border-b border-black/10 pb-2 text-[11px]"><p className="font-semibold text-[#777]">{label}</p><p className={`break-all text-right text-[#444] ${valueClassName}`}>{value}</p></div>;
}

function ShareReceiptOverlay({ open, onClose, onSelect }: { open: boolean; onClose: () => void; onSelect: (type: string) => void }) {
  if (!open) return null;
  return <div className="fixed inset-0 z-[100] bg-black/20" onClick={onClose}><section onClick={(e: MouseEvent<HTMLElement>) => e.stopPropagation()} className="fixed bottom-0 left-1/2 w-full max-w-[430px] -translate-x-1/2 rounded-t-[28px] bg-white px-7 pb-8 pt-6 shadow-[0_-8px_30px_rgba(0,0,0,0.12)]"><header className="relative flex items-center justify-center"><h2 className="text-[13px] font-bold text-[#555]">Share receipt</h2><button type="button" onClick={onClose} className="absolute right-0 text-black/25"><X size={20} /></button></header><div className="mt-7 grid grid-cols-4 place-items-center gap-3"><ShareOption label="WhatsApp" type="whatsapp" onSelect={onSelect} icon={<SendHorizontal size={23} />} /><ShareOption label="Email" type="email" onSelect={onSelect} icon={<Mail size={23} />} /><ShareOption label="SMS" type="sms" onSelect={onSelect} icon={<MessageSquare size={23} />} /><ShareOption label="Telegram" type="telegram" onSelect={onSelect} icon={<Shield size={23} />} /></div></section></div>;
}

function ShareOption({ label, type, icon, onSelect }: { label: string; type: string; icon: ReactNode; onSelect: (type: string) => void }) {
  return <button type="button" onClick={() => onSelect(type)} className="flex flex-col items-center gap-2 text-[10px] text-[#555]"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eef3f8]">{icon}</span>{label}</button>;
}
