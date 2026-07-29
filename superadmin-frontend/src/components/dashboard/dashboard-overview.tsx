"use client";

import {
  useEffect,
  useState,
} from "react";

import { ApiError } from "@/src/lib/api-error";
import { platformDashboardService } from "@/src/services/platform-dashboard.service";
import type {
  PlatformDashboard,
} from "@/src/types/dashboard";

const numberFormatter =
  new Intl.NumberFormat("en-US");

const currencyFormatter =
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

export function DashboardOverview() {
  const [dashboard, setDashboard] =
    useState<PlatformDashboard | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response =
          await platformDashboardService.getDashboard();

        setDashboard(response.data);
      } catch (caught) {
        setError(
          caught instanceof ApiError
            ? caught.message
            : "Unable to load dashboard."
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
        Loading dashboard…
      </p>
    );
  }

  if (error || !dashboard) {
    return (
      <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
        {error || "Dashboard unavailable."}
      </p>
    );
  }

  const cards = [
    {
      label: "Total tenants",
      value: numberFormatter.format(
        dashboard.tenants.total
      ),
    },
    {
      label: "Active tenants",
      value: numberFormatter.format(
        dashboard.tenants.active
      ),
    },
    {
      label: "Platform users",
      value: numberFormatter.format(
        dashboard.users.total
      ),
    },
    {
      label: "Transactions",
      value: numberFormatter.format(
        dashboard.transactions.total
      ),
    },
    {
      label: "Transaction volume",
      value: currencyFormatter.format(
        Number(
          dashboard.transactions.volume || 0
        )
      ),
    },
    {
      label: "Active subscriptions",
      value: numberFormatter.format(
        dashboard.subscriptions.active
      ),
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <article
          key={card.label}
          className="rounded-2xl border border-white/10 bg-white/5 p-5"
        >
          <p className="text-sm text-neutral-400">
            {card.label}
          </p>

          <p className="mt-3 text-3xl font-semibold">
            {card.value}
          </p>
        </article>
      ))}
    </div>
  );
}
