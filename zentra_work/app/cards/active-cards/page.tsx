"use client";

import Link from "next/link";
import { ArrowLeft, Loader2, Plus, RefreshCw, Snowflake, Sun } from "lucide-react";
import BottomNav from "@/components/layout/BottomNav";
import { cardService } from "@/services/card.service";
import type { ClientCard } from "@/types/card";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function ActiveCardsPage() {
  const [cards, setCards] = useState<ClientCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try { setCards(await cardService.listMine()); }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to load your cards."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const counts = useMemo(() => ({
    active: cards.filter((card) => card.status === "active").length,
    frozen: cards.filter((card) => card.status === "frozen").length,
    virtual: cards.filter((card) => Boolean(card.is_virtual)).length,
  }), [cards]);

const toggleCard = async (
  card: ClientCard,
) => {
  if (
    !["active", "frozen"].includes(
      card.status,
    )
  ) {
    return;
  }

  if (
    card.status === "frozen" &&
    card.frozen_by_admin
  ) {
    setError(
      "This card was frozen by your bank and cannot be unfrozen from your account.",
    );

    return;
  }

  setBusyId(card.id);
  setError("");

  try {
    const updated =
      await cardService.changeStatus(
        card.id,
        card.status === "active"
          ? "frozen"
          : "active",
      );

    setCards((current) =>
      current.map((item) =>
        item.id === updated.id
          ? updated
          : item,
      ),
    );
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Unable to update card status.",
    );
  } finally {
    setBusyId("");
  }
};

  return (
    <main className="min-h-screen bg-[#E7EBF0]">
      <section className="mx-auto max-w-[430px] px-4 pb-[120px] pt-12 lg:max-w-[1180px] lg:px-8 lg:pb-12 lg:pt-10">
        <header className="relative flex items-center justify-center lg:justify-between">
          <Link href="/cards/cards-home" className="absolute left-0 lg:static lg:grid lg:h-11 lg:w-11 lg:place-items-center lg:rounded-full lg:bg-white lg:shadow-sm"><ArrowLeft size={20} /></Link>
          <h1 className="font-heading text-[18px] font-bold lg:text-[24px]">My cards</h1>
          <div className="flex gap-2">
            <button onClick={() => void load()} className="hidden h-11 w-11 place-items-center rounded-full bg-white shadow-sm lg:grid" aria-label="Refresh cards"><RefreshCw size={17} /></button>
            <Link
              href="/cards/purchase-requests"
              className="hidden h-11 items-center gap-2 rounded-full bg-white px-5 text-[14px] font-semibold text-[#2458E8] shadow-sm lg:flex"
            >
              Pending requests
            </Link>
            <Link href="/cards/cards-purchase" className="hidden h-11 items-center gap-2 rounded-full bg-[#2458E8] px-5 text-[14px] font-semibold text-white shadow-sm lg:flex"><Plus size={16} />New Card</Link>
          </div>
        </header>
        <div className="mt-5 flex gap-3 lg:hidden">
  <Link
    href="/cards/cards-purchase"
    className="flex h-11 flex-1 items-center justify-center rounded-xl bg-[#2458E8] text-sm font-bold text-white"
  >
    <Plus size={16} className="mr-2" />
    New card
  </Link>

  <Link
    href="/cards/purchase-requests"
    className="flex h-11 flex-1 items-center justify-center rounded-xl bg-white text-sm font-bold text-[#2458E8] shadow-sm"
  >
    Requests
  </Link>
</div>

        {error && <div className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <section className="mt-8 lg:grid lg:grid-cols-12 lg:gap-6">
          <aside className="hidden lg:col-span-4 lg:block">
            <div className="sticky top-10 rounded-[30px] bg-white p-6 shadow-sm">
              <p className="text-[13px] font-semibold text-[#2458E8]">Card Overview</p>
              <h2 className="mt-3 text-[40px] font-black leading-none text-[#252525]">{cards.length}</h2>
              <p className="mt-2 text-[14px] text-black/50">Cards connected to your ZentraBank accounts.</p>
              <div className="mt-6 space-y-3"><OverviewRow label="Active cards" value={String(counts.active)} /><OverviewRow label="Virtual cards" value={String(counts.virtual)} /><OverviewRow label="Frozen cards" value={String(counts.frozen)} /></div>
              <Link href="/cards/cards-purchase" className="mt-7 flex h-[48px] items-center justify-center rounded-[16px] bg-[#2E8B57] text-[14px] font-bold text-white shadow-md">Create Virtual Card</Link>
            </div>
          </aside>

          <section className="lg:col-span-8 lg:rounded-[30px] lg:bg-white lg:p-8 lg:shadow-sm">
            <h2 className="text-[20px] font-bold text-[#4A4A4A] lg:text-[34px]">My cards</h2>
            {loading ? <div className="grid min-h-[280px] place-items-center"><Loader2 className="animate-spin text-[#2458E8]" /></div> : cards.length === 0 ? (
              <div className="mt-8 rounded-3xl bg-white p-8 text-center text-sm text-black/50 lg:bg-[#F7FAFC]">You do not have any issued cards yet.<Link href="/cards/cards-purchase" className="mt-4 block font-bold text-[#2458E8]">Create your first card</Link></div>
            ) : (
              <section className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-8">
                {cards.map((card) => (
                  <article key={card.id} className="relative min-h-[210px] overflow-hidden rounded-[26px] bg-gradient-to-br from-[#1D4ED8] via-[#2458E8] to-[#12285f] p-5 text-white shadow-xl">
                    <div className="flex items-start justify-between"><div><p className="text-xs uppercase tracking-widest text-white/65">{card.card_brand}</p><h3 className="mt-1 text-xl font-black capitalize">{card.card_type.replaceAll("_", " ")}</h3></div><span className="rounded-full bg-white/15 px-3 py-1 text-xs capitalize">{card.status}</span></div>
                    <p className="mt-10 text-lg tracking-[0.16em]">{card.masked_pan}</p>
                    <div className="mt-5 flex items-end justify-between"><div><p className="text-[10px] uppercase text-white/50">Expires</p><p className="font-bold">{String(card.expiry_month).padStart(2, "0")}/{String(card.expiry_year).slice(-2)}</p></div><div className="text-right"><p className="text-[10px] uppercase text-white/50">Account</p><p className="text-sm font-semibold">•••• {card.account_number?.slice(-4)}</p></div></div>
                    <Link href={`/cards/details/${card.id}`} className="mt-4 block text-sm font-bold text-white/80">View details →</Link>{card.status === "active" && (
  <button
    type="button"
    disabled={
      busyId === card.id
    }
    onClick={() =>
      void toggleCard(card)
    }
    className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-white/15 text-sm font-bold backdrop-blur disabled:opacity-60"
  >
    {busyId === card.id ? (
      <Loader2
        size={16}
        className="animate-spin"
      />
    ) : (
      <Snowflake size={16} />
    )}

    Freeze card
  </button>
)}

{card.status === "frozen" &&
  !card.frozen_by_admin && (
    <button
      type="button"
      disabled={
        busyId === card.id
      }
      onClick={() =>
        void toggleCard(card)
      }
      className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-white/15 text-sm font-bold backdrop-blur disabled:opacity-60"
    >
      {busyId === card.id ? (
        <Loader2
          size={16}
          className="animate-spin"
        />
      ) : (
        <Sun size={16} />
      )}

      Unfreeze card
    </button>
  )}

{card.status === "frozen" &&
  card.frozen_by_admin && (
    <div className="mt-5 rounded-xl border border-amber-200/30 bg-amber-500/15 px-4 py-3 text-center">
      <p className="text-sm font-bold text-amber-100">
        Frozen by bank
      </p>

      <p className="mt-1 text-[11px] leading-4 text-white/60">
        This card can only be
        unfrozen by your bank.
      </p>
    </div>
  )}
                  </article>
                ))}
              </section>
            )}
          </section>
        </section>
      </section>
      <div className="lg:hidden"><BottomNav /></div>
    </main>
  );
}

function OverviewRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between rounded-[16px] bg-[#F7FAFC] px-4 py-3"><span className="text-[14px] font-medium text-black/55">{label}</span><span className="text-[15px] font-bold text-[#2458E8]">{value}</span></div>;
}
