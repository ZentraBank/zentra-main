"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CreditCard,
  Loader2,
  RefreshCw,
  Snowflake,
  Sun,
  Wallet,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { cardService } from "@/services/card.service";
import type { ClientCard } from "@/types/card";

export default function CardDetailsPage() {
  const { cardId } = useParams<{ cardId: string }>();

  const [card, setCard] = useState<ClientCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [limit, setLimit] = useState("");
const [savingLimit, setSavingLimit] = useState(false);

  const load = useCallback(async () => {
    if (!cardId) return;

    setLoading(true);
    setError("");

    try {
      const result = await cardService.getMine(cardId);
      setCard(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load this card.",
      );
    } finally {
      setLoading(false);
    }
  }, [cardId]);

  useEffect(() => {
    void load();
  }, [load]);

  const toggle = async () => {
    if (!card || !["active", "frozen"].includes(card.status)) {
      return;
    }

    setBusy(true);
    setError("");

    try {
      const updated = await cardService.changeStatus(
        card.id,
        card.status === "active" ? "frozen" : "active",
      );

      setCard(updated);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update card status.",
      );
    } finally {
      setBusy(false);
    }
  };

  const saveLimit = async () => {
  if (!card) return;

  const amount = Number(limit);

  if (!Number.isFinite(amount) || amount <= 0) {
    setError("Please enter a valid daily spend limit.");
    return;
  }

  setSavingLimit(true);
  setError("");

  try {
    const updated = await cardService.changeLimit(
      card.id,
      amount
    );

    setCard(updated);
    setLimit(String(updated.daily_spend_limit));
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Unable to update card limit."
    );
  } finally {
    setSavingLimit(false);
  }
};

  return (
    <main className="min-h-screen bg-[#E7EBF0] text-[#252525]">
      <section className="mx-auto max-w-[430px] px-4 pb-24 pt-12 lg:max-w-[900px] lg:px-8 lg:py-10">
        <header className="relative flex items-center justify-center lg:justify-between">
          <Link
            href="/cards/active-cards"
            className="absolute left-0 text-black/60 lg:static lg:grid lg:h-11 lg:w-11 lg:place-items-center lg:rounded-full lg:bg-white lg:shadow-sm"
          >
            <ArrowLeft size={21} />
          </Link>

          <h1 className="text-[18px] font-bold lg:text-[26px]">
            Card details
          </h1>

          <button
            type="button"
            onClick={() => void load()}
            className="absolute right-0 grid h-10 w-10 place-items-center rounded-full bg-white shadow-sm lg:static lg:h-11 lg:w-11"
            aria-label="Refresh card"
          >
            <RefreshCw size={17} />
          </button>
        </header>

        {error && (
          <div className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid min-h-[420px] place-items-center">
            <Loader2 className="animate-spin text-[#2458E8]" />
          </div>
        ) : card ? (
          <>
            <section className="mt-8 overflow-hidden rounded-[30px] bg-gradient-to-br from-[#1D4ED8] via-[#2458E8] to-[#12285f] p-6 text-white shadow-xl">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/60">
                    {card.card_brand}
                  </p>

                  <h2 className="mt-1 text-[28px] font-black capitalize">
                    {card.card_type.replaceAll("_", " ")}
                  </h2>
                </div>

                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold capitalize">
                  {card.status}
                </span>
              </div>

              <p className="mt-12 text-[20px] tracking-[0.16em]">
                {card.masked_pan}
              </p>

              <div className="mt-7 flex items-end justify-between">
                <div>
                  <p className="text-[10px] uppercase text-white/50">
                    Expires
                  </p>

                  <p className="font-bold">
                    {String(card.expiry_month).padStart(2, "0")}/
                    {String(card.expiry_year).slice(-2)}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[10px] uppercase text-white/50">
                    Linked account
                  </p>

                  <p className="text-sm font-semibold">
                    •••• {card.account_number?.slice(-4)}
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-6 rounded-[28px] bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#E8F0FF] text-[#2458E8]">
                  <CreditCard size={20} />
                </span>

                <div>
                  <h3 className="font-black">
                    Card information
                  </h3>

                  <p className="text-xs text-black/45">
                    Live details from your issued card.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <Detail
                  label="Status"
                  value={card.status}
                />

                <Detail
                  label="Card format"
                  value={
                    Boolean(card.is_virtual)
                      ? "Virtual"
                      : "Physical"
                  }
                />

                <Detail
                  label="Currency"
                  value={card.currency}
                />

                <div className="rounded-[16px] bg-[#F7FAFC] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-black/35">
                    Daily spend limit
                </p>

                <input
                    type="number"
                    min="1"
                    value={limit}
                    onChange={(e) => setLimit(e.target.value)}
                    className="mt-3 h-11 w-full rounded-xl border border-[#D8E3F0] px-3 outline-none focus:border-[#2458E8]"
                />

                <button
                    type="button"
                    onClick={() => void saveLimit()}
                    disabled={savingLimit}
                    className="mt-3 flex h-10 w-full items-center justify-center rounded-xl bg-[#2458E8] font-bold text-white disabled:opacity-60"
                >
                    {savingLimit ? (
                        <Loader2
                            size={16}
                            className="animate-spin"
                        />
                    ) : (
                        "Save limit"
                    )}
                </button>
            </div>
              </div>
            </section>

            <section className="mt-5 rounded-[28px] bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#ECFDF3] text-[#2E8B57]">
                  <Wallet size={20} />
                </span>

                <div>
                  <h3 className="font-black">
                    Linked account
                  </h3>

                  <p className="text-xs text-black/45">
                    Account used by this card.
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-[18px] bg-[#F7FAFC] p-4">
                <p className="font-bold">
                  {card.account_name || "ZentraBank account"}
                </p>

                <p className="mt-1 text-sm text-black/45">
                  {card.account_number}
                </p>

                <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-black/35">
                  Currency
                </p>

                <p className="mt-1 font-black text-[#2458E8]">
                  {card.currency}
                </p>
              </div>
            </section>

            <section className="mt-5 rounded-[28px] bg-white p-5 shadow-sm">
              <h3 className="font-black">
                Card controls
              </h3>

              <p className="mt-1 text-xs leading-5 text-black/45">
                Freeze your card temporarily and unfreeze it whenever
                you are ready to use it again.
              </p>

              {["active", "frozen"].includes(card.status) ? (
                <button
                  type="button"
                  onClick={() => void toggle()}
                  disabled={busy}
                  className={`mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-[16px] font-bold text-white disabled:opacity-60 ${
                    card.status === "active"
                      ? "bg-[#2458E8]"
                      : "bg-[#2E8B57]"
                  }`}
                >
                  {busy ? (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  ) : card.status === "active" ? (
                    <Snowflake size={17} />
                  ) : (
                    <Sun size={17} />
                  )}

                  {card.status === "active"
                    ? "Freeze card"
                    : "Unfreeze card"}
                </button>
              ) : (
                <div className="mt-5 rounded-[16px] bg-[#F3F4F6] px-4 py-3 text-center text-sm font-semibold text-black/50">
                  Card controls are unavailable while this card is{" "}
                  <span className="capitalize">
                    {card.status}
                  </span>
                  .
                </div>
              )}
            </section>
          </>
        ) : (
          <section className="mt-8 rounded-[28px] bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-black/50">
              Card not found.
            </p>

            <Link
              href="/cards/active-cards"
              className="mt-5 block font-bold text-[#2458E8]"
            >
              Return to my cards
            </Link>
          </section>
        )}
      </section>
    </main>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[16px] bg-[#F7FAFC] px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-black/35">
        {label}
      </p>

      <p className="mt-1 text-sm font-black capitalize">
        {value}
      </p>
    </div>
  );
}

function formatMoney(
  amount: string | number,
  currency: string,
) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);
}