"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { ApiError } from "@/src/lib/api-error";
import { platformSearchService } from "@/src/services/platform-search.service";
import type {
  CrossTenantAccount,
  CrossTenantTransaction,
  CrossTenantUser,
} from "@/src/types/platform-operations";

type SearchType =
  | "users"
  | "accounts"
  | "transactions";

type Row =
  | CrossTenantUser
  | CrossTenantAccount
  | CrossTenantTransaction;

export function CrossTenantTable({
  type,
}: {
  type: SearchType;
}) {
  const [rows, setRows] = useState<Row[]>([]);
  const [search, setSearch] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] =
    useState(1);
  const [error, setError] =
    useState<string | null>(null);
  const [isLoading, setIsLoading] =
    useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const filters = {
        page,
        limit: 20,
        search: search.trim() || undefined,
        tenantId: tenantId.trim() || undefined,
        status: status.trim() || undefined,
      };

      const response =
        type === "users"
          ? await platformSearchService.users(filters)
          : type === "accounts"
            ? await platformSearchService.accounts(filters)
            : await platformSearchService.transactions(filters);

      setRows(response.data);
      setTotalPages(response.meta?.totalPages || 1);
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : `Unable to load ${type}.`
      );
    } finally {
      setIsLoading(false);
    }
  }, [page, search, status, tenantId, type]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 250);

    return () => window.clearTimeout(timer);
  }, [load]);

  const money = (
    amount: string | number,
    currency: string
  ) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(Number(amount));

  return (
    <div className="space-y-5">
      <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-3">
        <input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder={`Search ${type}`}
          className="h-11 rounded-xl border border-white/10 bg-black/20 px-4 text-sm outline-none"
        />

        <input
          value={tenantId}
          onChange={(event) => {
            setTenantId(event.target.value);
            setPage(1);
          }}
          placeholder="Tenant UUID"
          className="h-11 rounded-xl border border-white/10 bg-black/20 px-4 text-sm outline-none"
        />

        <input
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
          placeholder="Status"
          className="h-11 rounded-xl border border-white/10 bg-black/20 px-4 text-sm outline-none"
        />
      </div>

      {error && (
        <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="min-w-full divide-y divide-white/10">
          <thead className="bg-white/5">
            <tr className="text-left text-xs uppercase tracking-wide text-neutral-400">
              <th className="px-5 py-4">Tenant</th>
              <th className="px-5 py-4">
                {type === "users"
                  ? "User"
                  : type === "accounts"
                    ? "Account"
                    : "Transaction"}
              </th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Details</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/10">
            {isLoading ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-5 py-10 text-center text-sm text-neutral-500"
                >
                  Loading {type}…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-5 py-10 text-center text-sm text-neutral-500"
                >
                  No records found.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                if (type === "users") {
                  const user =
                    row as CrossTenantUser;

                  return (
                    <tr key={user.id}>
                      <td className="px-5 py-4">
                        <p className="font-medium">
                          {user.tenant_name}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {user.tenant_code}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <p>
                          {user.first_name}{" "}
                          {user.last_name}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {user.email}
                        </p>
                      </td>
                      <td className="px-5 py-4 capitalize">
                        {user.status}
                      </td>
                      <td className="px-5 py-4 text-sm text-neutral-400">
                        {user.user_type}
                      </td>
                    </tr>
                  );
                }

                if (type === "accounts") {
                  const account =
                    row as CrossTenantAccount;

                  return (
                    <tr key={account.id}>
                      <td className="px-5 py-4">
                        <p className="font-medium">
                          {account.tenant_name}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {account.tenant_code}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <p>
                          {account.account_number}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {account.email}
                        </p>
                      </td>
                      <td className="px-5 py-4 capitalize">
                        {account.status}
                      </td>
                      <td className="px-5 py-4">
                        <p>
                          {money(
                            account.balance,
                            account.currency
                          )}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {account.account_type}
                        </p>
                      </td>
                    </tr>
                  );
                }

                const transaction =
                  row as CrossTenantTransaction;

                return (
                  <tr key={transaction.id}>
                    <td className="px-5 py-4">
                      <p className="font-medium">
                        {transaction.tenant_name}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {transaction.tenant_code}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p>
                        {transaction.reference}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {transaction.transaction_type}
                      </p>
                    </td>
                    <td className="px-5 py-4 capitalize">
                      {transaction.status}
                    </td>
                    <td className="px-5 py-4">
                      <p>
                        {money(
                          transaction.amount,
                          transaction.currency
                        )}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {transaction.description ||
                          "No description"}
                      </p>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() =>
            setPage((value) =>
              Math.max(1, value - 1)
            )
          }
          className="rounded-lg border border-white/10 px-4 py-2 text-sm disabled:opacity-40"
        >
          Previous
        </button>

        <p className="text-sm text-neutral-500">
          Page {page} of {totalPages}
        </p>

        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() =>
            setPage((value) =>
              Math.min(totalPages, value + 1)
            )
          }
          className="rounded-lg border border-white/10 px-4 py-2 text-sm disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
