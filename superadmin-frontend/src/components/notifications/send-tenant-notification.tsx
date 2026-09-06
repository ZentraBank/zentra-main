"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  CheckCircle2,
  Loader2,
  Send,
  BellRing,
} from "lucide-react";

import { ApiError } from "@/src/lib/api-error";
import {
  platformNotificationsService,
  type SendTenantPlatformNotificationResult,
  type TenantNotificationAudience,
} from "@/src/services/platform-notifications.service";
import { platformTenantsService } from "@/src/services/platform-tenants.service";
import type { Tenant } from "@/src/types/tenant";

type AudienceType =
  | "single_tenant"
  | "selected_tenants"
  | "all_tenants";

type Priority =
  | "low"
  | "normal"
  | "high"
  | "urgent";

const getTenantName = (tenant: Tenant) => {
  const value = tenant as Tenant & {
    name?: string;
    tenant_name?: string;
    legal_name?: string;
    slug?: string;
  };

  return (
    value.name ||
    value.tenant_name ||
    value.legal_name ||
    value.slug ||
    tenant.id
  );
};

export function SendTenantNotification() {
  const [audienceType, setAudienceType] =
    useState<AudienceType>("single_tenant");

  const [tenants, setTenants] =
    useState<Tenant[]>([]);

  const [selectedTenantIds, setSelectedTenantIds] =
    useState<string[]>([]);

  const [priority, setPriority] =
    useState<Priority>("normal");

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const [isLoadingTenants, setIsLoadingTenants] =
    useState(true);

  const [isSending, setIsSending] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [result, setResult] =
    useState<SendTenantPlatformNotificationResult | null>(
      null,
    );

  const loadTenants = useCallback(async () => {
    setIsLoadingTenants(true);

    try {
      const response =
        await platformTenantsService.list({
          page: 1,
          limit: 100,
        });

      setTenants(
        Array.isArray(response.data)
          ? response.data
          : [],
      );
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "Unable to load tenants.",
      );
    } finally {
      setIsLoadingTenants(false);
    }
  }, []);

  useEffect(() => {
    void loadTenants();
  }, [loadTenants]);

  const canSend = useMemo(() => {
    if (!title.trim() || !message.trim()) {
      return false;
    }

    if (
      audienceType === "single_tenant" &&
      selectedTenantIds.length !== 1
    ) {
      return false;
    }

    if (
      audienceType === "selected_tenants" &&
      selectedTenantIds.length === 0
    ) {
      return false;
    }

    return true;
  }, [
    audienceType,
    message,
    selectedTenantIds,
    title,
  ]);

  const buildAudience =
    (): TenantNotificationAudience => {
      if (audienceType === "all_tenants") {
        return {
          audienceType: "all_tenants",
        };
      }

      if (audienceType === "single_tenant") {
        return {
          audienceType: "single_tenant",
          tenantId: selectedTenantIds[0],
        };
      }

      return {
        audienceType: "selected_tenants",
        tenantIds: selectedTenantIds,
      };
    };

  const changeAudience = (
    value: AudienceType,
  ) => {
    setAudienceType(value);
    setSelectedTenantIds([]);
    setResult(null);
    setError(null);
  };

  const selectSingleTenant = (
    tenantId: string,
  ) => {
    setSelectedTenantIds(
      tenantId ? [tenantId] : [],
    );
    setResult(null);
  };

  const toggleTenant = (
    tenantId: string,
  ) => {
    setSelectedTenantIds((current) =>
      current.includes(tenantId)
        ? current.filter(
            (id) => id !== tenantId,
          )
        : [...current, tenantId],
    );

    setResult(null);
  };

  const sendNotification = async () => {
    if (!canSend || isSending) {
      return;
    }

    setIsSending(true);
    setError(null);
    setResult(null);

    try {
      const response =
        await platformNotificationsService.sendToTenants({
          ...buildAudience(),
          title: title.trim(),
          message: message.trim(),
          priority,
          actionUrl: "/notifications",
        });

      setResult(response.data);

      setTitle("");
      setMessage("");
      setPriority("normal");
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "Unable to send notification.",
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section className="mx-auto max-w-3xl rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8 text-neutral-900">
      <div className="flex items-center gap-3 border-b border-neutral-100 pb-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
          <BellRing size={22} />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900">
            Send notification
          </h2>

          <p className="mt-0.5 text-sm text-neutral-500">
            Send an announcement directly to tenant administrators across the platform.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-600">
              Audience
            </span>

            <select
              value={audienceType}
              onChange={(event) =>
                changeAudience(
                  event.target.value as AudienceType,
                )
              }
              className="h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm text-neutral-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            >
              <option value="single_tenant">
                One tenant
              </option>

              <option value="selected_tenants">
                Selected tenants
              </option>

              <option value="all_tenants">
                All tenants
              </option>
            </select>
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-600">
              Priority
            </span>

            <select
              value={priority}
              onChange={(event) =>
                setPriority(
                  event.target.value as Priority,
                )
              }
              className="h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm text-neutral-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </label>
        </div>

        {audienceType === "single_tenant" && (
          <label className="block space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-600">
              Target Tenant
            </span>

            <select
              value={
                selectedTenantIds[0] || ""
              }
              onChange={(event) =>
                selectSingleTenant(
                  event.target.value,
                )
              }
              disabled={isLoadingTenants}
              className="h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm text-neutral-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:opacity-50"
            >
              <option value="">
                {isLoadingTenants
                  ? "Loading tenants..."
                  : "Select a tenant"}
              </option>

              {tenants.map((tenant) => (
                <option
                  key={tenant.id}
                  value={tenant.id}
                >
                  {getTenantName(tenant)}
                </option>
              ))}
            </select>
          </label>
        )}

        {audienceType ===
          "selected_tenants" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                Select Tenants
              </span>

              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-600">
                {selectedTenantIds.length} selected
              </span>
            </div>

            <div className="max-h-52 overflow-y-auto rounded-xl border border-neutral-200 bg-neutral-50/50 divide-y divide-neutral-100">
              {isLoadingTenants ? (
                <div className="flex items-center justify-center gap-2 p-6 text-sm text-neutral-500">
                  <Loader2
                    size={16}
                    className="animate-spin text-blue-600"
                  />
                  Loading tenants...
                </div>
              ) : tenants.length === 0 ? (
                <div className="p-6 text-center text-sm text-neutral-500">
                  No tenants available.
                </div>
              ) : (
                tenants.map((tenant) => (
                  <label
                    key={tenant.id}
                    className="flex cursor-pointer items-center gap-3 px-4 py-3 transition hover:bg-neutral-100/60"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTenantIds.includes(
                        tenant.id,
                      )}
                      onChange={() =>
                        toggleTenant(
                          tenant.id,
                        )
                      }
                      className="h-4 w-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                    />

                    <span className="text-sm font-medium text-neutral-800">
                      {getTenantName(tenant)}
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>
        )}

        <label className="block space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-600">
            Notification Title
          </span>

          <input
            value={title}
            onChange={(event) =>
              setTitle(event.target.value)
            }
            placeholder="e.g. Scheduled System Maintenance"
            className="h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-600">
            Message Content
          </span>

          <textarea
            value={message}
            onChange={(event) =>
              setMessage(event.target.value)
            }
            rows={5}
            placeholder="Write your announcement details here..."
            className="w-full resize-y rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </label>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 shadow-sm">
            {error}
          </div>
        )}

        {result && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
            <div className="flex gap-3">
              <CheckCircle2
                size={20}
                className="mt-0.5 shrink-0 text-emerald-600"
              />

              <div className="space-y-1">
                <p className="text-sm font-bold text-emerald-900">
                  Notification successfully dispatched
                </p>

                <p className="text-xs font-medium text-emerald-700">
                  {result.tenantCount} tenant
                  {result.tenantCount === 1
                    ? ""
                    : "s"}
                  {" · "}
                  {result.recipientCount} recipient
                  {result.recipientCount === 1
                    ? ""
                    : "s"}
                </p>

                <p className="text-xs text-emerald-600">
                  Push: {result.push.delivered}/
                  {result.push.attempted} delivered
                  {" · "}
                  {result.push.failed} failed
                </p>
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() =>
            void sendNotification()
          }
          disabled={
            !canSend || isSending
          }
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSending ? (
            <Loader2
              size={18}
              className="animate-spin"
            />
          ) : (
            <Send size={18} />
          )}

          {isSending
            ? "Sending notification..."
            : "Send notification"}
        </button>
      </div>
    </section>
  );
}