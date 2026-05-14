"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function BillingFormatsSection() {
  // const menuItems = ["Home", "About", "Services", "Contact"];

  return (
    <>
      {/* ================= MOBILE ================= */}
      <section
        className="relative h-[100svh] overflow-hidden px-6 pt-[92px] text-center md:hidden"
        style={{
          background:
            "radial-gradient(ellipse 131.15% 204.96% at 0% 100%, #BBBBBB 11%, rgba(255, 0, 0, 0.60) 66%, rgba(0, 0, 0, 0.10) 100%)",
        }}
      >
        <h1 className="mx-auto mt-4 max-w-[340px] text-[36px] font-semibold leading-[1.1] tracking-[-0.02em] text-blue-700 [text-shadow:_0px_1px_0px_rgb(255_255_255_/_1)]">
          Complete Billing formats - Very Simple to use
        </h1>

        <p className="mx-auto mt-5 max-w-[310px] text-[16px] font-medium leading-[23px] text-white">
          Next-of-kin, donation, Card, Investment, Account Upgrade, Bill
          payment, Subscriptions and many more...
        </p>

        <div className="mt-9 flex justify-center">
          <div className="h-[185px] w-[185px] rounded-full bg-red-600 p-3 shadow-[0_18px_45px_rgba(0,0,0,0.18)]">
            <Image
              src="/images/billing-formats.png"
              alt="Billing formats"
              width={160}
              height={160}
              className="h-full w-full rounded-full object-cover"
            />
          </div>
        </div>

        <div className="mt-7 flex justify-center">
          <Link
            href="/features/subscribesection"
            className="flex w-[230px] items-center justify-center gap-2.5 rounded-xl bg-blue-800 px-4 py-3 text-white transition hover:bg-blue-700"
          >
            <span className="text-[15px] font-medium">See more</span>
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      {/* ================= IPAD + DESKTOP ================= */}
      <section
        className="relative hidden min-h-screen overflow-hidden px-8 py-25 md:block"
        style={{
          background:
            "radial-gradient(ellipse 90% 120% at 0% 100%, #d7d7d7 0%, rgba(255,0,0,0.72) 48%, rgba(5,10,30,0.95) 100%)",
        }}
      >
        <div className="absolute -right-32 top-20 h-[420px] w-[420px] rounded-full bg-blue-700/30 blur-[110px]" />
        <div className="absolute -bottom-24 left-20 h-[360px] w-[360px] rounded-full bg-red-500/35 blur-[100px]" />

        {/* <nav className="relative z-30 mx-auto flex max-w-7xl items-center justify-between rounded-3xl border border-white/20 bg-white/85 px-6 py-4 shadow-[0_20px_70px_rgba(0,0,0,0.12)] backdrop-blur-xl">
          <span className="text-lg font-semibold text-black">ZentraBank</span>

          <div className="flex items-center gap-8">
            {menuItems.map((item) => (
              <button
                key={item}
                className="text-sm font-medium text-black/70 transition hover:text-red-600"
              >
                {item}
              </button>
            ))}
          </div>

          <Link
            href="/subscribe"
            className="rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5"
          >
            Get Started
          </Link>
        </nav> */}

        <div className="relative z-20 mx-auto grid min-h-[calc(100vh-120px)] max-w-7xl items-center gap-12 md:grid-cols-2">
          <div className="max-w-2xl pt-10">
            <div className="mb-6 inline-flex rounded-full border border-white/25 bg-white/15 px-4 py-2 text-sm font-medium text-white backdrop-blur-md">
              Smart billing system
            </div>

            <h1 className="text-[54px] font-semibold leading-[1.02] tracking-[-0.04em] text-white lg:text-[76px]">
              Complete Billing Formats.
              <span className="block text-blue-700 drop-shadow-[0_2px_0_rgba(255,255,255,0.55)]">
                Simple to Use.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-[19px] font-medium leading-[32px] text-white/85 lg:text-[21px]">
              Next-of-kin, donation, card, investment, account upgrade, bill
              payment, subscriptions and many more formats built into one clean
              banking experience.
            </p>

            <div className="mt-9 flex items-center gap-4">
              <Link
                href="/features/subscribesection"
                className="flex items-center gap-3 rounded-2xl bg-blue-800 px-7 py-4 text-[16px] font-semibold text-white shadow-[0_20px_50px_rgba(30,64,175,0.35)] transition hover:-translate-y-1 hover:bg-blue-700"
              >
                See more
                <ArrowRight size={19} />
              </Link>

              <div className="rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-left backdrop-blur-md">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                  Included
                </p>
                <p className="text-sm font-semibold text-white">
                  8+ billing formats
                </p>
              </div>
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <div className="absolute h-[430px] w-[430px] rounded-full border border-white/20 bg-white/10 backdrop-blur-md lg:h-[560px] lg:w-[560px]" />

            <div className="relative h-[360px] w-[360px] rounded-full bg-gradient-to-br from-red-600 via-red-500 to-blue-900 p-5 shadow-[0_35px_100px_rgba(0,0,0,0.35)] lg:h-[470px] lg:w-[470px]">
              <Image
                src="/images/billing-formats.png"
                alt="Billing formats"
                width={500}
                height={500}
                priority
                className="h-full w-full rounded-full object-cover"
              />
            </div>

            <div className="absolute -left-4 top-12 rounded-3xl border border-white/20 bg-white/15 px-5 py-4 text-white shadow-xl backdrop-blur-xl lg:left-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
                Fast
              </p>
              <p className="text-lg font-semibold">Ready formats</p>
            </div>

            <div className="absolute bottom-8 right-0 rounded-3xl border border-white/20 bg-black/30 px-5 py-4 text-white shadow-xl backdrop-blur-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
                Secure
              </p>
              <p className="text-lg font-semibold">Banking flow</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}