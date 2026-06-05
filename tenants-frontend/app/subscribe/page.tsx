import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Crown, ShieldCheck, Sparkles } from "lucide-react";

export default function SubscribePage() {
  return (
    <main className="relative min-h-[100svh] overflow-hidden bg-black text-white">
      {/* Background */}
      <Image
        src="/images/Background.png"
        alt="Subscribe background"
        fill
        priority
        className="object-cover"
      />

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[430px] flex-col px-4 pb-8 pt-[76px] text-center md:max-w-[720px] md:px-8 md:pt-14 lg:max-w-6xl lg:px-10 lg:pt-16">
        {/* Back */}
        <Link
          href="/dashboard"
          className="absolute left-4 top-[95px] z-30 inline-flex text-white md:left-8 md:top-[110px] lg:left-10 lg:top-10"
        >
          <ArrowLeft size={20} />
        </Link>

        {/* MOBILE + TABLET VERSION */}
        <div className="lg:hidden">
          <h1 className="font-heading text-[36px] font-semibold leading-none tracking-[1.5px] text-blue-700 [text-shadow:_0px_1px_0px_rgb(255_255_255_/_1)] md:text-[56px]">
            Subscribe!
          </h1>

          <p className="mx-auto mt-8 max-w-[315px] text-[13px] font-medium leading-[17px] text-white md:mt-10 md:max-w-[520px] md:text-[18px] md:leading-[28px]">
            You can edit what the client sees in their ZentraBank account such
            as, money transfer receipt, account balance, next-of-kin details,
            donations, etc... You can serve as your client’s bank manager and
            also control all that happens to your clients account.
          </p>

          <p className="mt-5 text-[13px] font-medium md:text-[18px]">
            Subscribe to get started!
          </p>

          <section className="mt-6 overflow-hidden rounded-xl border border-blue-500 bg-white text-black shadow-[0_0_10px_rgba(37,99,235,0.85)] md:mx-auto md:mt-8 md:w-full md:max-w-[560px] md:rounded-2xl">
            <h2 className="pt-1 text-[20px] font-extrabold leading-6 md:pt-3 md:text-[30px]">
              Choose Plan
            </h2>

            <div className="grid grid-cols-3 gap-2 px-4 pb-2 md:px-8 md:pb-4 md:pt-2">
              {["Read", "Unread", "Personal"].map((item, index) => (
                <button
                  key={item}
                  className={`h-6 rounded-md text-[11px] font-medium md:h-10 md:rounded-xl md:text-[15px] ${
                    index === 0
                      ? "bg-blue-700 text-white"
                      : "bg-gray-400 text-black"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </section>

          <div className="relative mt-7 flex justify-center md:mt-12">
            <Image
              src="/images/ring1.png"
              alt="Subscribe ring"
              width={270}
              height={270}
              priority
              className="h-[245px] w-[245px] object-contain md:h-[360px] md:w-[360px]"
            />
          </div>

          <div className="mt-8 flex justify-center md:mt-10">
            <Link
              href="/subscribe/checkout"
              className="flex w-[245px] items-center justify-center gap-3 rounded-xl bg-blue-700 px-4 py-3 text-[14px] font-bold text-white shadow-[0_10px_25px_rgba(0,0,0,0.25)] md:w-[340px] md:rounded-2xl md:py-4 md:text-[18px]"
            >
              Subscribe now
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        {/* DESKTOP VERSION */}
        <div className="hidden min-h-[calc(100svh-100px)] items-center lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          {/* Left */}
          <section className="text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/80 backdrop-blur">
              <Sparkles size={16} />
              Premium account control
            </div>

            <h1 className="mt-6 max-w-[560px] font-heading text-[72px] font-semibold leading-[76px] tracking-[-1.5px] text-blue-500 [text-shadow:_0px_1px_0px_rgb(255_255_255_/_0.8)]">
              Subscribe to unlock ZentraBank
            </h1>

            <p className="mt-6 max-w-[580px] text-[18px] font-medium leading-[30px] text-white/80">
              Edit what the client sees in their ZentraBank account, including
              money transfer receipts, account balance, next-of-kin details,
              donations, and more.
            </p>

            <div className="mt-8 grid max-w-[560px] grid-cols-3 gap-3">
              {[
                { icon: Crown, title: "Premium", desc: "Unlock all tiers" },
                { icon: ShieldCheck, title: "Control", desc: "Manage clients" },
                { icon: Sparkles, title: "Fast", desc: "Instant access" },
              ].map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-white/10 bg-white/[0.08] p-4 backdrop-blur"
                >
                  <Icon size={22} className="text-blue-300" />
                  <h3 className="mt-3 text-base font-bold">{title}</h3>
                  <p className="mt-1 text-sm text-white/55">{desc}</p>
                </div>
              ))}
            </div>

            <Link
              href="/subscribe/checkout"
              className="mt-10 inline-flex h-14 w-[260px] items-center justify-center gap-3 rounded-2xl bg-blue-700 text-[16px] font-bold text-white shadow-[0_14px_35px_rgba(0,0,0,0.35)] transition hover:bg-blue-800"
            >
              Subscribe now
              <ArrowRight size={20} />
            </Link>
          </section>

          {/* Right */}
          <section className="rounded-[34px] border border-white/15 bg-white/[0.08] p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <h2 className="text-[32px] font-extrabold text-white">
              Choose Plan
            </h2>

            <div className="mt-5 grid grid-cols-3 gap-3 rounded-2xl bg-white p-3">
              {["Read", "Unread", "Personal"].map((item, index) => (
                <button
                  key={item}
                  className={`h-12 rounded-xl text-[15px] font-bold ${
                    index === 0
                      ? "bg-blue-700 text-white"
                      : "bg-gray-300 text-black"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="mt-10 flex justify-center">
              <Image
                src="/images/ring1.png"
                alt="Subscribe ring"
                width={430}
                height={430}
                priority
                className="h-[430px] w-[430px] object-contain drop-shadow-[0_20px_45px_rgba(0,0,0,0.45)]"
              />
            </div>

            <p className="mx-auto mt-6 max-w-[430px] text-[15px] leading-6 text-white/65">
              Select a package, confirm your plan, and activate your
              subscription instantly.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}