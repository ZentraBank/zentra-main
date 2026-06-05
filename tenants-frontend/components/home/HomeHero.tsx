"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HomeHero() {
  return (
    <>
      {/* ================= MOBILE ================= */}
      <section className="relative h-[100svh] overflow-hidden bg-white text-center md:hidden">
        <div className="relative z-20 mx-auto max-w-[340px] px-5 pt-[66px]">
          <h1 className="text-[36px] font-semibold leading-[0.92] tracking-[-0.04em] text-blue-700">
            ZentraBank
            <br />
            Online Banking
          </h1>

          <p className="mx-auto mt-4 max-w-[305px] text-[15px] font-medium leading-[17px] text-black">
            Welcome to the one-stop app that can help make your work easier on
            the street - this is the only app where you find so many billing
            format and lots more loading, even as a newbie...
          </p>
        </div>

        <div className="absolute bottom-0 left-0 h-[64vh] w-full">
          <Image
            src="/images/HeroImage1.png"
            alt="ZentraBank building"
            fill
            priority
            className="object-cover object-top"
          />
        </div>

        <Link
          href="/billingformats"
          className="absolute left-1/2 bottom-[105px] z-30 flex h-[48px] w-[230px] -translate-x-1/2 items-center justify-center gap-2 rounded-xl bg-blue-700 text-[15px] font-medium text-white shadow-[0_16px_35px_rgba(0,0,0,0.35)]"
        >
          See more
          <ArrowRight size={17} />
        </Link>
      </section>

      {/* ================= DESKTOP ================= */}
      <section className="relative hidden min-h-screen overflow-hidden bg-white md:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_left_bottom,rgba(220,38,38,0.22),transparent_34%),radial-gradient(circle_at_right_top,rgba(29,78,216,0.18),transparent_34%)]" />

        <div className="relative z-20 mx-auto grid min-h-screen max-w-7xl grid-cols-2 items-center gap-14 px-10">
          <div>
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

          <div className="relative flex justify-center">
            <div className="relative h-[640px] w-[470px] overflow-hidden rounded-[90px] shadow-[0_40px_100px_rgba(0,0,0,0.35)]">
              <Image
                src="/images/HeroImage1.png"
                alt="ZentraBank building"
                fill
                priority
                className="object-cover object-top"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}