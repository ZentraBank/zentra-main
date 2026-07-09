/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowLeftRight,
  SquarePen,
  MoveDownLeft,
  MoveUpRight,
  RefreshCw,
} from "lucide-react";
import { EDITED_TRANSACTION_KEY } from "@/app/dashboard/transfer/edit/page";

type Transfer = {
  id: number;
  type: "in" | "out";
  title: string;
  bank: string;
  amount: string;
};

const API_URL = "/api/transfers";

const fallbackTransfers: Transfer[] = [
  {
    id: 1,
    type: "in",
    title: "Transfer from Mar Parkersbur",
    bank: "ZentraBank",
    amount: "-$17,000,000",
  },
  {
    id: 2,
    type: "out",
    title: "Transfer to Mark Parkersburg",
    bank: "ZentraBank",
    amount: "-$100,000",
  },
  {
    id: 3,
    type: "in",
    title: "Butcher Maxwell has insured ...",
    bank: "ZentraBank",
    amount: "-$150,000",
  },
  {
    id: 4,
    type: "out",
    title: "Butcher Maxwell has insured ...",
    bank: "ZentraBank",
    amount: "-$13,000,000",
  },
  {
    id: 5,
    type: "in",
    title: "Butcher Maxwell has insured ...",
    bank: "ZentraBank",
    amount: "-$100,000",
  },
  {
    id: 6,
    type: "in",
    title: "Butcher Maxwell has insured ...",
    bank: "ZentraBank",
    amount: "-$1,000,000",
  },
];

