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
    <h1 className="text-[46px] font-medium leading-[40px] tracking-[0.04em] text-blue-700">
      ZentraBank
      <br />
      Online Banking
    </h1>

    <p className="mx-auto mt-4 w-[308px] text-[18px] leading-[20px] tracking-[0.02em] text-black">
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
      className="object-contain object-top"
    />

    {/* Button */}
    <Link
      href="/billingformats"
      className="
        absolute
        left-1/2
        bottom-[160px]
        -translate-x-1/2
        flex
        h-12
        w-[250px]
        items-center
        justify-center
        gap-2
        rounded-xl
        bg-blue-800
        text-white
      "
    >
      See more
      <ArrowRight size={18} />
    </Link>
  </div>

</section>

      {/* ================= DESKTOP ================= */}
      <section className="relative hidden min-h-screen overflow-hidden bg-white md:block">
        <div className="absolute -right-[260px] -top-[180px] h-[780px] w-[780px] rounded-full bg-blue-700/10 blur-[120px]" />
        <div className="absolute -left-[220px] bottom-[-220px] h-[720px] w-[720px] rounded-full bg-red-700/15 blur-[120px]" />

        <div className="relative z-20 mx-auto grid min-h-screen max-w-7xl grid-cols-2 items-center gap-14 px-10">
          {/* Left */}
          <div>
            <div className="mb-6 inline-flex rounded-full border border-black/10 bg-black/[0.04] px-4 py-2 text-sm font-medium text-black/70">
              Mobile-first online banking
            </div>

            <h1 className="text-[72px] font-semibold leading-[0.95] tracking-[-0.05em] text-blue-700 lg:text-[84px]">
              ZentraBank
              <span className="block">Online Banking</span>
            </h1>

            <p className="mt-6 max-w-xl text-[21px] font-medium leading-[32px] text-black/70">
              Welcome to the one-stop app that helps make your work easier.
              Explore billing formats, payments, cards and subscriptions from
              one clean banking experience.
            </p>

            <Link
              href="/billingformats"
              className="mt-8 inline-flex h-[56px] items-center gap-3 rounded-2xl bg-blue-700 px-8 text-[16px] font-semibold text-white shadow-[0_20px_50px_rgba(29,78,216,0.3)]"
            >
              See more
              <ArrowRight size={18} />
            </Link>
          </div>

          {/* Right */}
          <div className="relative flex h-[720px] items-center justify-center">
            <Image
              src="/images/HeroWave.png"
              alt=""
              width={620}
              height={760}
              priority
              className="absolute right-[-80px] top-[40px] z-10 h-[650px] w-[620px] rounded-[60px] object-cover object-top shadow-[0_40px_100px_rgba(0,0,0,0.16)]"
            />

            <Image
              src="/images/HeroBlob.png"
              alt="ZentraBank building"
              width={520}
              height={520}
              priority
              className="relative z-20 h-[520px] w-[520px] object-contain drop-shadow-[0_40px_70px_rgba(0,0,0,0.35)]"
            />
          </div>
        </div>
      </section>
    </>
  );
}