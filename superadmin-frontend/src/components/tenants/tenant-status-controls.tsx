"use client";

import { useState } from "react";

import { ApiError } from "@/src/lib/api-error";
import { platformTenantsService } from "@/src/services/platform-tenants.service";
import type {
  TenantStatus,
} from "@/src/types/tenant";

type MutableTenantStatus =
  | "active"
  | "suspended"
  | "terminated";

const labels: Record<
  MutableTenantStatus,
  string
> = {
  active: "Activate",
  suspended: "Suspend",
  terminated: "Terminate",
};

export function TenantStatusControls({
  tenantId,
  currentStatus,
  onStatusChanged,
}: {
  tenantId: string;
  currentStatus: TenantStatus;
  onStatusChanged: (
    status: TenantStatus
  ) => void;
}) {
  const [isUpdating, setIsUpdating] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const available: MutableTenantStatus[] =
    currentStatus === "pending"
      ? [
          "active",
          "suspended",
          "terminated",
        ]
      : currentStatus === "active"
        ? ["suspended", "terminated"]
        : currentStatus === "suspended"
          ? ["active", "terminated"]
          : [];

  const updateStatus = async (
    status: MutableTenantStatus
  ) => {
    const confirmed =
      status !== "terminated" ||
      window.confirm(
        "Terminate this tenant permanently? This action cannot be reversed through the current API."
      );

    if (!confirmed) return;

    setIsUpdating(true);
    setError(null);

    try {
      const response =
        await platformTenantsService.updateStatus(
          tenantId,
          status
        );

      onStatusChanged(
        response.data.status
      );
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "Unable to update tenant status."
      );
    } finally {
      setIsUpdating(false);
    }
  };

  if (available.length === 0) {
    return (
      <p className="text-sm text-neutral-500">
        This tenant has been terminated and
        has no further status transitions.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {available.map((status) => (
          <button
            key={status}
            type="button"
            disabled={isUpdating}
            onClick={() =>
              void updateStatus(status)
            }
            className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium capitalize transition hover:bg-white/5 disabled:opacity-50"
          >
            {labels[status]}
          </button>
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
