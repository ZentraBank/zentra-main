"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2, RefreshCw, Snowflake, Sun } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { cardService } from "@/services/card.service";
import type { ClientCard } from "@/types/card";

export default function CardDetailsPage() {
  const { cardId } = useParams<{ cardId: string }>();
  const [card, setCard] = useState<ClientCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!cardId) return;
    setLoading(true); setError("");
    try { setCard(await cardService.getMine(cardId)); }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to load this card."); }
    finally { setLoading(false); }
  }, [cardId]);

  useEffect(() => { void load(); }, [load]);

  const toggle = async () => {
    if (!card || !["active", "frozen"].includes(card.status)) return;
    setBusy(true); setError("");
    try { setCard(await cardService.changeStatus(card.id, card.status === "active" ? "frozen" : "active")); }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to update card status."); }
    finally { setBusy(false); }
  };

  return <main className="min-h-screen bg-[#E7EBF0] px-5 py-10 text-[#252525]">
    <section className="mx-auto max-w-[760px]">
      <header className="flex items-center justify-between">
        <Link href="/cards/active-cards" className="grid h-11 w-11 place-items-center rounded-full bg-white shadow-sm"><ArrowLeft size={20}/></Link>
        <h1 className="text-xl font-bold">Card details</h1>
        <button onClick={() => void load()} className="grid h-11 w-11 place-items-center rounded-full bg-white shadow-sm"><RefreshCw size={18}/></button>
      </header>
      {error && <p className="mt-5 rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      {loading ? <div className="grid min-h-[420px] place-items-center"><Loader2 className="animate-spin text-[#2458E8]"/></div> : card ? <>
        <article className="mt-8 min-h-[240px] rounded-[30px] bg-gradient-to-br from-[#1D4ED8] via-[#2458E8] to-[#12285f] p-7 text-white shadow-2xl">
          <div className="flex justify-between"><div><p className="text-xs uppercase tracking-widest text-white/60">{card.card_brand}</p><h2 className="mt-1 text-2xl font-black capitalize">{card.card_type.replaceAll("_", " ")}</h2></div><span className="h-fit rounded-full bg-white/15 px-3 py-1 text-xs capitalize">{card.status}</span></div>
          <p className="mt-14 text-xl tracking-[0.18em]">{card.masked_pan}</p>
          <div className="mt-7 flex justify-between"><div><p className="text-[10px] uppercase text-white/50">Expires</p><p className="font-bold">{String(card.expiry_month).padStart(2,"0")}/{String(card.expiry_year).slice(-2)}</p></div><div className="text-right"><p className="text-[10px] uppercase text-white/50">Account</p><p className="font-semibold">•••• {card.account_number?.slice(-4)}</p></div></div>
        </article>
        <section className="mt-6 grid gap-3 rounded-[26px] bg-white p-6 shadow-sm sm:grid-cols-2">
          <Detail label="Account name" value={card.account_name}/><Detail label="Currency" value={card.currency}/><Detail label="Daily spend limit" value={`${card.currency} ${Number(card.daily_spend_limit).toLocaleString()}`}/><Detail label="Card format" value={Boolean(card.is_virtual) ? "Virtual" : "Physical"}/>
        </section>
        {["active","frozen"].includes(card.status) && <button onClick={() => void toggle()} disabled={busy} className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#2458E8] font-bold text-white disabled:opacity-60">{busy ? <Loader2 size={17} className="animate-spin"/> : card.status === "active" ? <Snowflake size={17}/> : <Sun size={17}/>} {card.status === "active" ? "Freeze card" : "Unfreeze card"}</button>}
      </> : null}
    </section>
  </main>;
}
function Detail({label,value}:{label:string;value:string}){return <div className="rounded-2xl bg-[#F7FAFC] p-4"><p className="text-xs text-black/45">{label}</p><p className="mt-1 font-semibold">{value || "—"}</p></div>}
