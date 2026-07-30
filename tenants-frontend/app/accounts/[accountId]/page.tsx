"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { getApiErrorMessage } from "@/lib/api";
import { getMyAccount } from "@/services/banking.service";
import type { BankAccount } from "@/types/banking.types";
import { ArrowLeft, ArrowRightLeft, RefreshCw, Wallet } from "lucide-react";

const money = (value: string | number, currency: string) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(Number(value || 0));

export default function AccountDetailsPage() {
  const { accountId } = useParams<{ accountId: string }>();
  const [account, setAccount] = useState<BankAccount | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyAccount(accountId).then(setAccount).catch((err) => setError(getApiErrorMessage(err)));
  }, [accountId]);

  return (
    <AppShell>
      <Link href="/accounts" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-white">
        <ArrowLeft size={17} /> Back to accounts
      </Link>
      {error ? <div className="rounded-2xl bg-red-950/80 p-4 text-red-100">{error}</div> : !account ? (
        <div className="flex min-h-48 items-center justify-center rounded-2xl bg-black/45 text-white"><RefreshCw className="mr-3 animate-spin" /> Loading account…</div>
      ) : (
        <div className="mx-auto max-w-3xl rounded-3xl border border-white/15 bg-white p-6 shadow-xl md:p-8">
          <div className="flex items-start justify-between">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-tenant/10 text-tenant"><Wallet size={28} /></div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${account.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>{account.status}</span>
          </div>
          <p className="mt-7 text-sm text-gray-500">Available balance</p>
          <h1 className="mt-1 text-4xl font-black text-gray-900">{money(account.balance, account.currency)}</h1>
          <div className="mt-8 grid gap-5 rounded-2xl bg-gray-50 p-5 sm:grid-cols-2">
            <Detail label="Account name" value={account.account_name} />
            <Detail label="Account number" value={account.account_number} />
            <Detail label="Account type" value={account.account_type} />
            <Detail label="Currency" value={account.currency} />
          </div>
          <Link href={`/dashboard/transfer?sourceAccount=${account.id}`} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-tenant px-5 py-3 font-semibold text-white">
            <ArrowRightLeft size={18} /> Make a transfer
          </Link>
        </div>
      )}
    </AppShell>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs text-gray-500">{label}</p><p className="mt-1 font-semibold capitalize text-gray-900">{value}</p></div>;
}
