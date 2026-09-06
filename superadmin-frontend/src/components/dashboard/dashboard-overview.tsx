"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Activity,
  ArrowUpRight,
  CreditCard,
  DollarSign,
  ShieldCheck,
  Users,
} from "lucide-react";

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
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-neutral-500">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          Loading dashboard metrics…
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm">
        {error || "Dashboard unavailable."}
      </div>
    );
  }

  const cards = [
    {
      label: "Total tenants",
      value: numberFormatter.format(
        dashboard.tenants.total
      ),
      subtext: `${numberFormatter.format(dashboard.tenants.active)} active tenants`,
      icon: Activity,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-100",
    },
    {
      label: "Active tenants",
      value: numberFormatter.format(
        dashboard.tenants.active
      ),
      subtext: "Currently operational systems",
      icon: ShieldCheck,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-100",
    },
    {
      label: "Platform users",
      value: numberFormatter.format(
        dashboard.users.total
      ),
      subtext: "Registered across all tenants",
      icon: Users,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-100",
    },
    {
      label: "Total transactions",
      value: numberFormatter.format(
        dashboard.transactions.total
      ),
      subtext: "Processed records",
      icon: CreditCard,
      color: "text-violet-600",
      bgColor: "bg-violet-50",
      borderColor: "border-violet-100",
    },
    {
      label: "Transaction volume",
      value: currencyFormatter.format(
        Number(
          dashboard.transactions.volume || 0
        )
      ),
      subtext: "Total monetary throughput",
      icon: DollarSign,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-100",
    },
    {
      label: "Active subscriptions",
      value: numberFormatter.format(
        dashboard.subscriptions.active
      ),
      subtext: "Current billing plans",
      icon: ArrowUpRight,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
      borderColor: "border-cyan-100",
    },
  ];

  return (
    <div className="space-y-6 text-neutral-900">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold tracking-tight text-neutral-900">
          Platform Overview
        </h2>
        <p className="text-sm text-neutral-500">
          Real-time metrics and system-wide performance indicators.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.label}
              className="group relative overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm transition-all hover:border-neutral-300 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  {card.label}
                </p>

                <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${card.bgColor} ${card.color} ${card.borderColor}`}>
                  <Icon size={20} />
                </div>
              </div>

              <div className="mt-4">
                <p className="text-3xl font-bold tracking-tight text-neutral-900">
                  {card.value}
                </p>

                <p className="mt-1 text-xs font-medium text-neutral-500">
                  {card.subtext}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}