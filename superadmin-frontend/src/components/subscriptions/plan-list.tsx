"use client";

import {
  useEffect,
  useState,
} from "react";
import Link from "next/link";

import { ApiError } from "@/src/lib/api-error";
import { platformSubscriptionsService } from "@/src/services/platform-subscriptions.service";
import type {
  SubscriptionPlan,
} from "@/src/types/subscription";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function PlanList() {
  const [plans, setPlans] =
    useState<SubscriptionPlan[]>([]);
  const [error, setError] =
    useState<string | null>(null);
  const [isLoading, setIsLoading] =
    useState(true);

  useEffect(() => {
    const load = async () => {
      try {
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

    void load();
  }, []);

  if (isLoading) {
    return (
      <p className="text-sm text-neutral-500">
        Loading plans…
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
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {plans.map((plan) => (
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
            {money.format(Number(plan.price))}
          </p>

          <p className="mt-1 text-sm text-neutral-400">
            {plan.billing_interval}
          </p>

          <Link
            href={`/subscriptions/plans/${plan.id}`}
            className="mt-5 inline-flex text-sm font-medium hover:underline"
          >
            Manage plan
          </Link>
        </article>
      ))}
    </div>
  );
}
