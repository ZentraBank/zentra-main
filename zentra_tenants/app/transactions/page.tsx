"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import AppShell from "@/components/layout/AppShell";

import {
  getApiErrorMessage,
} from "@/lib/api";

import {
  getTenantAccountActivity,
  type TenantAccountActivity,
} from "@/services/banking.service";

import {
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Search,
} from "lucide-react";

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

type TransactionFilter =
  | "all"
  | "credit"
  | "debit";

/*
|--------------------------------------------------------------------------
| Currency
|--------------------------------------------------------------------------
*/

const money = (
  value: string | number,
  currency: string,
) =>
  new Intl.NumberFormat(
    "en-GB",
    {
      style: "currency",
      currency,
    },
  ).format(
    Number(value || 0),
  );

/*
|--------------------------------------------------------------------------
| Page
|--------------------------------------------------------------------------
*/

export default function TransactionsPage() {
  const [
    transactions,
    setTransactions,
  ] =
    useState<
      TenantAccountActivity[]
    >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    typeFilter,
    setTypeFilter,
  ] =
    useState<TransactionFilter>(
      "all",
    );

  /*
  |--------------------------------------------------------------------------
  | Load
  |--------------------------------------------------------------------------
  */

  const load =
    useCallback(
      async () => {
        setLoading(true);
        setError("");

        try {
          const result =
            await getTenantAccountActivity(
              {
                page: 1,
                pageSize: 100,
              },
            );

          setTransactions(
            result,
          );
        } catch (
          requestError
        ) {
          setTransactions(
            [],
          );

          setError(
            getApiErrorMessage(
              requestError,
            ),
          );
        } finally {
          setLoading(false);
        }
      },
      [],
    );

  useEffect(() => {
    void load();
  }, [load]);

  /*
  |--------------------------------------------------------------------------
  | Filtering
  |--------------------------------------------------------------------------
  */

  const filtered =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return transactions.filter(
        (tx) => {
          const matchesType =
            typeFilter ===
              "all" ||
            tx.entry_type ===
              typeFilter;

          const values = [
            tx.client_name,
            tx.client_email,
            tx.account_number,
            tx.account_name,
            tx.account_type,
            tx.description,
            tx.transfer_id,
          ];

          const matchesSearch =
            !query ||
            values
              .filter(Boolean)
              .some(
                (
                  value,
                ) =>
                  String(
                    value,
                  )
                    .toLowerCase()
                    .includes(
                      query,
                    ),
              );

          return (
            matchesType &&
            matchesSearch
          );
        },
      );
    }, [
      search,
      transactions,
      typeFilter,
    ]);

  /*
  |--------------------------------------------------------------------------
  | Totals
  |--------------------------------------------------------------------------
  */

  const summary =
    useMemo(() => {
      const creditByCurrency =
        new Map<
          string,
          number
        >();

      const debitByCurrency =
        new Map<
          string,
          number
        >();

      let creditCount = 0;
      let debitCount = 0;

      for (
        const tx of
        transactions
      ) {
        const amount =
          Number(
            tx.amount || 0,
          );

        const currency =
          tx.currency ||
          "NGN";

        if (
          tx.entry_type ===
          "credit"
        ) {
          creditCount += 1;

          creditByCurrency.set(
            currency,
            (
              creditByCurrency.get(
                currency,
              ) ?? 0
            ) + amount,
          );
        } else {
          debitCount += 1;

          debitByCurrency.set(
            currency,
            (
              debitByCurrency.get(
                currency,
              ) ?? 0
            ) + amount,
          );
        }
      }

      return {
        total:
          transactions.length,

        creditCount,

        debitCount,

        credits:
          Array.from(
            creditByCurrency.entries(),
          ),

        debits:
          Array.from(
            debitByCurrency.entries(),
          ),
      };
    }, [transactions]);

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <AppShell>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Transactions
          </h1>

          <p className="text-sm text-white/70">
            Track credits,
            debits and
            transfers across
            your tenant clients.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            void load()
          }
          disabled={loading}
          className="rounded-xl border border-white/20 bg-black/30 p-3 text-white disabled:opacity-50"
          aria-label="Refresh transactions"
        >
          <RefreshCw
            size={18}
            className={
              loading
                ? "animate-spin"
                : ""
            }
          />
        </button>
      </div>

      {/* Summary */}

      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <SummaryCard
          label="Total transactions"
          value={String(
            summary.total,
          )}
        />

        <SummaryCard
          label="Credits"
          value={
            summary.credits.length
              ? summary.credits
                  .map(
                    ([
                      currency,
                      total,
                    ]) =>
                      money(
                        total,
                        currency,
                      ),
                  )
                  .join(
                    " · ",
                  )
              : "—"
          }
          secondary={`${summary.creditCount} transaction${
            summary.creditCount ===
            1
              ? ""
              : "s"
          }`}
        />

        <SummaryCard
          label="Debits"
          value={
            summary.debits.length
              ? summary.debits
                  .map(
                    ([
                      currency,
                      total,
                    ]) =>
                      money(
                        total,
                        currency,
                      ),
                  )
                  .join(
                    " · ",
                  )
              : "—"
          }
          secondary={`${summary.debitCount} transaction${
            summary.debitCount ===
            1
              ? ""
              : "s"
          }`}
        />
      </div>

      {/* Search / filter */}

      <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-3 py-2 md:w-96">
          <Search
            size={17}
            className="text-gray-400"
          />

          <input
            value={search}
            onChange={(
              event,
            ) =>
              setSearch(
                event.target
                  .value,
              )
            }
            placeholder="Search client, account or description"
            className="w-full text-sm outline-none"
          />
        </div>

        <select
          value={
            typeFilter
          }
          onChange={(
            event,
          ) =>
            setTypeFilter(
              event.target
                .value as TransactionFilter,
            )
          }
          className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 outline-none"
        >
          <option value="all">
            All transactions
          </option>

          <option value="credit">
            Credits
          </option>

          <option value="debit">
            Debits
          </option>
        </select>
      </div>

      {/* Error */}

      {error ? (
        <div className="mb-5 rounded-2xl bg-red-950/80 p-4 text-red-100">
          {error}
        </div>
      ) : null}

      {/* Transactions */}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex min-h-44 items-center justify-center text-gray-600">
            <RefreshCw className="mr-3 animate-spin" />

            Loading
            transactions…
          </div>
        ) : filtered.length ===
          0 ? (
          <div className="p-8 text-center text-gray-500">
            No transactions
            match your current
            filters.
          </div>
        ) : (
          filtered.map(
            (tx) => (
              <TransactionRow
                key={tx.id}
                transaction={
                  tx
                }
              />
            ),
          )
        )}
      </div>
    </AppShell>
  );
}

