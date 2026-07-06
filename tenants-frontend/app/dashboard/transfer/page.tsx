/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowLeftRight,
  SquarePen,
  MoveDownLeft,
  MoveUpRight,
} from "lucide-react";
import { EDITED_TRANSACTION_KEY } from "@/app/dashboard/transfer/edit/page";

type Transfer = {
  id: number;
  type: "in" | "out";
  title: string;
  bank: string;
  amount: string;
};

const initialTransfers: Transfer[] = [
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
  const [transfers, setTransfers] = useState<Transfer[]>(initialTransfers);
  const router = useRouter();

  // Pick up whatever was last saved on the Edit Transfer page and merge it
  // into the matching row. This is what actually makes the edit visible —
  // without this, the list only ever renders its hardcoded initial data.
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
      // Malformed or stale entry — ignore it rather than crash the list.
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
      <section className="mx-auto min-h-[100svh] w-full max-w-[430px] px-[14px] pb-10 pt-4">
        {/* Header */}
        <div className="relative flex items-center justify-center">
          <Link
            href="/dashboard"
            className="absolute left-0 inline-flex text-white"
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-[13px] font-bold">Transfer</h1>
        </div>

        {/* New transfer button */}
        <div className="mt-6 flex justify-center">
          <Link
            href="/dashboard/transfer/edit"
            className="flex h-[92px] w-[220px] flex-col items-center justify-center gap-2 rounded-[10px] bg-[linear-gradient(180deg,#d71919,#9f0505)] shadow-[0_8px_18px_rgba(160,0,0,0.45)] transition-transform active:scale-[0.98]"
          >
            <div className="flex h-[44px] w-[44px] items-center justify-center rounded-[8px] bg-white text-emerald-600">
              <ArrowLeftRight size={22} strokeWidth={2.4} />
            </div>

            <span className="text-[12px] font-semibold text-white">
              New Transfer
            </span>
          </Link>
        </div>

        <div className="mx-8 mt-4 h-px bg-white/50" />

        <h2 className="mt-3 text-[13px] font-bold">
          Gregory Winter Transfer History
        </h2>

        {/* Transfer list */}
        <div className="mt-3 space-y-[9px]">
          {transfers.map((item) => {
            const incoming = item.type === "in";

            return (
              <div
                key={item.id}
                className="flex h-[48px] w-full items-center gap-2 rounded-[8px] bg-white px-2.5 text-black shadow-[0_1px_5px_rgba(255,255,255,0.15)]"
              >
                {/* Direction icon */}
                <div
                  className={`flex h-[26px] w-[26px] flex-none items-center justify-center rounded-full ${
                    incoming
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  {incoming ? (
                    <MoveDownLeft size={15} strokeWidth={2.6} />
                  ) : (
                    <MoveUpRight size={15} strokeWidth={2.6} />
                  )}
                </div>

                {/* Title/bank */}
                <div className="min-w-0 flex-1 overflow-hidden">
                  <p className="truncate text-[11px] font-medium leading-[13px] text-black/55">
                    {item.title}
                  </p>
                  <p className="truncate text-[11px] font-bold leading-[13px] text-black/75">
                    {item.bank}
                  </p>
                </div>

                {/* Amount */}
                <p
                  className={`flex-none truncate text-right text-[13px] font-bold ${
                    incoming ? "text-emerald-600" : "text-red-600"
                  }`}
                  style={{ maxWidth: 92 }}
                >
                  {item.amount}
                </p>

                {/* Edit button — navigates to the Edit Transfer form, pre-filled */}
                <button
                  type="button"
                  onClick={() => goToEdit(item)}
                  className="flex h-[26px] w-[22px] flex-none items-center justify-center active:scale-90"
                  style={{ color: "#000000" }}
                  aria-label="Edit transfer"
                >
                  <SquarePen size={16} strokeWidth={2.3} color="#000000" />
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}