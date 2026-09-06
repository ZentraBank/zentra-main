"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Check,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Layers,
  Loader2,
  Package,
  Shield,
  Sliders,
} from "lucide-react";

import { ApiError } from "@/src/lib/api-error";

import {
  platformSubscriptionsService,
  type SubscriptionPlanDetails,
  type UpdatePlanFeaturePayload,
} from "@/src/services/platform-subscriptions.service";

import type {
  SubscriptionPlan,
} from "@/src/types/subscription";

const money = new Intl.NumberFormat(
  "en-US",
  {
    style: "currency",
    currency: "USD",
  }
);

const formatFeatureName = (
  value: string
) =>
  value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );

export function PlanList() {
  const [plans, setPlans] =
    useState<SubscriptionPlan[]>([]);

  const [error, setError] =
    useState<string | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [expandedPlanId, setExpandedPlanId] =
    useState<string | null>(null);

  const [planDetails, setPlanDetails] =
    useState<
      Record<
        string,
        SubscriptionPlanDetails
      >
    >({});

  const [loadingPlanId, setLoadingPlanId] =
    useState<string | null>(null);

  const [savingPlanId, setSavingPlanId] =
    useState<string | null>(null);

  const [featureDrafts, setFeatureDrafts] =
    useState<
      Record<
        string,
        UpdatePlanFeaturePayload[]
      >
    >({});

  const loadPlans = async () => {
    try {
      setError(null);

      const response =
        await platformSubscriptionsService.listPlans({
          limit: 100,
        });

      setPlans(response.data);
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "Unable to load plans."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadPlans();
  }, []);

  const openPlan = async (
    planId: string
  ) => {
    if (expandedPlanId === planId) {
      setExpandedPlanId(null);
      return;
    }

    setExpandedPlanId(planId);

    if (planDetails[planId]) {
      return;
    }

    try {
      setLoadingPlanId(planId);
      setError(null);

      const response =
        await platformSubscriptionsService.getPlan(
          planId
        );

      const details = response.data;

      setPlanDetails((current) => ({
        ...current,
        [planId]: details,
      }));

      setFeatureDrafts((current) => ({
        ...current,
        [planId]: details.features.map(
          (feature) => ({
            featureKey:
              feature.feature_key,

            isEnabled:
              Boolean(
                feature.is_enabled
              ),

            featureValue:
              feature.feature_value,
          })
        ),
      }));
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "Unable to load plan features."
      );
    } finally {
      setLoadingPlanId(null);
    }
  };

  const updateFeatureEnabled = (
    planId: string,
    featureKey: string,
    isEnabled: boolean
  ) => {
    setFeatureDrafts((current) => ({
      ...current,

      [planId]:
        current[planId]?.map(
          (feature) =>
            feature.featureKey ===
            featureKey
              ? {
                  ...feature,
                  isEnabled,
                }
              : feature
        ) ?? [],
    }));
  };

  const updateFeatureValue = (
    planId: string,
    featureKey: string,
    featureValue: string
  ) => {
    setFeatureDrafts((current) => ({
      ...current,

      [planId]:
        current[planId]?.map(
          (feature) =>
            feature.featureKey ===
            featureKey
              ? {
                  ...feature,
                  featureValue:
                    featureValue === ""
                      ? null
                      : Number(featureValue),
                }
              : feature
        ) ?? [],
    }));
  };

  const saveFeatures = async (
    planId: string
  ) => {
    const features =
      featureDrafts[planId];

    if (!features) {
      return;
    }

    try {
      setSavingPlanId(planId);
      setError(null);

      const response =
        await platformSubscriptionsService.updatePlanFeatures(
          planId,
          features
        );

      setPlanDetails((current) => ({
        ...current,
        [planId]: response.data,
      }));

      setFeatureDrafts((current) => ({
        ...current,

        [planId]:
          response.data.features.map(
            (feature) => ({
              featureKey:
                feature.feature_key,

              isEnabled:
                Boolean(
                  feature.is_enabled
                ),

              featureValue:
                feature.feature_value,
            })
          ),
      }));
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "Unable to update plan features."
      );
    } finally {
      setSavingPlanId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-neutral-500">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          Loading subscription plans…
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-neutral-900">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold tracking-tight text-neutral-900">
          Subscription Plans & Features
        </h2>
        <p className="text-sm text-neutral-500">
          Configure tier pricing, statuses, and granular access rules.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 shadow-sm">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {plans.map((plan) => {
          const isExpanded =
            expandedPlanId === plan.id;

          const details =
            planDetails[plan.id];

          const drafts =
            featureDrafts[plan.id] ?? [];

          return (
            <article
              key={plan.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:border-neutral-300 hover:shadow-md"
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-block rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-mono font-semibold uppercase tracking-wider text-neutral-600">
                      {plan.code}
                    </span>

                    <h3 className="mt-3 text-xl font-bold text-neutral-900">
                      {plan.name}
                    </h3>
                  </div>

                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                      plan.status === "active"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-neutral-100 text-neutral-600"
                    }`}
                  >
                    {plan.status}
                  </span>
                </div>

                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold tracking-tight text-neutral-900">
                    {money.format(
                      Number(plan.price)
                    )}
                  </span>
                  <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                    / {plan.billing_interval}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    void openPlan(plan.id)
                  }
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm font-semibold text-neutral-700 shadow-sm transition hover:bg-neutral-100"
                >
                  <Sliders size={16} className="text-neutral-500" />
                  {isExpanded
                    ? "Hide features"
                    : "Configure features"}
                  {isExpanded ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </button>
              </div>

              {isExpanded ? (
                <div className="border-t border-neutral-200 bg-neutral-50/50 p-6">
                  {loadingPlanId ===
                  plan.id ? (
                    <div className="flex items-center justify-center py-6 text-sm text-neutral-500">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin text-blue-600" />
                      Loading features…
                    </div>
                  ) : details ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                          Feature Controls
                        </h4>

                        <span className="text-xs font-medium text-neutral-500">
                          {
                            details.features
                              .length
                          }{" "}
                          features
                        </span>
                      </div>

                      <div className="space-y-3">
                        {drafts.map(
                          (feature) => (
                            <FeatureEditor
                              key={
                                feature.featureKey
                              }
                              planId={
                                plan.id
                              }
                              feature={
                                feature
                              }
                              onEnabledChange={
                                updateFeatureEnabled
                              }
                              onValueChange={
                                updateFeatureValue
                              }
                            />
                          )
                        )}
                      </div>

                      <button
                        type="button"
                        disabled={
                          savingPlanId ===
                          plan.id
                        }
                        onClick={() =>
                          void saveFeatures(
                            plan.id
                          )
                        }
                        className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {savingPlanId ===
                        plan.id ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving changes…
                          </>
                        ) : (
                          "Save features"
                        )}
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}

type FeatureEditorProps = {
  planId: string;

  feature: UpdatePlanFeaturePayload;

  onEnabledChange: (
    planId: string,
    featureKey: string,
    value: boolean
  ) => void;

  onValueChange: (
    planId: string,
    featureKey: string,
    value: string
  ) => void;
};

const NUMERIC_FEATURES = new Set([
  "daily_transfer_limit",
  "number_of_accounts",
  "push_notification_limit",
  "transfer_limit",
]);

const isNumericFeature = (
  featureKey: string
) =>
  NUMERIC_FEATURES.has(featureKey);

function FeatureEditor({
  planId,
  feature,
  onEnabledChange,
  onValueChange,
}: FeatureEditorProps) {
  const numeric =
    isNumericFeature(
      feature.featureKey
    );

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-xs">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-neutral-900">
            {formatFeatureName(
              feature.featureKey
            )}
          </p>

          <p className="mt-0.5 text-xs font-mono text-neutral-400">
            {feature.featureKey}
          </p>
        </div>

        <label className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            checked={feature.isEnabled}
            onChange={(event) =>
              onEnabledChange(
                planId,
                feature.featureKey,
                event.target.checked
              )
            }
            className="peer sr-only"
          />
          <div className="peer h-6 w-11 rounded-full bg-neutral-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-neutral-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-hidden"></div>
          <span className="ml-2 text-xs font-medium text-neutral-700">
            {feature.isEnabled ? "Enabled" : "Disabled"}
          </span>
        </label>
      </div>

      {numeric ? (
        <div className="mt-3.5 border-t border-neutral-100 pt-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-neutral-600">
              Limit Value
            </label>
            <span className="text-[10px] text-neutral-400">
              Empty = Unlimited
            </span>
          </div>

          <input
            type="number"
            min="0"
            value={
              feature.featureValue ===
                null ||
              feature.featureValue ===
                undefined
                ? ""
                : String(
                    feature.featureValue
                  )
            }
            onChange={(event) =>
              onValueChange(
                planId,
                feature.featureKey,
                event.target.value
              )
            }
            placeholder="Unlimited"
            className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-950 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </div>
      ) : null}
    </div>
  );
}