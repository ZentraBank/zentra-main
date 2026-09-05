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
    <section className="rounded-2xl border border-black/5 bg-white/30 p-5 shadow-sm backdrop-blur-sm">
      <div>
        <h2 className="text-lg font-semibold">
          Send notification
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Send an announcement directly to tenant
          administrators.
        </p>
      </div>

      <div className="mt-6 space-y-5">
        <label className="block space-y-2">
          <span className="text-sm font-medium">
            Audience
          </span>

          <select
            value={audienceType}
            onChange={(event) =>
              changeAudience(
                event.target.value as AudienceType,
              )
            }
            className="w-full rounded-xl border border-black/10 bg-white/60 px-4 py-3 text-sm outline-none"
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

        {audienceType === "single_tenant" && (
          <label className="block space-y-2">
            <span className="text-sm font-medium">
              Tenant
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
              className="w-full rounded-xl border border-black/10 bg-white/60 px-4 py-3 text-sm outline-none disabled:opacity-50"
            >
              <option value="">
                {isLoadingTenants
                  ? "Loading tenants..."
                  : "Select tenant"}
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
              <span className="text-sm font-medium">
                Tenants
              </span>

              <span className="text-xs text-slate-500">
                {selectedTenantIds.length} selected
              </span>
            </div>

            <div className="max-h-52 overflow-y-auto rounded-xl border border-black/10 bg-white/40">
              {isLoadingTenants ? (
                <div className="flex items-center gap-2 p-4 text-sm text-slate-500">
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                  Loading tenants...
                </div>
              ) : (
                tenants.map((tenant) => (
                  <label
                    key={tenant.id}
                    className="flex cursor-pointer items-center gap-3 border-b border-black/5 px-4 py-3 last:border-b-0"
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
                    />

                    <span className="text-sm">
                      {getTenantName(tenant)}
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>
        )}

        <label className="block space-y-2">
          <span className="text-sm font-medium">
            Priority
          </span>

          <select
            value={priority}
            onChange={(event) =>
              setPriority(
                event.target.value as Priority,
              )
            }
            className="w-full rounded-xl border border-black/10 bg-white/60 px-4 py-3 text-sm outline-none"
          >
            <option value="low">
              Low
            </option>
            <option value="normal">
              Normal
            </option>
            <option value="high">
              High
            </option>
            <option value="urgent">
              Urgent
            </option>
          </select>
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium">
            Title
          </span>

          <input
            value={title}
            onChange={(event) =>
              setTitle(event.target.value)
            }
            placeholder="Notification title"
            className="w-full rounded-xl border border-black/10 bg-white/60 px-4 py-3 text-sm outline-none"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium">
            Message
          </span>

          <textarea
            value={message}
            onChange={(event) =>
              setMessage(event.target.value)
            }
            rows={5}
            placeholder="Write your message..."
            className="w-full resize-y rounded-xl border border-black/10 bg-white/60 px-4 py-3 text-sm outline-none"
          />
        </label>

        {error && (
          <p className="text-sm text-red-600">
            {error}
          </p>
        )}

        {result && (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
            <div className="flex gap-3">
              <CheckCircle2
                size={18}
                className="mt-0.5 shrink-0"
              />

              <div>
                <p className="text-sm font-semibold">
                  Notification sent
                </p>

                <p className="mt-1 text-xs text-slate-600">
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

                <p className="mt-1 text-xs text-slate-500">
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
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isSending ? (
            <Loader2
              size={17}
              className="animate-spin"
            />
          ) : (
            <Send size={17} />
          )}

          {isSending
            ? "Sending..."
            : "Send notification"}
        </button>
      </div>
    </section>
  );
}