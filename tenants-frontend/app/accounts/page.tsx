"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import { getApiErrorMessage } from "@/lib/api";
import { getMyAccounts } from "@/services/banking.service";
import type { BankAccount } from "@/types/banking.types";
import { ArrowRight, RefreshCw, Wallet } from "lucide-react";

const money = (value: string | number, currency: string) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAccounts = async () => {
    setLoading(true);
    setError("");
    try {
      setAccounts(await getMyAccounts());
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAccounts();
  }, []);

  const totals = useMemo(() => {
    const grouped = new Map<string, number>();
    for (const account of accounts) {
      grouped.set(
        account.currency,
        (grouped.get(account.currency) ?? 0) + Number(account.balance || 0)
      );
    }
    return Array.from(grouped.entries());
  }, [accounts]);

  return (
    <AppShell>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Accounts</h1>
          <p className="text-sm text-white/70">View your live account balances and details.</p>
        </div>
        <button
          type="button"
          onClick={() => void loadAccounts()}
          disabled={loading}
          className="rounded-xl border border-white/20 bg-black/30 p-3 text-white disabled:opacity-50"
          aria-label="Refresh accounts"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {error ? (
        <div className="mb-5 rounded-2xl border border-red-500/40 bg-red-950/70 p-4 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      {totals.length > 0 ? (
        <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {totals.map(([currency, total]) => (
            <div key={currency} className="rounded-2xl border border-white/15 bg-black/45 p-5 text-white backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-white/55">Total {currency} balance</p>
              <p className="mt-2 text-2xl font-bold">{money(total, currency)}</p>
            </div>
          ))}
        </div>
      ) : null}

      {loading ? (
        <div className="flex min-h-48 items-center justify-center rounded-2xl border border-white/15 bg-black/45 text-white">
          <RefreshCw className="mr-3 animate-spin" size={20} /> Loading accounts…
        </div>
      ) : accounts.length === 0 ? (
        <div className="rounded-2xl border border-white/15 bg-black/45 p-8 text-center text-white">
          <Wallet className="mx-auto mb-3 text-white/60" size={34} />
          <p className="font-semibold">No account has been created for you yet.</p>
          <p className="mt-1 text-sm text-white/60">Contact your tenant administrator if you expected an account.</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {accounts.map((account) => (
            <Link
              key={account.id}
              href={`/accounts/${account.id}`}
              className="group rounded-2xl border border-white/15 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-tenant/10 text-tenant">
                  <Wallet size={24} />
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${account.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                  {account.status}
                </span>
              </div>
              <p className="mt-5 text-sm text-gray-500">Available balance</p>
              <h2 className="mt-1 text-3xl font-bold text-gray-900">{money(account.balance, account.currency)}</h2>
              <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-xs text-gray-500">Account number</p><p className="font-semibold">{account.account_number}</p></div>
                <div><p className="text-xs text-gray-500">Account type</p><p className="font-semibold capitalize">{account.account_type}</p></div>
              </div>
              <div className="mt-5 flex items-center justify-end gap-2 text-sm font-semibold text-tenant">
                View account <ArrowRight size={16} className="transition group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}
