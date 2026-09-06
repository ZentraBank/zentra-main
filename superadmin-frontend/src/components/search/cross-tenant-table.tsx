"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Search,
  Building,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";

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
    <div className="space-y-6 text-neutral-900">
      {/* Filters Section */}
      <div className="grid gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm md:grid-cols-3">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder={`Search ${type}...`}
            className="h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-10 pr-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="relative">
          <Building
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            value={tenantId}
            onChange={(event) => {
              setTenantId(event.target.value);
              setPage(1);
            }}
            placeholder="Tenant UUID"
            className="h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-10 pr-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="relative">
          <Filter
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            placeholder="Filter by status"
            className="h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-10 pr-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 shadow-sm">
          {error}
        </div>
      )}

      {/* Table Section */}
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr className="text-left text-xs font-semibold uppercase tracking-wider text-neutral-600">
                <th className="px-6 py-4">Tenant</th>
                <th className="px-6 py-4">
                  {type === "users"
                    ? "User"
                    : type === "accounts"
                      ? "Account"
                      : "Transaction"}
                </th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Details</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-200 bg-white">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-sm text-neutral-500"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Loader2
                        size={18}
                        className="animate-spin text-blue-600"
                      />
                      Loading {type}…
                    </div>
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-sm text-neutral-500 font-medium"
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
                      <tr
                        key={`${user.tenant_id}-${user.id}`}
                        className="transition hover:bg-neutral-50"
                      >
                        <td className="px-6 py-4">
                          <p className="font-semibold text-neutral-900">
                            {user.tenant_name}
                          </p>
                          <p className="text-xs font-mono text-neutral-500">
                            {user.tenant_code}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-neutral-900">
                            {user.first_name}{" "}
                            {user.last_name}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {user.email}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold capitalize text-neutral-700">
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-neutral-600 font-medium">
                          {user.user_type}
                        </td>
                      </tr>
                    );
                  }

                  if (type === "accounts") {
                    const account =
                      row as CrossTenantAccount;

                    return (
                      <tr
                        key={account.id}
                        className="transition hover:bg-neutral-50"
                      >
                        <td className="px-6 py-4">
                          <p className="font-semibold text-neutral-900">
                            {account.tenant_name}
                          </p>
                          <p className="text-xs font-mono text-neutral-500">
                            {account.tenant_code}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-mono font-medium text-neutral-900">
                            {account.account_number}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {account.email}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold capitalize text-neutral-700">
                            {account.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-neutral-900">
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
                    <tr
                      key={transaction.id}
                      className="transition hover:bg-neutral-50"
                    >
                      <td className="px-6 py-4">
                        <p className="font-semibold text-neutral-900">
                          {transaction.tenant_name}
                        </p>
                        <p className="text-xs font-mono text-neutral-500">
                          {transaction.tenant_code}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-mono font-medium text-neutral-900">
                          {transaction.reference}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {transaction.transaction_type}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold capitalize text-neutral-700">
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-neutral-900">
                          {money(
                            transaction.amount,
                            transaction.currency
                          )}
                        </p>
                        <p className="text-xs text-neutral-500 truncate max-w-[200px]">
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
      </div>

      {/* Pagination Section */}
      <div className="flex items-center justify-between px-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() =>
            setPage((value) =>
              Math.max(1, value - 1)
            )
          }
          className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={16} />
          Previous
        </button>

        <p className="text-sm font-medium text-neutral-600">
          Page <span className="text-neutral-900">{page}</span> of{" "}
          <span className="text-neutral-900">{totalPages}</span>
        </p>

        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() =>
            setPage((value) =>
              Math.min(totalPages, value + 1)
            )
          }
          className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}