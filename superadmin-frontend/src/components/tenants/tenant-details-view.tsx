"use client";

import {
  useEffect,
  useState,
} from "react";

import { ApiError } from "@/src/lib/api-error";
import { platformTenantsService } from "@/src/services/platform-tenants.service";
import type {
  TenantDetails,
  TenantStatus,
} from "@/src/types/tenant";
import { TenantFeatureEditor } from "./tenant-feature-editor";
import { TenantStatusBadge } from "./tenant-status-badge";
import { TenantStatusControls } from "./tenant-status-controls";

export function TenantDetailsView({
  tenantId,
}: {
  tenantId: string;
}) {
  const [details, setDetails] =
    useState<TenantDetails | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response =
          await platformTenantsService.getById(
            tenantId
          );

        setDetails(response.data);
      } catch (caught) {
        setError(
          caught instanceof ApiError
            ? caught.message
            : "Unable to load tenant."
        );
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [tenantId]);

  if (isLoading) {
    return (
      <p className="text-sm text-neutral-500">
        Loading tenant…
      </p>
    );
  }

  if (error || !details) {
    return (
      <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
        {error || "Tenant unavailable."}
      </p>
    );
  }

  const setStatus = (
    status: TenantStatus
  ) => {
    setDetails((current) =>
      current
        ? {
            ...current,
            tenant: {
              ...current.tenant,
              status,
            },
          }
        : current
    );
  };

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold">
                {details.tenant.name}
              </h1>

              <TenantStatusBadge
                status={
                  details.tenant.status
                }
              />
            </div>

            <p className="mt-2 text-sm text-neutral-400">
              {details.tenant.app_name} ·{" "}
              {details.tenant.code}
            </p>
          </div>

          <div
            className="h-12 w-12 rounded-xl border border-white/10"
            style={{
              backgroundColor:
                details.tenant.primary_color,
            }}
            title={
              details.tenant.primary_color
            }
          />
        </div>

        <div className="mt-6 border-t border-white/10 pt-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-400">
            Status management
          </h2>

          <TenantStatusControls
            tenantId={tenantId}
            currentStatus={
              details.tenant.status
            }
            onStatusChanged={setStatus}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="mb-5">
          <h2 className="text-xl font-semibold">
            Feature overrides
          </h2>

          <p className="mt-1 text-sm text-neutral-400">
            These values override the
            defaults inherited from the
            subscription plan.
          </p>
        </div>

        <TenantFeatureEditor
          tenantId={tenantId}
          initialOverrides={
            details.featureOverrides
          }
        />
      </section>
    </div>
  );
}
