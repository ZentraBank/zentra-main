"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

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
    href: "/investments/digital-assets",
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
    <main className="relative min-h-[100svh] overflow-hidden bg-black text-white">
      <Image
        src="/images/Background_1.png"
        alt="Investment management background"
        fill
        priority
        className="object-cover object-center"
      />

      <div className="absolute inset-0 bg-black/5" />

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[430px] flex-col px-3 pb-5 pt-10">
        <header className="relative flex items-center justify-center">
          <Link
            href="/dashboard"
            aria-label="Go back"
            className="absolute left-0 flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/10"
          >
            <ArrowLeft size={20} />
          </Link>

          <p className="font-sf-condensed text-[12px] font-bold tracking-[0.08em]">
            Investments Management
          </p>
        </header>

        <section className="mt-5 text-center">
          <h1 className="font-sf-condensed text-[39px] font-semibold leading-[0.98] tracking-[-0.8px]">
            Investment
            <br />
            Management
          </h1>

          <p className="mx-auto mt-5 max-w-[320px] font-lato text-[14px] font-medium leading-[17px] text-white">
            Control all this client&apos;s investment which they have made
            through our site, and determine when, how much, and how you get paid
            from them.
          </p>
        </section>

        <section className="mx-auto mt-5 w-full max-w-[370px] h-[429px] overflow-hidden rounded-[8px] bg-white p-2 text-[#1F1F1F] shadow-[0_7px_20px_rgba(0,0,0,0.3)]">
          <div className="rounded-[7px] bg-[#AEB0B0] p-2 max-w-[362px]">
            <h2 className="mb-2 font-sf-condensed text-[14px] font-black tracking-[0.04em] text-[#222]">
              Gregory Winter&apos;s Investments
            </h2>

            <div className="space-y-2">
              {investments.map((investment) => (
                <Link
                  key={`${investment.title}-${investment.subtitle}`}
                  href={investment.href}
                  className="group flex min-h-[48px] items-center gap-3 rounded-[8px] bg-gradient-to-b from-[#B70707] to-[#850000] px-2 py-1.5 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_2px_4px_rgba(0,0,0,0.25)] transition hover:brightness-110 active:scale-[0.99]"
                >
                  <div className="relative h-[40px] w-[40px] shrink-0 overflow-hidden rounded-[7px] border border-white/20">
                    <Image
                      src={investment.image}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate font-sf-condensed text-[16px] font-black leading-[17px] tracking-[0.02em]">
                      {investment.title}
                    </h3>

                    <p className="mt-1 truncate font-lato text-[11px] leading-[13px] text-white">
                      {investment.subtitle}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <p className="py-4 text-center font-lato text-[13px] font-medium text-[#222]">
            You&apos;re all caught up!
          </p>

          <Link
            href="/investments/all"
            className="mx-auto mb-3 flex h-[34px] w-[298px] items-center justify-center gap-3 rounded-[10px] bg-[#294CC9] font-roboto text-[15px] font-medium text-white transition hover:bg-[#1E40AF] active:scale-[0.98]"
          >
            View more
            <ArrowRight size={18} />
          </Link>
        </section>
      </div>
    </main>
  );
}