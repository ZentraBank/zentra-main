/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  useParams,
} from "next/navigation";

import AppShell from "@/components/layout/AppShell";

import {
  getApiErrorMessage,
} from "@/lib/api";

import {
  getTenantAccount,
  adjustTenantAccountBalance,
} from "@/services/banking.service";

import type {
  BankAccount,
} from "@/types/banking.types";

import {
  ArrowLeft,
  Minus,
  Plus,
  RefreshCw,
  Wallet,
  X,
} from "lucide-react";

type AdjustmentType =
  | "credit"
  | "debit";

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

export default function AccountDetailsPage() {
  const {
    accountId,
  } =
    useParams<{
      accountId: string;
    }>();

  const [
    account,
    setAccount,
  ] =
    useState<BankAccount | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    success,
    setSuccess,
  ] =
    useState("");

  const [
    adjustmentType,
    setAdjustmentType,
  ] =
    useState<AdjustmentType | null>(
      null,
    );

  const [
    amount,
    setAmount,
  ] =
    useState("");

  const [
    description,
    setDescription,
  ] =
    useState("");

  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);

  const loadAccount =
    useCallback(
      async () => {
        setLoading(true);
        setError("");

        try {
          const result =
            await getTenantAccount(
              accountId,
            );

          setAccount(
            result,
          );
        } catch (
          requestError
        ) {
          setError(
            getApiErrorMessage(
              requestError,
            ),
          );
        } finally {
          setLoading(
            false,
          );
        }
      },
      [accountId],
    );

  useEffect(() => {
    void loadAccount();
  }, [loadAccount]);

  const openAdjustment = (
    type: AdjustmentType,
  ) => {
    setAdjustmentType(
      type,
    );

    setAmount("");
    setDescription("");
    setError("");
    setSuccess("");
  };

  const closeAdjustment =
    () => {
      if (submitting) {
        return;
      }

      setAdjustmentType(
        null,
      );

      setAmount("");
      setDescription("");
    };

  const submitAdjustment =
    async () => {
      if (
        !account ||
        !adjustmentType
      ) {
        return;
      }

      const numericAmount =
        Number(amount);

      if (
        !Number.isFinite(
          numericAmount,
        ) ||
        numericAmount <= 0
      ) {
        setError(
          "Enter a valid amount greater than zero.",
        );

        return;
      }

      setSubmitting(true);
      setError("");
      setSuccess("");

      try {
        const updated =
          await adjustTenantAccountBalance(
            account.id,
            {
              type:
                adjustmentType,

              amount:
                numericAmount,

              description:
                description.trim() ||
                undefined,
            },
          );

        setAccount(
          updated,
        );

        setSuccess(
          adjustmentType ===
            "credit"
            ? "Account credited successfully."
            : "Account debited successfully.",
        );

        setAdjustmentType(
          null,
        );

        setAmount("");
        setDescription("");
      } catch (
        requestError
      ) {
        setError(
          getApiErrorMessage(
            requestError,
          ),
        );
      } finally {
        setSubmitting(
          false,
        );
      }
    };

  return (
    <AppShell>
      <div className="mb-5 flex items-center justify-between gap-4">
        <Link
          href="/accounts"
          className="inline-flex items-center gap-2 text-sm font-semibold text-white"
        >
          <ArrowLeft
            size={17}
          />
          Back to accounts
        </Link>

        <button
          type="button"
          onClick={() =>
            void loadAccount()
          }
          disabled={
            loading
          }
          className="rounded-xl border border-white/20 bg-black/30 p-3 text-white disabled:opacity-50"
          aria-label="Refresh account"
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

      {error &&
      !adjustmentType ? (
        <div className="mb-5 rounded-2xl bg-red-950/80 p-4 text-red-100">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
          {success}
        </div>
      ) : null}

      {loading ? (
        <div className="flex min-h-48 items-center justify-center rounded-2xl bg-black/45 text-white">
          <RefreshCw
            className="mr-3 animate-spin"
          />
          Loading account…
        </div>
      ) : !account ? (
        <div className="rounded-2xl bg-black/45 p-6 text-center text-white">
          Account not found.
        </div>
      ) : (
        <div className="mx-auto max-w-3xl rounded-3xl border border-white/15 bg-white p-6 shadow-xl md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-tenant/10 text-tenant">
              <Wallet
                size={28}
              />
            </div>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                account.status ===
                "active"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {account.status}
            </span>
          </div>

          <p className="mt-7 text-sm text-gray-500">
            Available balance
          </p>

          <h1 className="mt-1 text-4xl font-black text-gray-900">
            {money(
              account.balance,
              account.currency,
            )}
          </h1>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() =>
                openAdjustment(
                  "credit",
                )
              }
              disabled={
                account.status ===
                "closed"
              }
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus
                size={18}
              />
              Credit account
            </button>

            <button
              type="button"
              onClick={() =>
                openAdjustment(
                  "debit",
                )
              }
              disabled={
                account.status ===
                "closed"
              }
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Minus
                size={18}
              />
              Debit account
            </button>
          </div>

          <div className="mt-8 grid gap-5 rounded-2xl bg-gray-50 p-5 sm:grid-cols-2">
            <Detail
              label="Client"
              value={
                account.client_name ||
                "—"
              }
            />

            <Detail
              label="Client email"
              value={
                account.client_email ||
                "—"
              }
              capitalize={
                false
              }
            />

            <Detail
              label="Account name"
              value={
                account.account_name
              }
            />

            <Detail
              label="Account number"
              value={
                account.account_number
              }
              capitalize={
                false
              }
            />

            <Detail
              label="Account type"
              value={
                account.account_type
              }
            />

            <Detail
              label="Currency"
              value={
                account.currency
              }
              capitalize={
                false
              }
            />
          </div>
        </div>
      )}

      {adjustmentType &&
      account ? (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 px-5 backdrop-blur-sm">
          <section className="relative w-full max-w-[420px] rounded-3xl bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={
                closeAdjustment
              }
              disabled={
                submitting
              }
              className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-gray-100 text-gray-700 disabled:opacity-50"
              aria-label="Close"
            >
              <X
                size={18}
              />
            </button>

            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                adjustmentType ===
                "credit"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {adjustmentType ===
              "credit" ? (
                <Plus
                  size={22}
                />
              ) : (
                <Minus
                  size={22}
                />
              )}
            </div>

            <h2 className="mt-4 text-xl font-black text-gray-900">
              {adjustmentType ===
              "credit"
                ? "Credit account"
                : "Debit account"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {account.account_name}
              {" · "}
              {
                account.account_number
              }
            </p>

            <div className="mt-6">
              <label className="text-xs font-bold text-gray-600">
                Amount
              </label>

              <div className="mt-1 flex h-12 items-center rounded-xl border border-gray-200 bg-white px-3 focus-within:border-tenant">
                <span className="mr-2 text-sm font-semibold text-gray-500">
                  {
                    account.currency
                  }
                </span>

                <input
                  type="text"
                  inputMode="decimal"
                  value={
                    amount
                  }
                  onChange={(
                    event,
                  ) =>
                    setAmount(
                      event.target.value.replace(
                        /[^\d.]/g,
                        "",
                      ),
                    )
                  }
                  placeholder="0.00"
                  className="h-full flex-1 text-lg font-bold text-gray-900 outline-none"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="text-xs font-bold text-gray-600">
                Description
              </label>

              <textarea
                value={
                  description
                }
                onChange={(
                  event,
                ) =>
                  setDescription(
                    event.target.value.slice(
                      0,
                      255,
                    ),
                  )
                }
                placeholder={
                  adjustmentType ===
                  "credit"
                    ? "e.g. Initial account funding"
                    : "e.g. Administrative debit correction"
                }
                className="mt-1 min-h-[90px] w-full resize-none rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-tenant"
              />
            </div>

            {error ? (
              <div className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <button
              type="button"
              onClick={() =>
                void submitAdjustment()
              }
              disabled={
                submitting
              }
              className={`mt-6 h-12 w-full rounded-xl text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60 ${
                adjustmentType ===
                "credit"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {submitting
                ? "Processing..."
                : adjustmentType ===
                    "credit"
                  ? "Credit Account"
                  : "Debit Account"}
            </button>
          </section>
        </div>
      ) : null}
    </AppShell>
  );
}

function Detail({
  label,
  value,
  capitalize = true,
}: {
  label: string;
  value: string;
  capitalize?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-gray-500">
        {label}
      </p>

      <p
        className={`mt-1 font-semibold text-gray-900 ${
          capitalize
            ? "capitalize"
            : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}