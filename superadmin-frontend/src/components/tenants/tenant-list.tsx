"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";
import Link from "next/link";

import { ApiError } from "@/src/lib/api-error";
import { platformTenantsService } from "@/src/services/platform-tenants.service";
import type {
  Tenant,
  TenantStatus,
} from "@/src/types/tenant";
import { TenantStatusBadge } from "./tenant-status-badge";

const formatter =
  new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
  });

export function TenantList() {
  const [tenants, setTenants] =
    useState<Tenant[]>([]);

  const [search, setSearch] = useState("");
  const [status, setStatus] =
    useState<TenantStatus | "">("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] =
    useState(1);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const loadTenants = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response =
        await platformTenantsService.list({
          page,
          limit: 10,
          search: search.trim() || undefined,
          status,
        });

      setTenants(response.data);
      setTotalPages(
        response.meta?.totalPages || 1
      );
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "Unable to load tenants."
      );
    } finally {
      setIsLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadTenants();
    }, 250);

    return () => window.clearTimeout(timer);
  }, [loadTenants]);

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:flex-row">
        <input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Search tenant name, code, or app"
          className="h-11 flex-1 rounded-xl border border-white/10 bg-black/20 px-4 text-sm outline-none focus:border-white/30"
        />

        <select
          value={status}
          onChange={(event) => {
            setStatus(
              event.target.value as TenantStatus | ""
            );
            setPage(1);
          }}
          className="h-11 rounded-xl border border-white/10 bg-neutral-900 !text-white focus:border-white/30 px-4 text-sm outline-none"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="suspended">
            Suspended
          </option>
          <option value="terminated">
            Terminated
          </option>
        </select>
      </div>

      {error && (
        <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-white/10">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-white/5">
              <tr className="text-left text-xs uppercase tracking-wide text-neutral-400">
                <th className="px-5 py-4">
                  Tenant
                </th>
                <th className="px-5 py-4">
                  Code
                </th>
                <th className="px-5 py-4">
                  Status
                </th>
                <th className="px-5 py-4">
                  Created
                </th>
                <th className="px-5 py-4 text-right">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-sm text-neutral-500"
                  >
                    Loading tenants…
                  </td>
                </tr>
              ) : tenants.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-sm text-neutral-500"
                  >
                    No tenants found.
                  </td>
                </tr>
              ) : (
                tenants.map((tenant) => (
                  <tr
                    key={tenant.id}
                    className="bg-black/10"
                  >
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-medium">
                          {tenant.name}
                        </p>
                        <p className="mt-1 text-xs text-neutral-500">
                          {tenant.app_name}
                        </p>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-neutral-300">
                      {tenant.code}
                    </td>

                    <td className="px-5 py-4">
                      <TenantStatusBadge
                        status={tenant.status}
                      />
                    </td>

                    <td className="px-5 py-4 text-sm text-neutral-400">
                      {formatter.format(
                        new Date(
                          tenant.created_at
                        )
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/tenants/${tenant.id}`}
                        className="text-sm font-medium text-white underline-offset-4 hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
              Math.min(
                totalPages,
                value + 1
              )
            )
          }
          className="rounded-lg border border-white/10 px-4 py-2 text-sm disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </section>
  );
}
