"use client";

import {
  useEffect,
  useState,
} from "react";

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
      <p className="text-sm text-neutral-500">
        Loading audit logs…
      </p>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-red-300">
        {error}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10">
      <table className="min-w-full divide-y divide-white/10">
        <thead className="bg-white/5">
          <tr className="text-left text-xs uppercase tracking-wide text-neutral-400">
            <th className="px-5 py-4">Action</th>
            <th className="px-5 py-4">Entity</th>
            <th className="px-5 py-4">Tenant</th>
            <th className="px-5 py-4">Time</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-white/10">
          {rows.map((log) => (
            <tr key={log.id}>
              <td className="px-5 py-4">
                <p className="font-medium">
                  {log.action}
                </p>
                <p className="text-xs text-neutral-500">
                  {log.actor_email ||
                    log.actor_platform_user_id ||
                    "System"}
                </p>
              </td>

              <td className="px-5 py-4">
                <p>{log.entity_type}</p>
                <p className="text-xs text-neutral-500">
                  {log.entity_id || "—"}
                </p>
              </td>

              <td className="px-5 py-4 text-sm text-neutral-400">
                {log.tenant_id || "Platform"}
              </td>

              <td className="px-5 py-4 text-sm text-neutral-400">
                {new Date(
                  log.created_at
                ).toLocaleString("en-GB")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
