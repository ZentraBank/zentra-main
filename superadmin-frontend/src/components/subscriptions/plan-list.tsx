"use client";

import {
  useEffect,
  useState,
} from "react";

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
      <p className="text-sm text-neutral-500">
        Loading plans…
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {error ? (
        <p className="text-sm text-red-300">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
              className="rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-neutral-500">
                    {plan.code}
                  </p>

                  <h2 className="mt-2 text-xl font-semibold">
                    {plan.name}
                  </h2>
                </div>

                <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs capitalize">
                  {plan.status}
                </span>
              </div>

              <p className="mt-4 text-3xl font-semibold">
                {money.format(
                  Number(plan.price)
                )}
              </p>

              <p className="mt-1 text-sm text-neutral-400">
                {plan.billing_interval}
              </p>

              <button
                type="button"
                onClick={() =>
                  void openPlan(plan.id)
                }
                className="mt-5 inline-flex rounded-lg border border-white/10 px-3 py-2 text-sm font-medium hover:bg-white/5"
              >
                {isExpanded
                  ? "Close features"
                  : "Edit features"}
              </button>

              {isExpanded ? (
                <div className="mt-5 border-t border-white/10 pt-5">
                  {loadingPlanId ===
                  plan.id ? (
                    <p className="text-sm text-neutral-500">
                      Loading features…
                    </p>
                  ) : details ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">
                          Plan features
                        </h3>

                        <span className="text-xs text-neutral-500">
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
                        className="mt-4 inline-flex rounded-lg bg-white px-4 py-2 text-sm font-medium text-black disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {savingPlanId ===
                        plan.id
                          ? "Saving…"
                          : "Save features"}
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
    <div className="rounded-xl border border-white/10 bg-black/10 p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium">
            {formatFeatureName(
              feature.featureKey
            )}
          </p>

          <p className="mt-0.5 text-xs text-neutral-500">
            {feature.featureKey}
          </p>
        </div>

        <label className="flex items-center gap-2 text-sm">
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
          />

          {feature.isEnabled
            ? "Enabled"
            : "Disabled"}
        </label>
      </div>

      {numeric ? (
        <div className="mt-4">
          <label className="text-xs text-neutral-400">
            Limit
          </label>

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
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-white/30"
          />

          <p className="mt-1 text-xs text-neutral-500">
            Leave empty for unlimited.
          </p>
        </div>
      ) : null}
    </div>
  );
}