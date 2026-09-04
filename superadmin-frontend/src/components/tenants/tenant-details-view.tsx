"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { ApiError } from "@/src/lib/api-error";

import {
  platformSubscriptionsService,
  type TenantPlanChangeAction,
  type TenantSubscription,
} from "@/src/services/platform-subscriptions.service";

import { platformTenantsService } from "@/src/services/platform-tenants.service";

import type {
  SubscriptionPlan,
} from "@/src/types/subscription";

import type {
  TenantDetails,
  TenantStatus,
} from "@/src/types/tenant";

import { TenantFeatureEditor } from "./tenant-feature-editor";
import { TenantStatusBadge } from "./tenant-status-badge";
import { TenantStatusControls } from "./tenant-status-controls";

function formatMoney(
  value: number | string,
  currency = "USD"
) {
  const amount = Number(value);

  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency,
    }
  ).format(
    Number.isFinite(amount)
      ? amount
      : 0
  );
}

export function TenantDetailsView({
  tenantId,
}: {
  tenantId: string;
}) {
  const [details, setDetails] =
    useState<TenantDetails | null>(
      null
    );

  const [plans, setPlans] =
    useState<SubscriptionPlan[]>(
      []
    );

  const [
    subscription,
    setSubscription,
  ] =
    useState<TenantSubscription | null>(
      null
    );

  const [
    selectedPlanId,
    setSelectedPlanId,
  ] =
    useState("");

  const [reason, setReason] =
    useState("");

  const [
    isChangingPlan,
    setIsChangingPlan,
  ] =
    useState(false);

  const [
    subscriptionError,
    setSubscriptionError,
  ] =
    useState<string | null>(
      null
    );

  const [
    subscriptionSuccess,
    setSubscriptionSuccess,
  ] =
    useState<string | null>(
      null
    );

  const [
    isLoading,
    setIsLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      setSubscriptionError(
        null
      );

      /*
       * Load tenant first.
       */
      try {
        const tenantResponse =
          await platformTenantsService.getById(
            tenantId
          );

        setDetails(
          tenantResponse.data
        );
      } catch (caught) {
        console.error(
          "Unable to load tenant:",
          caught
        );

        setError(
          caught instanceof ApiError
            ? caught.message
            : "Unable to load tenant."
        );

        setIsLoading(false);

        return;
      }

      /*
       * Load global subscription plans.
       */
      try {
        const plansResponse =
          await platformSubscriptionsService.listPlans(
            {
              limit: 100,
              status: "active",
            }
          );

        setPlans(
          plansResponse.data
        );
      } catch (caught) {
        console.error(
          "Unable to load subscription plans:",
          caught
        );

        setSubscriptionError(
          caught instanceof ApiError
            ? `Plans: ${caught.message}`
            : "Unable to load subscription plans."
        );
      }

      /*
       * Load tenant's current subscription.
       */
      try {
        const subscriptionResponse =
          await platformSubscriptionsService.getTenantSubscription(
            tenantId
          );

        const current =
            subscriptionResponse.data
              .subscription;

          setSubscription(
            current
          );

          setSelectedPlanId(
            current?.plan_id ?? ""
          );
          
      } catch (caught) {
        console.error(
          "Unable to load tenant subscription:",
          caught
        );

        setSubscriptionError(
          caught instanceof ApiError
            ? `Subscription: ${caught.message}`
            : "Unable to load tenant subscription."
        );
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [tenantId]);

  const currentPlan =
    useMemo(() => {
      if (!subscription) {
        return null;
      }

      return (
        plans.find(
          (plan) =>
            plan.id ===
            subscription.plan_id
        ) ?? null
      );
    }, [
      plans,
      subscription,
    ]);

  const selectedPlan =
    useMemo(() => {
      if (!selectedPlanId) {
        return null;
      }

      return (
        plans.find(
          (plan) =>
            plan.id ===
            selectedPlanId
        ) ?? null
      );
    }, [
      plans,
      selectedPlanId,
    ]);

 const changeAction =
  useMemo<
    TenantPlanChangeAction | null
  >(() => {
    /*
     * Plan changes are only available
     * after onboarding has created the
     * tenant's initial subscription.
     */
    if (
      !subscription ||
      !currentPlan ||
      !selectedPlan
    ) {
      return null;
    }

    if (
      currentPlan.id ===
      selectedPlan.id
    ) {
      return null;
    }

    const currentPrice =
      Number(currentPlan.price);

    const selectedPrice =
      Number(selectedPlan.price);

    return selectedPrice >
      currentPrice
      ? "upgraded"
      : "downgraded";
  }, [
    subscription,
    currentPlan,
    selectedPlan,
  ]);

  const handleChangePlan =
    async () => {
      if (
        !selectedPlan ||
        !changeAction
      ) {
        return;
      }

      try {
        setIsChangingPlan(
          true
        );

        setSubscriptionError(
          null
        );

        setSubscriptionSuccess(
          null
        );

        const response =
          await platformSubscriptionsService.changeTenantPlan(
            tenantId,
            {
              planId:
                selectedPlan.id,

              action:
                changeAction,

              reason:
                reason.trim() ||
                `${
                  changeAction ===
                  "upgraded"
                    ? "Upgraded"
                    : "Downgraded"
                } to ${
                  selectedPlan.name
                }`,
            }
          );

        setSubscription(
          response.data
        );

        setSelectedPlanId(
          response.data.plan_id
        );

        setReason("");

        setSubscriptionSuccess(
          `Subscription changed to ${selectedPlan.name} successfully.`
        );
      } catch (caught) {
        console.error(
          "Unable to change subscription:",
          caught
        );

        setSubscriptionError(
          caught instanceof ApiError
            ? caught.message
            : "Unable to change subscription."
        );
      } finally {
        setIsChangingPlan(
          false
        );
      }
    };

  const setStatus = (
    status: TenantStatus
  ) => {
    setDetails(
      (current) =>
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

  if (isLoading) {
    return (
      <p className="text-sm text-neutral-500">
        Loading tenant…
      </p>
    );
  }

  if (
    error ||
    !details
  ) {
    return (
      <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
        {error ||
          "Tenant unavailable."}
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {/* Tenant details */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold">
                {
                  details.tenant
                    .name
                }
              </h1>

              <TenantStatusBadge
                status={
                  details.tenant
                    .status
                }
              />
            </div>

            <p className="mt-2 text-sm text-neutral-400">
              {
                details.tenant
                  .app_name
              }{" "}
              ·{" "}
              {
                details.tenant
                  .code
              }
            </p>
          </div>

          <div
            className="h-12 w-12 rounded-xl border border-white/10"
            style={{
              backgroundColor:
                details.tenant
                  .primary_color,
            }}
            title={
              details.tenant
                .primary_color
            }
          />
        </div>

        <div className="mt-6 border-t border-white/10 pt-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-400">
            Status management
          </h2>

          <TenantStatusControls
            tenantId={
              tenantId
            }
            currentStatus={
              details.tenant
                .status
            }
            onStatusChanged={
              setStatus
            }
          />
        </div>
      </section>

      {/* Subscription */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
            Commercial management
          </p>

          <h2 className="mt-2 text-xl font-semibold">
            Subscription plan
          </h2>

          <p className="mt-1 text-sm text-neutral-400">
            Upgrade or downgrade
            this tenant without
            changing the global plan
            definitions.
          </p>
        </div>

        {subscriptionError ? (
          <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
            {
              subscriptionError
            }
          </div>
        ) : null}

        {subscriptionSuccess ? (
          <div className="mb-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
            {
              subscriptionSuccess
            }
          </div>
        ) : null}

        {subscription &&
currentPlan ? (
  <div className="rounded-xl border border-white/10 bg-black/10 p-5">
    <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
      Current subscription
    </p>

    <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-2xl font-semibold">
          {currentPlan.name}
        </p>

        <p className="mt-1 text-sm capitalize text-neutral-400">
          {subscription.status}
        </p>
      </div>

      <div className="text-right">
        <p className="text-2xl font-semibold">
          {formatMoney(
            currentPlan.price,
            currentPlan.currency
          )}
        </p>

        <p className="mt-1 text-xs text-neutral-500">
          {currentPlan.billing_interval}
        </p>
      </div>
    </div>
  </div>
) : (
  <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-5">
    <p className="font-semibold text-amber-200">
      No active subscription
    </p>

    <p className="mt-1 text-sm text-neutral-400">
      This tenant does not currently
      have an active subscription.
      Initial subscriptions are created
      automatically after a submitted
      payment proof is approved.
    </p>
  </div>
)}

{subscription &&
currentPlan &&
plans.length > 0 ? (
  <div className="mt-6">
    <h3 className="text-sm font-semibold">
  Change subscription
</h3>

<p className="mt-1 text-sm text-neutral-400">
  Select another plan to upgrade or
  downgrade this tenant.
</p>

    <div className="mt-4 grid gap-4 md:grid-cols-3">
      {plans.map((plan) => {
        const isCurrent =
          subscription?.plan_id ===
          plan.id;

        const isSelected =
          selectedPlanId ===
          plan.id;

        return (
          <button
            key={plan.id}
            type="button"
            onClick={() =>
              setSelectedPlanId(
                plan.id
              )
            }
            className={`rounded-xl border p-5 text-left transition ${
              isSelected
                ? "border-white/40 bg-white/10"
                : "border-white/10 bg-black/10 hover:bg-white/5"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">
                  {plan.name}
                </p>

                <p className="mt-1 text-xs uppercase text-neutral-500">
                  {plan.code}
                </p>
              </div>

              {isCurrent ? (
                <span className="rounded-full bg-white px-2 py-1 text-[10px] font-bold text-black">
                  CURRENT
                </span>
              ) : null}
            </div>

            <p className="mt-5 text-2xl font-semibold">
              {formatMoney(
                plan.price,
                plan.currency
              )}
            </p>

            <p className="mt-1 text-xs capitalize text-neutral-500">
              {plan.billing_interval}
            </p>
          </button>
        );
      })}
    </div>

    {changeAction &&
    selectedPlan ? (
      <div className="mt-6 rounded-xl border border-white/10 bg-black/10 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-neutral-500">
  Proposed change
</p>

<p className="mt-2 text-lg font-semibold">
  {currentPlan.name} →{" "}
  {selectedPlan.name}
</p>
          </div>

          <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold uppercase">
  {changeAction === "upgraded"
    ? "Upgrade"
    : "Downgrade"}
</span>
        </div>

        <label className="mt-5 block">
          <span className="text-sm text-neutral-400">
            Reason
          </span>

          <textarea
            value={reason}
            onChange={(event) =>
              setReason(
                event.target.value
              )
            }
            rows={3}
            placeholder="Optional reason for changing the subscription…"
            className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-white/30"
          />
        </label>

        <button
          type="button"
          disabled={
            isChangingPlan
          }
          onClick={() =>
            void handleChangePlan()
          }
          className="mt-4 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isChangingPlan
  ? "Changing subscription…"
  : `${
      changeAction === "upgraded"
        ? "Upgrade"
        : "Downgrade"
    } to ${selectedPlan.name}`}
        </button>
      </div>
    ) : null}
  </div>
) : subscription ? (
  <p className="mt-5 text-sm text-neutral-500">
    No active alternative subscription
    plans are available.
  </p>
) : null}
      </section>

      {/* Tenant-specific overrides */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="mb-5">
          <h2 className="text-xl font-semibold">
            Feature overrides
          </h2>

          <p className="mt-1 text-sm text-neutral-400">
            These values override
            the defaults inherited
            from the subscription
            plan.
          </p>
        </div>

        <TenantFeatureEditor
          tenantId={
            tenantId
          }
          initialOverrides={
            details.featureOverrides
          }
        />
      </section>
    </div>
  );
}