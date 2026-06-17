"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function BillingFormatsSection() {
  return (
    <>
      {/* ================= MOBILE ================= */}
<section
  className="relative h-[100svh] overflow-hidden text-center md:hidden"
  style={{
    backgroundImage: "url('/images/Background.png')",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    backgroundPosition: "top right",
  }}
>
  {/* Header */}
  <h1
    className="
      absolute
      left-1/2
      top-[62px]
      w-[345px]
      -translate-x-1/2
      text-center
      text-[40.5652px]
      font-medium
      leading-[40px]
      tracking-[0.04em]
      text-[#1D4ED8]
      [text-shadow:_0px_1px_0px_#FFFFFF]
    "
  >
    Complete Billing
    <br />
    formats - Very
    <br />
    Simple to use
  </h1>

  {/* Description */}
  <p
    className="
      absolute
      left-1/2
      top-[230px]
      w-[308px]
      -translate-x-1/2
      text-center
      text-[18px]
      font-normal
      leading-[20px]
      tracking-[0.02em]
      text-white
    "
  >
    Next-of-kin, donation, Card,
    <br />
    Investment, Account Upgrade, Bill
    <br />
    payment, Subscriptions and many
    <br />
    more...
  </p>

  {/* Hero Image Group */}
<div
  className="
    absolute
    left-1/2
    top-[332px]
    h-[289px]
    w-[289px]
    -translate-x-1/2
  "
>
  {/* Gold Circle with photo already inside */}
  <Image
    src="/images/card.png"
    alt="Billing Formats"
    width={249}
    height={249}
    priority
    className="
  absolute
  left-1/2
  top-1/2
  z-10
  h-[249px]
  w-[249px]
  -translate-x-1/2
  -translate-y-1/2
  object-contain
  brightness-110
  contrast-125
"
  />

  {/* Pink Ring */}
  <Image
    src="/images/ring_color.png"
    alt="Pink Ring"
    fill
    priority
    className="z-20 object-contain"
  />
</div>

  {/* Button */}
  <Link
    href="/subscribesection"
    className="
      absolute
      left-1/2
      top-[655px]
      flex
      h-[35px]
      w-[250px]
      -translate-x-1/2
      items-center
      justify-center
      gap-[10px]
      rounded-[12px]
      bg-[#1E40AF]
      px-[16px]
      py-[8px]
      text-[16px]
      font-medium
      !text-white
      shadow-[inset_0px_0px_4px_rgba(0,0,0,0.1)]
    "
  >
    <span className="!text-white">See more</span>
    <ArrowRight size={18} className="!text-white" />
  </Link>
</section>

      {/* ================= IPAD + DESKTOP ================= */}
      <section
  className="relative hidden min-h-screen overflow-hidden px-8 py-24 md:block"
  style={{
    backgroundImage: "url('/images/Background.png')",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    backgroundPosition: "top right",
  }}
>
        <div className="relative z-20 mx-auto grid min-h-[calc(100vh-120px)] max-w-7xl items-center gap-16 md:grid-cols-2">
          <div className="max-w-2xl">
            <p className="mb-5 text-sm font-medium uppercase tracking-[0.26em] text-white/80">
              Smart billing system
            </p>

            <h1 className="text-[56px] font-medium leading-[0.95] tracking-[-0.03em] text-[#1D4ED8] lg:text-[78px]">
              Complete Billing
              <span className="block">Formats.</span>
              <span className="block text-white">Simple to Use.</span>
            </h1>

            <p className="mt-7 max-w-xl text-[20px] font-medium leading-[32px] text-white/85">
              Next-of-kin, donation, card, investment, account upgrade, bill
              payment, subscriptions and many more formats built into one clean
              banking experience.
            </p>

            <Link
              href="/subscribesection"
              className="
                mt-9
                inline-flex
                h-[48px]
                w-[190px]
                items-center
                justify-center
                gap-3
                rounded-[12px]
                bg-[#1E40AF]
                text-[15px]
                font-medium
                !text-white
                transition
                hover:bg-blue-700
              "
            >
              <span className="!text-white">See more</span>
              <ArrowRight size={17} className="!text-white" />
            </Link>
          </div>

          <div className="relative flex h-[470px] justify-center lg:justify-end">
            <div className="relative h-[470px] w-[470px]">
              <div className="absolute left-1/2 top-1/2 z-10 h-[405px] w-[405px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full">
                <Image
                  src="/images/card.png"
                  alt="Gold Circle"
                  fill
                  priority
                  className="object-cover"
                />

                <Image
                  src="/images/ring_color.png"
                  alt="Billing Formats"
                  fill
                  priority
                  className="object-cover"
                />
              </div>

              {/* <Image
                src="/images/pink-ring.png"
                alt="Pink Ring"
                fill
                priority
                className="relative z-20 object-contain"
              /> */}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}