"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HomeHero() {
  return (
    <>
      {/* ================= MOBILE ================= */}
      <section className="relative min-h-screen overflow-hidden bg-white md:hidden">
        <div className="relative z-20 px-5 pt-[62px] text-center">
          <h1 className="font-heading text-[38px] font-bold leading-[33px] tracking-[-0.03em] text-[#1D4ED8] pt-4">
            ZentraBank
            <br />
            Online Banking
          </h1>

          <p className="mx-auto mt-3 max-w-[320px] font-lato text-[14px] font-medium leading-[24px] tracking-[-0.01em] text-black/95 pt-8">
            Welcome to the one-stop app that can help make your work easier on
            the street - this is the only app where you find so many billing
            format and lots more loading, even as a newbie...
          </p>
        </div>

        {/* Background artwork image */}
        <div className="absolute inset-x-0 bottom-0 h-full w-full overflow-hidden">
          <Image
            src="/images/HeroImage.png"
            alt="ZentraBank hero background"
            fill
            priority
            className="object-cover object-top"
          />
        </div>

        <Link
          href="/billingformats"
          className="
            absolute
            left-1/2
            bottom-[112px]
            z-30
            flex
            h-[35px]
            w-[250px]
            -translate-x-1/2
            items-center
            justify-center
            gap-3
            rounded-[12px]
            bg-[#1E40AF]
            text-[14px]
            font-semibold
            !text-white
            shadow-[0_8px_18px_rgba(36,88,232,0.32)]
          "
        >
          <span>See more</span>
          <ArrowRight size={17} />
        </Link>
      </section>

      {/* ================= DESKTOP ================= */}
      <section className="relative hidden min-h-screen overflow-hidden bg-white md:block">
        <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-2 items-center gap-12 px-12">
          <div className="relative z-20 max-w-xl">
            <h1 className="font-heading text-[72px] font-bold leading-[0.9] tracking-[-0.04em] text-[#2458E8] xl:text-[84px]">
              ZentraBank
              <span className="block">Online Banking</span>
            </h1>

            <p className="mt-6 max-w-lg text-[20px] font-medium leading-[30px] text-black/75">
              Welcome to the one-stop app that can help make your work easier
              on the street. Find billing formats, subscriptions, cards,
              payments and more.
            </p>

            <Link
              href="/billingformats"
              className="
                mt-8
                inline-flex
                h-[48px]
                w-[210px]
                items-center
                justify-center
                gap-3
                rounded-[12px]
                bg-[#1E40AF]
                text-[16px]
                font-semibold
                !text-white
                shadow-[0_14px_28px_rgba(36,88,232,0.28)]
                transition
                hover:bg-[#1d48c7]
              "
            >
              <span>See more</span>
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="relative h-[700px] w-full">
            <Image
              src="/images/HeroFrame.png"
              alt="ZentraBank hero"
              fill
              priority
              className="object-contain object-center drop-shadow-[0_35px_55px_rgba(0,0,0,0.25)]"
            />
          </div>
        </div>
      </section>
    </>
  );
}