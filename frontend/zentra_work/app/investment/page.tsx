"use client";

import Image from "next/image";
import Link from "next/link";
import { LogIn } from "lucide-react";

export default function InvestmentIntroPage() {
  return (
    <main
      className="relative min-h-screen overflow-hidden bg-[#1b8a4d] text-[#24302b]"
      style={{
        backgroundImage: "url('/images/investment-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <section className="relative mx-auto flex min-h-screen w-full max-w-[430px] flex-col items-center px-6 pb-10 pt-[72px] text-center">
        <h1 className="max-w-[340px] font-heading text-[28px] font-black leading-[31px] tracking-[-0.02em] text-[#25312d]">
          Turn Your Money Into Meaning.
        </h1>

        <div className="relative mt-[70px] h-[234px] w-[314px]">
          <Image
            src="/images/investment-hero.png"
            alt="Investment money illustration"
            
            fill
            priority
            className="object-contain"
          />
        </div>

        <div className="mt-[82px] max-w-[350px]">
          <p className="text-[15px] font-medium leading-[17px]">
            Welcome to the part or life where you money become a money making
            machine.
          </p>

          <p className="mt-4 text-[15px] font-medium leading-[17px]">
            We build your future’s finance ranging for monthly savings,{" "}
            <span className="font-black">Charity &amp; Impact Investments</span>,{" "}
            <span className="font-black">
              Peer-to-Peer (P2P) Investments etc...
            </span>
          </p>
        </div>

        <div className="mt-auto w-full px-6">
          <Link
            href="/investment/investment-types"
            className="mx-auto flex h-[32px] w-full max-w-[273px] items-center justify-center gap-3 rounded-[9px] bg-[#1D4ED8] text-[14px] font-bold text-white shadow-lg transition active:scale-[0.98]"
          >
            Invest now
            <LogIn size={16} />
          </Link>
        </div>
      </section>
    </main>
  );
}