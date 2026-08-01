import Image from "next/image";
import Link from "next/link";
import { LogIn, Sparkles } from "lucide-react";

export default function OnboardingStep2() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <Image
        src="/images/onboarding_2.png"
        alt="Take Financial Control"
        fill
        priority
        className="object-cover"
      />

      {/* Mobile */}
      <section className="relative z-10 flex min-h-screen flex-col items-center px-8 py-14 md:hidden">
        <h1 className="mx-auto mt-6 text-center font-sf-condensed text-[48px] leading-[43px] text-[#000000]">
          Take Financial
          <br />
          Control
        </h1>

        <div className="relative mt-14 h-[260px] w-full max-w-[280px]">
          {/* <Image
            src="/images/onboarding-team.png"
            alt="Financial Control"
            fill
            priority
            className="object-contain"
          /> */}
        </div>

        <p className="mx-auto mt-14 max-w-[306px] text-center font-sf-condensed text-[16px] leading-[24px] text-[#1f1f1f]">
          Stay fit with easy transactions, no need for Digital Literacy,
          Unlimited Access, and Fast Response; you're done and get going...
        </p>

        <div className="mb-8 w-full max-w-[320px] space-y-3 flex-just pt-20">
          <Link
            href="/onboarding/step-3"
            className="mx-auto flex h-[36px] w-[273px] items-center justify-center gap-3 rounded-[12px] bg-[#1D4ED8] font-roboto text-[16px] text-white shadow-lg"
          >
            Next
            <LogIn size={14} />
          </Link>

          <Link
            href="/register"
            className="mx-auto flex h-[40px] w-[273px] items-center justify-center gap-3 rounded-[9px] bg-white/35 font-roboto text-[16px] text-[#1F1F1F] backdrop-blur-sm"
          >
            {/* <Sparkles size={20} strokeWidth={2.5} /> */}
            <span>Skip</span>
            <LogIn size={14} />
          </Link>
        </div>
      </section>

      {/* Desktop */}
<section className="hidden md:flex min-h-screen items-center justify-center bg-white overflow-hidden">
  <div className="grid w-full max-w-7xl grid-cols-2 min-h-screen">

    {/* Left Panel — Content */}
    <div className="flex flex-col justify-center px-20 py-20">
      {/* Step indicator */}
      <div className="mb-10 flex items-center gap-3">
        <div className="flex gap-2">
          <span className="h-1.5 w-6 rounded-full bg-[#2458E8]" />
          <span className="h-1.5 w-6 rounded-full bg-[#2458E8]" />
          <span className="h-1.5 w-6 rounded-full bg-gray-200" />
        </div>
        <span className="font-lato text-xs font-semibold uppercase tracking-widest text-[#2458E8]">
          Step 2 of 3
        </span>
      </div>

      {/* Headline */}
      <h1 className="font-sf text-[64px] font-bold leading-[1.1] text-[#0D0D0D]">
        Take Financial
        <br />
        <span className="text-[#2458E8]">Control.</span>
      </h1>

      {/* Subtext */}
      <p className="mt-6 max-w-md font-lato text-[17px] leading-8 text-[#6B7280]">
        Easy transactions, unlimited access, and fast response — no digital
        expertise required.
      </p>

      {/* Feature pills */}
      <div className="mt-8 flex flex-wrap gap-2">
        {["Instant Transfers", "Zero Fees", "Smart Analytics", "24/7 Support"].map(
          (tag) => (
            <span
              key={tag}
              className="rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 font-lato text-[13px] font-medium text-[#4B4B4B]"
            >
              {tag}
            </span>
          )
        )}
      </div>

      {/* CTAs */}
      <div className="mt-12 flex items-center gap-4">
        <Link
          href="/onboarding/step-3"
          className="flex h-[52px] min-w-[160px] items-center justify-center gap-2.5 rounded-xl bg-[#2458E8] px-8 font-sf text-[15px] font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-[#1a47cc]"
        >
          Continue
          <LogIn size={16} />
        </Link>
        <Link
          href="/register"
          className="flex h-[52px] items-center justify-center gap-2 px-6 font-sf text-[15px] font-semibold text-[#6B7280] transition hover:text-[#0D0D0D]"
        >
          Skip for now
          <Sparkles size={15} />
        </Link>
      </div>
    </div>

    {/* Right Panel — Visual */}
    <div className="relative flex items-center justify-center bg-[#F0F5FF] overflow-hidden">

      {/* Background grid pattern */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle, #2458E8 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Floating card: Balance */}
      <div className="absolute top-16 left-10 z-10 rounded-2xl bg-white px-5 py-4 shadow-xl">
        <p className="font-lato text-[11px] font-semibold uppercase tracking-widest text-gray-400">
          Total Balance
        </p>
        <p className="mt-1 font-sf text-[26px] font-bold text-[#0D0D0D]">
          $48,230.00
        </p>
        <p className="mt-0.5 font-lato text-[12px] text-green-500">
          ↑ 12.4% this month
        </p>
      </div>

      {/* Floating card: Quick Send */}
      <div className="absolute bottom-20 right-10 z-10 rounded-2xl bg-[#2458E8] px-5 py-4 shadow-xl">
        <p className="font-lato text-[11px] font-semibold uppercase tracking-widest text-blue-200">
          Quick Send
        </p>
        <div className="mt-3 flex items-center gap-2">
          {["A", "B", "C"].map((l) => (
            <div
              key={l}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 font-sf text-[13px] font-bold text-white"
            >
              {l}
            </div>
          ))}
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 text-white text-xs">
            +5
          </div>
        </div>
        <p className="mt-3 font-lato text-[12px] text-blue-100">
          Tap to transfer instantly
        </p>
      </div>

      {/* Floating card: Recent Transaction */}
      <div className="absolute bottom-48 left-8 z-10 rounded-2xl bg-white px-4 py-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-green-600 text-sm font-bold">
            ↓
          </div>
          <div>
            <p className="font-sf text-[13px] font-semibold text-[#0D0D0D]">
              Received
            </p>
            <p className="font-lato text-[11px] text-gray-400">2 mins ago</p>
          </div>
          <p className="ml-4 font-sf text-[14px] font-bold text-green-500">
            +$320
          </p>
        </div>
      </div>

      {/* Center illustration */}
      <div className="relative z-0 opacity-90">
        {/* <Image
          src="/images/onboarding_step_2.png"
          alt="Financial control illustration"
          width={420}
          height={420}
          className="object-contain drop-shadow-2xl"
        /> */}
      </div>
    </div>
  </div>
</section>
    </main>
  );
}