export default function TransferPage() {
  const router = useRouter();

  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTransfers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(API_URL, {
        method: "GET",
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch transfers");
      }

      const data = (await res.json()) as Transfer[];

      setTransfers(Array.isArray(data) ? data : []);
    } catch {
      setTransfers(fallbackTransfers);
      setError("Backend not connected yet. Showing demo transfer records.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  useEffect(() => {
    const raw = sessionStorage.getItem(EDITED_TRANSACTION_KEY);
    if (!raw) return;

    try {
      const edited = JSON.parse(raw) as {
        id: string;
        title?: string;
        bank?: string;
        amountDisplay?: string;
        type?: "in" | "out";
      };

      const editedId = Number(edited.id);
      if (!editedId) return;

      setTransfers((prev) =>
        prev.map((item) =>
          item.id === editedId
            ? {
                ...item,
                title: edited.title ?? item.title,
                bank: edited.bank ?? item.bank,
                amount: edited.amountDisplay ?? item.amount,
                type: edited.type ?? item.type,
              }
            : item
        )
      );
    } catch {
      // Ignore invalid session data.
    }
  }, []);

  const goToEdit = (item: Transfer) => {
    const params = new URLSearchParams({
      id: String(item.id),
      title: item.title,
      bank: item.bank,
      amount: item.amount,
      type: item.type,
    });

    router.push(`/dashboard/transfer/edit?${params.toString()}`);
  };

  return (
    <main className="min-h-[100svh] bg-black text-white">
      <section className="mx-auto min-h-[100svh] w-full max-w-[430px] px-[14px] pb-10 pt-4 md:max-w-none md:px-10 md:py-8 lg:px-16">
        <div className="mx-auto w-full max-w-[1180px]">
          <div className="relative flex items-center justify-center md:justify-between">
            <Link
              href="/dashboard"
              className="absolute left-0 inline-flex text-white md:static md:h-11 md:w-11 md:items-center md:justify-center md:rounded-full md:bg-white/10 md:backdrop-blur"
              aria-label="Go back"
            >
              <ArrowLeft size={18} />
            </Link>

            <div className="md:flex-1 md:text-center">
              <h1 className="text-[13px] font-bold md:text-[28px] md:font-black">
                Transfer
              </h1>
              <p className="mt-1 hidden text-sm text-white/55 md:block">
                Manage Gregory Winter transfer records
              </p>
            </div>

            <button
              type="button"
              onClick={fetchTransfers}
              className="hidden h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 md:flex"
              aria-label="Refresh transfers"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          <div className="md:mt-10 md:grid md:grid-cols-[340px_1fr] md:gap-8">
            <div className="mt-6 flex justify-center md:mt-0 md:block">
              <Link
                href="/dashboard/transfer/edit"
                className="flex h-[92px] w-[220px] flex-col items-center justify-center gap-2 rounded-[10px] bg-[linear-gradient(180deg,#d71919,#9f0505)] shadow-[0_8px_18px_rgba(160,0,0,0.45)] transition-transform active:scale-[0.98] md:h-[260px] md:w-full md:rounded-[28px] md:shadow-[0_24px_60px_rgba(160,0,0,0.4)] md:hover:scale-[1.015]"
              >
                <div className="flex h-[44px] w-[44px] items-center justify-center rounded-[8px] bg-white text-emerald-600 md:h-[86px] md:w-[86px] md:rounded-[22px]">
                  <ArrowLeftRight
                    size={22}
                    strokeWidth={2.4}
                    className="md:h-10 md:w-10"
                  />
                </div>

                <span className="text-[12px] font-semibold text-white md:text-[22px] md:font-black">
                  New Transfer
                </span>

                <p className="hidden max-w-[220px] text-center text-sm text-white/70 md:block">
                  Create or prepare a new client transfer record.
                </p>
              </Link>
            </div>

            <div className="md:rounded-[28px] md:border md:border-white/10 md:bg-white/[0.06] md:p-6 md:shadow-[0_20px_70px_rgba(0,0,0,0.35)] md:backdrop-blur-xl">
              <div className="mx-8 mt-4 h-px bg-white/50 md:hidden" />

              <div className="md:flex md:items-end md:justify-between">
                <div>
                  <h2 className="mt-3 text-[13px] font-bold md:mt-0 md:text-[24px] md:font-black">
                    Gregory Winter Transfer History
                  </h2>
                  <p className="hidden text-sm text-white/50 md:block">
                    Latest incoming and outgoing transfers
                  </p>
                </div>

                <div className="hidden rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white/75 md:block">
                  {transfers.length} records
                </div>
              </div>

              {error && (
                <p className="mt-4 rounded-xl bg-yellow-400/10 px-4 py-3 text-xs font-semibold text-yellow-200">
                  {error}
                </p>
              )}

              {loading ? (
                <div className="mt-6 space-y-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-[48px] animate-pulse rounded-[8px] bg-white/20 md:h-[82px] md:rounded-[20px]"
                    />
                  ))}
                </div>
              ) : transfers.length === 0 ? (
                <div className="mt-6 rounded-[20px] bg-white p-8 text-center text-black">
                  <p className="text-lg font-black">No transfers yet</p>
                  <p className="mt-1 text-sm text-black/55">
                    Create a new transfer to see it here.
                  </p>
                </div>
              ) : (
                <div className="mt-3 space-y-[9px] md:mt-6 md:space-y-4">
                  {transfers.map((item) => {
                    const incoming = item.type === "in";

                    return (
                      <div
                        key={item.id}
                        className="flex h-[48px] w-full items-center gap-2 rounded-[8px] bg-white px-2.5 text-black shadow-[0_1px_5px_rgba(255,255,255,0.15)] md:h-[82px] md:gap-4 md:rounded-[20px] md:px-5 md:shadow-[0_14px_35px_rgba(0,0,0,0.18)]"
                      >
                        <div
                          className={`flex h-[26px] w-[26px] flex-none items-center justify-center rounded-full md:h-[48px] md:w-[48px] ${
                            incoming
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-red-50 text-red-600"
                          }`}
                        >
                          {incoming ? (
                            <MoveDownLeft
                              size={15}
                              strokeWidth={2.6}
                              className="md:h-6 md:w-6"
                            />
                          ) : (
                            <MoveUpRight
                              size={15}
                              strokeWidth={2.6}
                              className="md:h-6 md:w-6"
                            />
                          )}
                        </div>

                        <div className="min-w-0 flex-1 overflow-hidden">
                          <p className="truncate text-[11px] font-medium leading-[13px] text-black/55 md:text-[15px] md:leading-5">
                            {item.title}
                          </p>
                          <p className="truncate text-[11px] font-bold leading-[13px] text-black/75 md:text-[17px] md:leading-6">
                            {item.bank}
                          </p>
                        </div>

                        <p
                          className={`flex-none truncate text-right text-[13px] font-bold md:text-[20px] ${
                            incoming ? "text-emerald-600" : "text-red-600"
                          }`}
                          style={{ maxWidth: 180 }}
                        >
                          {item.amount}
                        </p>

                        <button
                          type="button"
                          onClick={() => goToEdit(item)}
                          className="flex h-[26px] w-[22px] flex-none items-center justify-center active:scale-90 md:h-11 md:w-11 md:rounded-full md:bg-black/5 md:hover:bg-black/10"
                          aria-label="Edit transfer"
                        >
                          <SquarePen
                            size={16}
                            strokeWidth={2.3}
                            color="#000000"
                            className="md:h-5 md:w-5"
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}