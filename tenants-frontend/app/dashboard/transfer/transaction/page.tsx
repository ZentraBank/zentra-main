"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, RefreshCw } from "lucide-react";
import {
  EDITED_TRANSACTION_KEY,
  TRANSFER_OVERRIDES_KEY,
} from "@/app/dashboard/transfer/edit/page";

type TransactionType = "in" | "out";

type EditedTransaction = {
  id: string;
  type?: TransactionType;
  title?: string;
  bank: string;
  amountDisplay: string;
  transactionStatus: string;
  accountStatus: string;
  transactionType: string;
  contactLabel: string;
  contactName: string;
  dateDay: string;
  dateMonth: string;
  dateYear: string;
  timeHour: string;
  timeMinute: string;
  timeSecond: string;
  fee: string;
  transactionId: string;
  authorizationCode: string;
  bankAddress: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_TRANSACTIONS_API_URL || "/api/transactions";

const emptyTransaction: EditedTransaction = {
  id: "",
  type: "in",
  title: "",
  bank: "",
  amountDisplay: "",
  transactionStatus: "",
  accountStatus: "",
  transactionType: "",
  contactLabel: "Recipient",
  contactName: "",
  dateDay: "",
  dateMonth: "",
  dateYear: "",
  timeHour: "",
  timeMinute: "",
  timeSecond: "",
  fee: "",
  transactionId: "",
  authorizationCode: "",
  bankAddress: "",
};

const Row = ({ label, value }: { label: string; value?: string }) => {
  if (!value) return null;

  return (
    <div className="flex items-center justify-between border-b border-white/10 py-2 last:border-none md:py-4">
      <span className="text-[12px] text-white/50 md:text-[14px]">{label}</span>
      <span className="max-w-[60%] truncate text-right text-[13px] font-semibold text-white md:text-[15px]">
        {value}
      </span>
    </div>
  );
};

function saveTransferOverride(transaction: EditedTransaction) {
  if (!transaction.id) return;

  try {
    const existing = JSON.parse(
      localStorage.getItem(TRANSFER_OVERRIDES_KEY) || "{}"
    );

    localStorage.setItem(
      TRANSFER_OVERRIDES_KEY,
      JSON.stringify({
        ...existing,
        [transaction.id]: transaction,
      })
    );
  } catch {
    localStorage.setItem(
      TRANSFER_OVERRIDES_KEY,
      JSON.stringify({
        [transaction.id]: transaction,
      })
    );
  }
}

function normaliseTransaction(data: Partial<EditedTransaction>) {
  return {
    ...emptyTransaction,
    ...data,
    id: String(data.id || ""),
    type: data.type === "out" ? "out" : "in",
    contactLabel: data.contactLabel || "Recipient",
  };
}

export default function TransactionPage() {
  const [transaction, setTransaction] = useState<EditedTransaction | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [loadingApi, setLoadingApi] = useState(false);
  const [error, setError] = useState("");

  const fetchTransaction = useCallback(async (id: string) => {
    if (!id) return;

    setLoadingApi(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "GET",
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Transaction request failed");
      }

      const data = await response.json();

      const liveTransaction = normaliseTransaction(
        data?.transaction ? data.transaction : data
      );

      setTransaction(liveTransaction);
      saveTransferOverride(liveTransaction);
    } catch {
      setError("Backend not connected yet. Showing saved transaction details.");
    } finally {
      setLoadingApi(false);
    }
  }, []);

  useEffect(() => {
    const raw = sessionStorage.getItem(EDITED_TRANSACTION_KEY);

    if (!raw) {
      setLoaded(true);
      return;
    }

    try {
      const edited = normaliseTransaction(JSON.parse(raw));

      setTransaction(edited);
      saveTransferOverride(edited);

      fetchTransaction(edited.id);
    } catch {
      setTransaction(null);
    } finally {
      setLoaded(true);
    }
  }, [fetchTransaction]);

  const date = transaction
    ? [transaction.dateDay, transaction.dateMonth, transaction.dateYear]
        .filter(Boolean)
        .join(" ")
    : "";

  const time = transaction
    ? [transaction.timeHour, transaction.timeMinute, transaction.timeSecond]
        .filter(Boolean)
        .join(":")
    : "";

  return (
    <main className="min-h-[100svh] bg-black text-white">
      <section className="mx-auto min-h-[100svh] w-full max-w-[430px] px-[14px] pb-10 pt-4 md:max-w-none md:px-10 md:py-8 lg:px-16">
        <div className="mx-auto w-full max-w-[900px]">
          <div className="relative flex items-center justify-center md:justify-between">
            <Link
              href="/dashboard/transfer"
              className="absolute left-0 inline-flex text-white md:static md:h-11 md:w-11 md:items-center md:justify-center md:rounded-full md:bg-white/10"
              aria-label="Go back"
            >
              <ArrowLeft size={18} />
            </Link>

            <div className="md:flex-1 md:text-center">
              <h1 className="text-[13px] font-bold md:text-[28px] md:font-black">
                Transaction
              </h1>
              <p className="mt-1 hidden text-sm text-white/50 md:block">
                Live transaction details and backend-ready receipt view
              </p>
            </div>

            <button
              type="button"
              disabled={!transaction?.id || loadingApi}
              onClick={() => transaction?.id && fetchTransaction(transaction.id)}
              className="hidden h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-40 md:flex"
              aria-label="Refresh transaction"
            >
              <RefreshCw
                size={18}
                className={loadingApi ? "animate-spin" : ""}
              />
            </button>
          </div>

          {!loaded ? null : !transaction ? (
            <div className="mt-16 text-center text-[13px] text-white/60">
              No transaction found. Edit a transfer first.

              <div className="mt-4">
                <Link
                  href="/dashboard/transfer"
                  className="text-[13px] font-semibold text-blue-400 underline"
                >
                  Back to Transfer History
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="mt-6 flex flex-col items-center md:mt-10">
                <div className="flex h-[56px] w-[56px] items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500 md:h-[82px] md:w-[82px]">
                  <CheckCircle2 size={30} className="md:h-11 md:w-11" />
                </div>

                <p className="mt-3 text-[15px] font-bold md:text-[30px] md:font-black">
                  {transaction.amountDisplay}
                </p>

                <p className="mt-1 text-[12px] text-white/50 md:text-[14px]">
                  Transaction updated successfully
                </p>

                {error && (
                  <p className="mt-4 rounded-xl bg-yellow-400/10 px-4 py-3 text-center text-xs font-semibold text-yellow-200">
                    {error}
                  </p>
                )}
              </div>

              <div className="mt-6 rounded-[10px] bg-[#111] p-4 md:mt-10 md:rounded-[28px] md:border md:border-white/10 md:bg-white/[0.06] md:p-8 md:shadow-[0_20px_70px_rgba(0,0,0,0.35)]">
                <Row label="Bank" value={transaction.bank} />
                <Row
                  label={transaction.contactLabel}
                  value={transaction.contactName}
                />
                <Row label="Amount" value={transaction.amountDisplay} />
                <Row label="Status" value={transaction.transactionStatus} />
                <Row label="Account status" value={transaction.accountStatus} />
                <Row
                  label="Transaction type"
                  value={transaction.transactionType}
                />
                <Row label="Date" value={date} />
                <Row label="Time" value={time} />
                <Row label="Fee" value={transaction.fee} />
                <Row label="Transaction ID" value={transaction.transactionId} />
                <Row
                  label="Authorization code"
                  value={transaction.authorizationCode}
                />
                <Row label="Bank address" value={transaction.bankAddress} />
              </div>

              <div className="mt-6 flex justify-center">
                <Link
                  href="/dashboard/transfer"
                  className="inline-flex h-[44px] w-[220px] items-center justify-center rounded-[10px] bg-[linear-gradient(180deg,#d71919,#9f0505)] text-[13px] font-semibold text-white md:h-12 md:w-[260px] md:rounded-xl md:text-[15px]"
                >
                  Back to Transfer History
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}