"use client";

  import Image from "next/image";
  import Link from "next/link";
  import { LogIn, ArrowLeft, TrendingUp, ShieldCheck, Zap } from "lucide-react";

  export default function InvestmentIntroPage() {
    return (
      <main
        className="relative min-h-screen overflow-hidden bg-[#1b8a4d] text-[#24302b] lg:flex lg:items-center lg:justify-center lg:px-12 lg:py-16"
        style={{
          backgroundImage: "url('/images/investment-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Mobile Layout Wrapper */}
        <section className="relative mx-auto flex min-h-screen w-full max-w-[430px] flex-col items-center px-6 pb-10 pt-[72px] text-center lg:hidden">
          <h1 className="max-w-[340px] font-heading text-[28px] font-black leading-[31px] tracking-[-0.02em] text-[#25312d]">
            Turn Your Money Into Meaning.
          </h1>
          <Link
              href="/dashboard"
              aria-label="Go back"
              className="absolute left-0 top-6 flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/10"
            >
              <ArrowLeft size={20} />
            </Link>

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

          <div className="mt-auto w-full px-6 pt-6">
            <Link
              href="/investment/investment-types"
              className="mx-auto flex h-[44px] w-full max-w-[273px] items-center justify-center gap-3 rounded-[9px] bg-[#1D4ED8] text-[14px] font-bold text-white shadow-lg transition active:scale-[0.98]"
            >
              Invest now
              <LogIn size={16} />
            </Link>
          </div>
        </section>

        {/* Desktop Layout Wrapper */}
        <section className="hidden lg:mx-auto lg:flex lg:w-full lg:max-w-[1200px] lg:flex-col">
          {/* Top Bar Header */}
          <header className="relative mb-12 flex items-center justify-between rounded-[24px] border border-white/20 bg-white/10 px-8 py-6 backdrop-blur-md shadow-lg">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                aria-label="Go back"
                className="grid h-10 w-10 place-items-center rounded-full bg-white text-[#1b8a4d] shadow-md transition hover:bg-white/90"
              >
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="font-heading text-[22px] font-black tracking-tight text-white">
                  ZentraWealth & Investment Portal
                </h1>
                <p className="mt-0.5 text-xs text-white/80">
                  Secure your financial freedom with structured wealth vehicles and impact portfolios.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/investment/investment-types"
                className="flex h-11 items-center gap-2 rounded-full bg-[#1D4ED8] px-6 text-sm font-bold text-white shadow-md transition hover:bg-blue-600"
              >
                Get Started
                <LogIn size={16} />
              </Link>
            </div>
          </header>

          {/* Main Content Grid */}
          <div className="grid grid-cols-12 gap-10 items-center rounded-[32px] border border-white/20 bg-white/40 p-12 backdrop-blur-lg shadow-2xl">
            {/* Left Column: Hero & Imagery */}
            <div className="col-span-6 flex flex-col items-center text-center lg:items-start lg:text-left">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-[#1b8a4d] shadow-xs mb-6">
                <TrendingUp size={14} /> Wealth Generation Suite
              </span>

              <h2 className="font-heading text-[44px] font-black leading-[1.1] tracking-tight text-[#25312d]">
                Turn Your Money Into Meaning.
              </h2>

              <p className="mt-6 text-base font-medium leading-relaxed text-[#24302b]/80">
                Welcome to the part of life where your money becomes a money-making machine. We build your future’s finance ranging from monthly savings, <strong className="text-[#25312d]">Charity & Impact Investments</strong>, to <strong className="text-[#25312d]">Peer-to-Peer (P2P) Investments</strong>.
              </p>

              {/* Feature Highlights */}
              <div className="mt-8 grid grid-cols-2 gap-4 w-full">
                <div className="flex items-start gap-3 rounded-[16px] bg-white/60 p-4 border border-black/5">
                  <ShieldCheck size={22} className="text-[#1b8a4d] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold text-[#25312d]">Bank-Grade Security</h3>
                    <p className="text-[11px] text-black/60 mt-0.5">Fully audited and regulated portfolio protection.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-[16px] bg-white/60 p-4 border border-black/5">
                  <Zap size={22} className="text-[#1D4ED8] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold text-[#25312d]">High Yield Returns</h3>
                    <p className="text-[11px] text-black/60 mt-0.5">Optimized compounding for maximum growth.</p>
                  </div>
                </div>
              </div>

              <div className="mt-10 flex items-center gap-4 w-full">
                <Link
                  href="/investment/investment-types"
                  className="flex h-[52px] w-full max-w-[280px] items-center justify-center gap-3 rounded-[14px] bg-[#1D4ED8] text-base font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-600 active:scale-[0.99]"
                >
                  Invest now
                  <LogIn size={18} />
                </Link>
              </div>
            </div>

            {/* Right Column: Hero Illustration */}
            <div className="col-span-6 flex justify-center">
              <div className="relative h-[380px] w-full max-w-[480px]">
                <div className="absolute inset-0 bg-white/20 rounded-full blur-3xl" />
                <Image
                  src="/images/investment-hero.png"
                  alt="Investment money illustration"
                  fill
                  priority
                  className="relative z-10 object-contain drop-shadow-xl"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }