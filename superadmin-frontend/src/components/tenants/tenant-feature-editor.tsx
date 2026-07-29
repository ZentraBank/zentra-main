"use client";

import {
  FormEvent,
  useMemo,
  useState,
} from "react";

import { ApiError } from "@/src/lib/api-error";
import { platformTenantsService } from "@/src/services/platform-tenants.service";
import type {
  TenantFeatureOverride,
} from "@/src/types/tenant";

const defaultFeatures = [
  "accounts",
  "transfers",
  "cards",
  "donations",
  "investments",
  "open_banking",
  "subscriptions",
  "notifications",
];

export function TenantFeatureEditor({
  tenantId,
  initialOverrides,
}: {
  tenantId: string;
  initialOverrides: TenantFeatureOverride[];
}) {
  const initialState = useMemo(() => {
    const state: Record<string, boolean> =
      {};

    for (const code of defaultFeatures) {
      state[code] = false;
    }

    for (const override of initialOverrides) {
      state[override.feature_code] =
        Boolean(override.is_enabled);
    }

    return state;
  }, [initialOverrides]);

  const [features, setFeatures] =
    useState(initialState);

  const [reason, setReason] = useState("");

  const [message, setMessage] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      await platformTenantsService.updateFeatures(
        tenantId,
        features,
        reason.trim() || undefined
      );

      setMessage(
        "Tenant feature overrides saved."
      );
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "Unable to update features."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {Object.entries(features).map(
          ([code, enabled]) => (
            <label
              key={code}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3"
            >
              <span className="text-sm font-medium">
                {code
                  .split("_")
                  .map(
                    (part) =>
                      part.charAt(0).toUpperCase() +
                      part.slice(1)
                  )
                  .join(" ")}
              </span>

              <input
                type="checkbox"
                checked={enabled}
                onChange={(event) =>
                  setFeatures((current) => ({
                    ...current,
                    [code]:
                      event.target.checked,
                  }))
                }
                className="h-5 w-5"
              />
            </label>
          )
        )}
      </div>

      <div>
        <label
          htmlFor="feature-reason"
          className="mb-2 block text-sm font-medium"
        >
          Reason for override
        </label>

        <textarea
          id="feature-reason"
          value={reason}
          onChange={(event) =>
            setReason(event.target.value)
          }
          rows={4}
          placeholder="Commercial, operational, or compliance reason"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-white/30"
        />
      </div>

      {message && (
        <p className="text-sm text-emerald-300">
          {message}
        </p>
      )}

      {error && (
        <p className="text-sm text-red-300">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black disabled:opacity-60"
      >
        {isSubmitting
          ? "Saving features…"
          : "Save feature overrides"}
      </button>
    </form>
  );
}
