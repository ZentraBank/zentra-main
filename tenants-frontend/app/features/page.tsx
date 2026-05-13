"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight, Menu, X } from "lucide-react";

export default function BillingFormatsSection() {
  const [menuOpen, setMenuOpen] = useState(false);

  const menuItems = ["Home", "About", "Services", "Contact"];

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-between overflow-hidden"
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
        <h1 className="absolute left-6 top-[104px] w-[345px] text-center font-heading text-[38px] font-semibold leading-[42px] tracking-[1px] text-blue-700 [text-shadow:_0px_1px_0px_rgb(255_255_255_/_1)]">
        Complete Billing formats - Very Simple to use
        </h1>

        {/* Text */}
        <p className="absolute left-[43px] top-[275px] w-[308px] text-center font-body text-[20px] font-semibold leading-[24px] tracking-[0.2px] text-white">
        Next-of-kin, donation, Card, Investment, Account Upgrade, Bill payment,
        Subscriptions and many more...
        </p>

        {/* Middle Image */}
<div className="mt-80 flex justify-center translate-y-10">
  <div className="h-[220px] w-[220px] rounded-full bg-red-600 p-4">
    <Image
      src="/images/billing-formats.png"
      alt="Billing formats"
      width={190}
      height={190}
      className="h-full w-full rounded-full object-cover"
    />
  </div>
</div>

{/* Button */}
<div className="mt-8 flex justify-center pb-10">
  <button className="flex w-[250px] items-center justify-center gap-2.5 rounded-xl bg-blue-800 px-4 py-3 text-white shadow-[inset_0px_0px_4px_rgba(0,0,0,0.10)]">
    <span className="font-roboto text-base font-medium">See more</span>
    <ArrowRight size={18} />
  </button>
</div>
    </section>
  );
}