"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { EDITED_TRANSACTION_KEY } from "@/app/dashboard/transfer/edit/page";

type EditedTransaction = {
  id: string;
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

const Row = ({ label, value }: { label: string; value: string }) => {
  if (!value) return null;

  return (
    <div className="flex items-center justify-between border-b border-white/10 py-2 last:border-none">
      <span className="text-[12px] text-white/50">{label}</span>
      <span className="max-w-[60%] truncate text-right text-[13px] font-semibold text-white">
        {value}
      </span>
    </div>
  );
};

export default function TransactionPage() {
  const [transaction, setTransaction] = useState<EditedTransaction | null>(
    null
  );
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem(EDITED_TRANSACTION_KEY);
    if (raw) {
      try {
        setTransaction(JSON.parse(raw));
      } catch {
        setTransaction(null);
      }
    }
    setLoaded(true);
  }, []);

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
      <section className="mx-auto min-h-[100svh] w-full max-w-[430px] px-[14px] pb-10 pt-4">
        <div className="relative flex items-center justify-center">
          <Link
            href="/dashboard/transfer"
            className="absolute left-0 inline-flex text-white"
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-[13px] font-bold">Transaction</h1>
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
            <div className="mt-6 flex flex-col items-center">
              <div className="flex h-[56px] w-[56px] items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
                <CheckCircle2 size={30} />
              </div>
              <p className="mt-3 text-[15px] font-bold">
                {transaction.amountDisplay}
              </p>
              <p className="mt-1 text-[12px] text-white/50">
                Transaction updated successfully
              </p>
            </div>

            <div className="mt-6 rounded-[10px] bg-[#111] p-4">
              <Row label="Bank" value={transaction.bank} />
              <Row label={transaction.contactLabel} value={transaction.contactName} />
              <Row label="Amount" value={transaction.amountDisplay} />
              <Row label="Status" value={transaction.transactionStatus} />
              <Row label="Account status" value={transaction.accountStatus} />
              <Row label="Transaction type" value={transaction.transactionType} />
              <Row label="Date" value={date} />
              <Row label="Time" value={time} />
              <Row label="Fee" value={transaction.fee} />
              <Row label="Transaction ID" value={transaction.transactionId} />
              <Row label="Authorization code" value={transaction.authorizationCode} />
              <Row label="Bank address" value={transaction.bankAddress} />
            </div>

            <div className="mt-6 flex justify-center">
              <Link
                href="/dashboard/transfer"
                className="inline-flex h-[44px] w-[220px] items-center justify-center rounded-[10px] bg-[linear-gradient(180deg,#d71919,#9f0505)] text-[13px] font-semibold text-white"
              >
                Back to Transfer History
              </Link>
            </div>
          </>
        )}
      </section>
    </main>
  );
}