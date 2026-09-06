"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, TrendingUp, ShieldCheck, Sparkles } from "lucide-react";
import AppShell from "@/components/layout/AppShell";

const investments = [
  {
    title: "Gift & Reward-Based",
    subtitle: "Gift Cards with Cashback/Rewards",
    image: "/images/investments-1.png",
    href: "/investments/gift-reward",
  },
  {
    title: "Gift & Reward-Based",
    subtitle: "Savings Goals for Others",
    image: "/images/investments-2.png",
    href: "/investments/savings-goals",
  },
  {
    title: "Digital Asset",
    subtitle: "Charity-Linked Digital Assets",
    image: "/images/investments-3.png",
    href: "/investments/charity-impact",
  },
  {
    title: "Sustainable & Ethical",
    subtitle: "Green Investment Funds",
    image: "/images/investments-1.png",
    href: "/investments/green-funds",
  },
];

export default function InvestmentManagementPage() {
  return (
    <AppShell>
      <main className="mx-auto max-w-5xl px-4 py-8 text-neutral-900 md:px-8">
        <div className="flex flex-col gap-6">
          <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 transition hover:text-neutral-700"
              >
                <ArrowLeft size={17} />
                Back to dashboard
              </Link>

              <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-neutral-200">
                Portfolio Management
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight text-neutral-300 md:text-4xl">
                Investment Portfolios
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-neutral-300">
                Control and monitor all client investments made through the platform, tracking yields and payout configurations.
              </p>
            </div>
          </header>

          <section className="mt-4 overflow-hidden rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6 md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-neutral-100 pb-6">
              <div className="flex items-center gap-4 min-w-0">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600 shadow-xs">
                  <TrendingUp size={28} />
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl font-bold text-neutral-900 truncate">
                    Gregory Winter&apos;s Investments
                  </h2>
                  <p className="text-xs font-medium text-neutral-500 mt-0.5 truncate">
                    Active client portfolio and active allocation streams
                  </p>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 self-start md:self-auto">
                <ShieldCheck size={14} />
                Verified Portfolios
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {investments.map((investment) => (
                <Link
                  key={`${investment.title}-${investment.subtitle}`}
                  href={investment.href}
                  className="group flex items-center gap-3 sm:gap-4 rounded-2xl border border-neutral-200 bg-neutral-50/50 p-4 transition hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-sm"
                >
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xs">
                    <Image
                      src={investment.image}
                      alt=""
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-blue-600 truncate">
                      {investment.title}
                    </p>
                    <h3 className="mt-0.5 text-sm sm:text-base font-bold text-neutral-900 line-clamp-2">
                      {investment.subtitle}
                    </h3>
                  </div>

                  <ArrowRight size={18} className="shrink-0 text-neutral-400 transition-transform group-hover:translate-x-1 group-hover:text-blue-600" />
                </Link>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
              <div className="flex items-center gap-3 text-sm text-neutral-600 font-medium">
                <Sparkles size={18} className="text-amber-500 shrink-0" />
                <span>All portfolio records and asset distributions are fully synchronized.</span>
              </div>

              {/* <Link
                href="/investments/all"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.99] shrink-0"
              >
                View full directory
                <ArrowRight size={17} />
              </Link> */}
            </div>
          </section>
        </div>
      </main>
    </AppShell>
  );
}