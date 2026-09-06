"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  History,
  Loader2,
} from "lucide-react";

import { ApiError } from "@/src/lib/api-error";
import { platformAuditService } from "@/src/services/platform-audit.service";
import type {
  PlatformAuditLog,
} from "@/src/types/platform-operations";

export function AuditLogList() {
  const [rows, setRows] =
    useState<PlatformAuditLog[]>([]);
  const [error, setError] =
    useState<string | null>(null);
  const [isLoading, setIsLoading] =
    useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response =
          await platformAuditService.list({
            limit: 100,
          });

        setRows(response.data);
      } catch (caught) {
        setError(
          caught instanceof ApiError
            ? caught.message
            : "Unable to load audit logs."
        );
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-neutral-500">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          Loading audit logs…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 shadow-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6 text-neutral-900">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900">
            System Audit Trail
          </h2>
          <p className="text-sm text-neutral-500">
            Chronological record of platform activities, security events, and modifications.
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700">
          <History size={14} className="text-neutral-500" />
          {rows.length} entries recorded
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr className="text-left text-xs font-semibold uppercase tracking-wider text-neutral-600">
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Entity</th>
                <th className="px-6 py-4">Tenant</th>
                <th className="px-6 py-4">Time</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-200 bg-white">
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-sm font-medium text-neutral-500"
                  >
                    No audit logs found.
                  </td>
                </tr>
              ) : (
                rows.map((log) => (
                  <tr
                    key={log.id}
                    className="transition hover:bg-neutral-50"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-neutral-900">
                        {log.action}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {log.actor_email ||
                          log.actor_platform_user_id ||
                          "System"}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-mono font-medium text-neutral-700">
                        {log.entity_type}
                      </span>
                      <p className="mt-1 text-xs font-mono text-neutral-400">
                        {log.entity_id || "—"}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-neutral-700">
                      {log.tenant_id ? (
                        <span className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md border border-blue-100">
                          {log.tenant_id}
                        </span>
                      ) : (
                        <span className="text-neutral-500">Platform</span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {new Date(
                        log.created_at
                      ).toLocaleString("en-GB")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}