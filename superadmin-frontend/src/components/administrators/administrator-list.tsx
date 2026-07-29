"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";
import Link from "next/link";

import { ApiError } from "@/src/lib/api-error";
import { platformAdminsService } from "@/src/services/platform-admins.service";
import type {
  PlatformAdministrator,
  PlatformAdministratorRole,
  PlatformAdministratorStatus,
} from "@/src/types/platform-admin";

export function AdministratorList() {
  const [rows, setRows] =
    useState<PlatformAdministrator[]>([]);
  const [search, setSearch] = useState("");
  const [role, setRole] =
    useState<PlatformAdministratorRole | "">("");
  const [status, setStatus] =
    useState<PlatformAdministratorStatus | "">("");
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
      const response =
        await platformAdminsService.list({
          page,
          limit: 10,
          search: search.trim() || undefined,
          role,
          status,
        });

      setRows(response.data);
      setTotalPages(
        response.meta?.totalPages || 1
      );
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "Unable to load administrators."
      );
    } finally {
      setIsLoading(false);
    }
  }, [page, role, search, status]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 250);

    return () => window.clearTimeout(timer);
  }, [load]);

  return (
    <div className="space-y-5">
      <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-[1fr_220px_220px]">
        <input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Search name or email"
          className="h-11 rounded-xl border border-white/10 bg-black/20 px-4 text-sm outline-none"
        />

        <select
          value={role}
          onChange={(event) => {
            setRole(
              event.target.value as
                | PlatformAdministratorRole
                | ""
            );
            setPage(1);
          }}
          className="h-11 rounded-xl border border-white/10 bg-neutral-900 px-4 text-sm"
        >
          <option value="">All roles</option>
          <option value="platform_superadmin">
            Superadmin
          </option>
          <option value="platform_support">
            Support
          </option>
          <option value="platform_auditor">
            Auditor
          </option>
        </select>

        <select
          value={status}
          onChange={(event) => {
            setStatus(
              event.target.value as
                | PlatformAdministratorStatus
                | ""
            );
            setPage(1);
          }}
          className="h-11 rounded-xl border border-white/10 bg-neutral-900 px-4 text-sm"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="suspended">
            Suspended
          </option>
          <option value="disabled">
            Disabled
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
              <tr className="text-left text-xs uppercase text-neutral-400">
                <th className="px-5 py-4">
                  Administrator
                </th>
                <th className="px-5 py-4">
                  Role
                </th>
                <th className="px-5 py-4">
                  Status
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
                    colSpan={4}
                    className="px-5 py-10 text-center text-sm text-neutral-500"
                  >
                    Loading administrators…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-10 text-center text-sm text-neutral-500"
                  >
                    No administrators found.
                  </td>
                </tr>
              ) : (
                rows.map((user) => (
                  <tr key={user.id}>
                    <td className="px-5 py-4">
                      <p className="font-medium">
                        {user.first_name}{" "}
                        {user.last_name}
                      </p>
                      <p className="mt-1 text-xs text-neutral-500">
                        {user.email}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm text-neutral-300">
                      {user.role_code
                        .replace("platform_", "")
                        .replace("_", " ")}
                    </td>

                    <td className="px-5 py-4 text-sm capitalize">
                      {user.status}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/administrators/${user.id}`}
                        className="text-sm font-medium hover:underline"
                      >
                        Manage
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
