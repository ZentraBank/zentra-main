"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight, Menu, X } from "lucide-react";

export default function BillingFormatsSection() {
  const [menuOpen, setMenuOpen] = useState(false);

  const menuItems = ["Home", "About", "Services", "Contact"];

  return (
    <section
        className="relative min-h-[100svh] overflow-hidden px-6 pt-[92px] text-center"
        style={{
            background:
            "radial-gradient(ellipse 131.15% 204.96% at 0% 100%, #BBBBBB 11%, rgba(255, 0, 0, 0.60) 66%, rgba(0, 0, 0, 0.10) 100%)",
        }}
        >
      {/* Navbar */}
      <div className="absolute left-0 top-0 z-30 w-full rounded-b-lg bg-white px-6 py-3">
        <div className="flex items-center justify-between">
          <span className="font-lato text-sm font-bold text-black/80">
            ZentraBank
          </span>

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-black/5 text-black/80"
            aria-label="Open menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {menuOpen && (
          <div className="mt-4 flex flex-col gap-2 border-t border-black/10 pt-3">
            {menuItems.map((item) => (
              <button
                key={item}
                type="button"
                className="rounded-lg px-3 py-2 text-left font-lato text-sm font-semibold text-black/80 hover:bg-black/5"
              >
                {item}
              </button>
            ))}
          </div>
        )}
      </div>
      {/* Heading */}
        <h1 className="mx-auto max-w-[345px] font-heading text-[32px] font-semibold leading-[38px] tracking-[0.5px] text-blue-700 [text-shadow:_0px_1px_0px_rgb(255_255_255_/_1)]">
        Complete Billing formats - Very Simple to use
        </h1>

        <p className="mx-auto mt-5 max-w-[320px] font-body text-[17px] font-semibold leading-[24px] text-white">
        Next-of-kin, donation, Card, Investment, Account Upgrade, Bill payment,
        Subscriptions and many more...
        </p>

        <div className="mt-10 flex justify-center">
        <div className="h-[200px] w-[200px] rounded-full bg-red-600 p-4">
            <Image
            src="/images/billing-formats.png"
            alt="Billing formats"
            width={180}
            height={180}
            className="h-full w-full rounded-full object-cover"
            />
        </div>
        </div>

        <div className="mt-7 flex justify-center pb-8">
        <button className="flex w-[250px] items-center justify-center gap-2.5 rounded-xl bg-blue-800 px-4 py-3 text-white">
            <span className="font-roboto text-base font-medium">See more</span>
            <ArrowRight size={18} />
        </button>
        </div>
    </section>
  );
}