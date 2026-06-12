"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HomeHero() {
  return (
    <>
      {/* ================= MOBILE ================= */}
      <section className="relative h-screen overflow-hidden bg-white md:hidden">

  {/* Text */}
  <div className="pt-14 px-6 text-center">
      <h1 className="text-[46px] font-[540] leading-[40px] tracking-[0.04em] text-blue-700 text-center">
    ZentraBank
    <br />
    Online Banking
  </h1>

    <p className="mx-auto mt-4 w-[308px] text-center text-[18px] font-normal leading-[20px] tracking-[0.02em] text-black">
  Welcome to the one-stop app that can help make your work easier on the
  street - this is the only app where you find so many billing format and
  lots more loading, even as a newbie...
</p>
  </div>

  {/* Hero Artwork */}
  <div className="relative mt-6 h-[534px] w-full">
    <Image
      src="/images/HeroFrame.png"
      alt="Hero Artwork"
      fill
      priority
      className="object-cover object-top"
    />

    {/* Button */}
   <Link
  href="/billingformats"
  className="
    absolute
    left-1/2
    bottom-[120px]
    -translate-x-1/2
    flex
    h-[35px]
    w-[250px]
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
    z-50
  "
>
  <span className="!text-white">See more</span>
  <ArrowRight size={18} className="!text-white" />
</Link>
  </div>

</section>

 
{/* ================= DESKTOP ================= */}
<section className="relative hidden min-h-screen overflow-hidden bg-white md:block">
  <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-2 items-center gap-16 px-12">
    {/* Left */}
    <div className="max-w-xl">
      <p className="mb-5 text-sm font-medium uppercase tracking-[0.28em] text-blue-700">
        Mobile-first online banking
      </p>

      <h1 className="text-[72px] font-medium leading-[0.95] tracking-[-0.04em] text-blue-700 xl:text-[84px]">
        ZentraBank
        <span className="block">Online Banking</span>
      </h1>

      <p className="mt-7 max-w-lg text-[20px] leading-[32px] tracking-[0.01em] text-black/70">
        A clean digital banking experience for billing formats, cards,
        payments, subscriptions and client management.
      </p>

      <Link
        href="/billingformats"
        className="mt-9 inline-flex h-[48px] w-[190px] items-center justify-center gap-3 rounded-[12px] bg-blue-800 text-[15px] font-medium !text-white shadow-sm transition hover:bg-blue-900"
      >
        <span className="!text-white">See more</span>
        <ArrowRight size={17} className="!text-white" />
      </Link>
    </div>

    {/* Right */}
    <div className="relative flex h-[680px] items-center justify-center">
      <div className="absolute h-[520px] w-[520px] rounded-full border border-black/10" />
      <div className="absolute h-[440px] w-[440px] rounded-full bg-blue-700/5" />

      <Image
        src="/images/HeroBlob.png"
        alt="ZentraBank building"
        width={520}
        height={520}
        priority
        className="relative z-10 h-[520px] w-[520px] object-contain drop-shadow-[0_35px_55px_rgba(0,0,0,0.22)]"
      />
    </div>
  </div>
</section>
</>
  );
}

