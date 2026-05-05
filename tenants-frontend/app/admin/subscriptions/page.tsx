"use client";

import AppShell from "@/components/layout/AppShell";
import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";
import { useState } from "react";

const plans = [
  {
    name: "Bronze",
    price: "$40",
    description:
      "Send in-app notifications to front-end users regarding account updates or upgrades.",
    features: [
      "Send notifications to clients",
      "Basic account update tools",
      "Client communication support",
    ],
  },
  {
    name: "Gold",
    price: "$40",
    description:
      "Send in-app notifications to front-end users regarding account updates or upgrades.",
    features: [
      "Everything in Bronze",
      "Manage client account messages",
      "More account communication options",
    ],
  },
  {
    name: "Diamond",
    price: "$40",
    description:
      "Send in-app notifications to front-end users regarding account updates or upgrades.",
    features: [
      "Edit your client’s account balance",
      "Send fake transactions to your clients",
      "Collect client card details",
      "Edit transfer receipts already sent",
      "Serve clients as their bank manager in-app",
      "Manipulate transaction status",
      "Work donation and bill workflows",
      "Work investment workflows",
    ],
  },
];

export default function SubscriptionPage() {
  const [selectedPlan, setSelectedPlan] = useState(plans[0]);

  return (
    <AppShell>
      <div
        className="min-h-[calc(100vh-6rem)] rounded-3xl p-5 text-white md:p-8"
        style={{
          background:
            "radial-gradient(circle at top left, rgba(255,255,255,0.35), transparent 18%), linear-gradient(135deg, var(--tenant-primary), #020617 72%)",
        }}
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-center">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl">
                Subscribe!
              </h1>

              <p className="mt-5 max-w-xl text-sm leading-6 text-white/85 md:text-base">
                Choose a service plan to unlock more account management tools,
                client operations, notifications, and tenant banking features.
              </p>

              <Link
                href="/subscriptions/payment"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-gray-900"
              >
                Subscribe now
                <ArrowRight size={18} />
              </Link>
            </div>

            <div className="rounded-3xl border border-white/20 bg-white/10 p-5 backdrop-blur">
              <h2 className="text-center text-2xl font-bold">Choose Plan</h2>

              <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-white p-2">
                {plans.map((plan) => (
                  <button
                    key={plan.name}
                    onClick={() => setSelectedPlan(plan)}
                    className={`rounded-xl px-3 py-2 text-sm font-semibold ${
                      selectedPlan.name === plan.name
                        ? "bg-tenant text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {plan.name}
                  </button>
                ))}
              </div>

              <div className="mx-auto my-8 flex h-40 w-40 items-center justify-center rounded-full border-8 border-white bg-[radial-gradient(circle,#fff_0%,#fca5a5_35%,#991b1b_70%)] shadow-2xl md:h-52 md:w-52">
                <p className="text-2xl font-extrabold tracking-[0.25em] text-blue-700">
                  Subscribe!
                </p>
              </div>

              <div className="overflow-hidden rounded-2xl border border-white/20 bg-white text-gray-900 shadow-xl">
                <div className="flex items-center justify-between bg-black/80 px-4 py-2 text-sm font-bold text-white">
                  <span>{selectedPlan.name}</span>
                  <span>{selectedPlan.price}</span>
                </div>

                <div className="p-5">
                  <h3 className="text-2xl font-extrabold leading-tight">
                    {selectedPlan.name} Plan: {selectedPlan.description}
                  </h3>

                  <div className="mt-5 space-y-3">
                    {selectedPlan.features.map((feature) => (
                      <div key={feature} className="flex gap-2 text-sm">
                        <CheckCircle
                          size={18}
                          className="shrink-0 text-green-600"
                        />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <button className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold">
                      See all plan features
                    </button>

                    <Link
                      href="/subscriptions/payment"
                      className="flex-1 rounded-xl bg-tenant px-4 py-3 text-center text-sm font-bold text-white"
                    >
                      Subscribe now
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}