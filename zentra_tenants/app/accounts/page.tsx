/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import { getApiErrorMessage } from "@/lib/api";
import { getTenantAccounts } from "@/services/banking.service";
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
      setAccounts(await getTenantAccounts());
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
      <div className="mx-auto max-w-7xl px-4 py-8 text-neutral-900 md:px-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Accounts</h1>
            <p className="mt-1 text-sm text-neutral-500">
              View and manage client accounts for this tenant.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadAccounts()}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-white p-3 text-neutral-700 shadow-sm transition hover:bg-neutral-50 disabled:opacity-50"
            aria-label="Refresh accounts"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {error ? (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 shadow-sm">
            {error}
          </div>
        ) : null}

        {totals.length > 0 ? (
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {totals.map(([currency, total]) => (
              <div key={currency} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-400">Total {currency} balance</p>
                <p className="mt-2 text-3xl font-extrabold text-neutral-900">{money(total, currency)}</p>
              </div>
            ))}
          </div>
        ) : null}

        {loading ? (
          <div className="flex min-h-48 items-center justify-center rounded-2xl border border-neutral-200 bg-white text-neutral-500 shadow-sm">
            <RefreshCw className="mr-3 animate-spin text-blue-600" size={20} /> Loading accounts…
          </div>
        ) : accounts.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center text-neutral-500 shadow-sm">
            <Wallet className="mx-auto mb-3 text-neutral-400" size={36} />
            <p className="font-semibold text-neutral-800">
              No client accounts have been created yet.
            </p>
            <p className="mt-1 text-sm text-neutral-500">
              Accounts created for clients under this tenant will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {accounts.map((account) => (
              <Link
                key={account.id}
                href={`/accounts/${account.id}`}
                className="group rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                    <Wallet size={24} />
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${account.status === "active" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-neutral-100 text-neutral-700 border border-neutral-200"}`}>
                    {account.status}
                  </span>
                </div>
                <div className="mt-5">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-400">
                    Client
                  </p>

                  <p className="mt-1 font-bold text-neutral-900">
                    {account.client_name || account.account_name}
                  </p>

                  {account.client_email ? (
                    <p className="mt-0.5 text-xs text-neutral-500">
                      {account.client_email}
                    </p>
                  ) : null}
                </div>
                <p className="mt-5 text-xs font-medium uppercase tracking-wider text-neutral-400">Available balance</p>
                <h2 className="mt-1 text-3xl font-extrabold text-neutral-900">{money(account.balance, account.currency)}</h2>
                <div className="mt-6 grid grid-cols-2 gap-4 text-sm border-t border-neutral-100 pt-4">
                  <div><p className="text-xs text-neutral-400 font-medium">Account number</p><p className="font-semibold font-mono text-neutral-800">{account.account_number}</p></div>
                  <div><p className="text-xs text-neutral-400 font-medium">Account type</p><p className="font-semibold capitalize text-neutral-800">{account.account_type}</p></div>
                </div>
                <div className="mt-5 flex items-center justify-end gap-2 text-sm font-semibold text-blue-600">
                  View account <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}