/*
|--------------------------------------------------------------------------
| Transaction row
|--------------------------------------------------------------------------
*/

function TransactionRow({
  transaction: tx,
}: {
  transaction:
    TenantAccountActivity;
}) {
  const isCredit =
    tx.entry_type ===
    "credit";

  const content = (
    <div className="flex items-center justify-between gap-4 p-4">
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            isCredit
              ? "bg-emerald-50 text-emerald-600"
              : "bg-red-50 text-red-600"
          }`}
        >
          {isCredit ? (
            <ArrowDownLeft
              size={20}
            />
          ) : (
            <ArrowUpRight
              size={20}
            />
          )}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate font-semibold text-gray-900">
              {tx.client_name ||
                "Unknown client"}
            </p>

            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                isCredit
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {
                tx.entry_type
              }
            </span>

            {!tx.transfer_id ? (
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-700">
                Adjustment
              </span>
            ) : (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase text-gray-600">
                Transfer
              </span>
            )}
          </div>

          <p className="mt-0.5 truncate text-xs text-gray-500">
            {tx.client_email ||
              "—"}
          </p>

          <p className="mt-1 truncate text-xs text-gray-400">
            {
              tx.account_name
            }
            {" · "}
            {
              tx.account_number
            }
          </p>

          {tx.description ? (
            <p className="mt-1 truncate text-xs text-gray-500">
              {
                tx.description
              }
            </p>
          ) : null}

          <p className="mt-1 text-[11px] text-gray-400">
            {new Date(
              tx.created_at,
            ).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <p
          className={`font-bold ${
            isCredit
              ? "text-emerald-600"
              : "text-red-600"
          }`}
        >
          {isCredit
            ? "+"
            : "-"}
          {money(
            tx.amount,
            tx.currency,
          )}
        </p>

        <p className="mt-1 text-xs text-gray-500">
          Balance:{" "}
          {money(
            tx.balance_after,
            tx.currency,
          )}
        </p>

        <p className="mt-1 text-[11px] capitalize text-gray-400">
          Completed
        </p>
      </div>
    </div>
  );

  /*
   * Transfer ledger entries have
   * an actual transfer record.
   *
   * Admin credit/debit adjustments
   * have transfer_id = null, so
   * don't send them to the transfer
   * details page.
   */

  if (tx.transfer_id) {
    return (
      <Link
        href={`/transactions/${tx.transfer_id}`}
        className="block border-b border-gray-100 transition hover:bg-gray-50 last:border-b-0"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      {content}
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Summary
|--------------------------------------------------------------------------
*/

function SummaryCard({
  label,
  value,
  secondary,
}: {
  label: string;
  value: string;
  secondary?: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">
        {label}
      </p>

      <h2 className="mt-2 break-words text-2xl font-bold text-gray-900">
        {value}
      </h2>

      {secondary ? (
        <p className="mt-1 text-xs text-gray-400">
          {secondary}
        </p>
      ) : null}
    </div>
  );
}