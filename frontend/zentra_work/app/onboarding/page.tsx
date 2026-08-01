import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  CreditCard,
  LogIn,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";

export default function OnboardingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#8FC4A8]">
      <Image
        src="/images/onboarding-bg.png"
        alt="Online banking"
        fill
        priority
        className="object-cover"
      />

      {/* Mobile */}
      <section className="relative z-10 flex min-h-screen flex-col items-center justify-between px-8 py-16 md:hidden">
        <div className="pt-4 text-center">
          <h1 className="font-sf-condensed text-[48px] leading-[43px] text-white">
            1-Stop Online
            <br />
            Banking
          </h1>
        </div>

        <div className="mb-8 w-full max-w-[320px] space-y-3 flex-just">
          <Link
            href="/onboarding/step-2"
            className="mx-auto flex h-[36px] w-[273px] items-center justify-center gap-3 rounded-[12px] bg-[#1D4ED8] font-roboto text-[16px] text-white shadow-lg"
          >
            Next
            <LogIn size={14} />
          </Link>

          <Link
            href="/"
            className="mx-auto flex h-[40px] w-[273px] items-center justify-center gap-3 rounded-[9px] bg-white/35 font-roboto text-[16px] text-[#1F1F1F] backdrop-blur-sm"
          >
            <Sparkles size={20} strokeWidth={2.5} />
            <span>Skip</span>
            <LogIn size={14} />
          </Link>
        </div>
      </section>

      {/* Desktop */}
<section className="relative z-10 hidden min-h-screen items-center justify-center md:flex">
  <div className="relative h-[740px] w-[390px] overflow-hidden rounded-[34px] shadow-2xl">
    <Image
      src="/images/onboarding-bg.png"
      alt="Online banking"
      fill
      priority
      className="object-cover"
    />

    <div className="relative z-10 flex h-full flex-col items-center justify-between px-8 py-16">
      <div className="pt-4 text-center">
        <h1 className="font-sf-condensed text-[48px] font-bold leading-[37px] text-white">
          1-Stop Online
          <br />
          Banking
        </h1>
      </div>

     <div className="relative z-20 mb-8 w-full max-w-[320px] space-y-3">
  <Link
    href="/onboarding/step-2"
    className="flex h-[48px] w-full items-center justify-center gap-3 rounded-[9px] bg-[#2458E8] font-sf text-[15px] font-bold text-white shadow-lg"
  >
    Next
    <LogIn size={17} />
  </Link>

  <Link
    href="/register"
    className="flex h-[48px] w-full items-center justify-center gap-3 rounded-[9px] bg-white/35 font-sf-condensed text-[15px] font-bold text-[#2E8B57] backdrop-blur-sm"
  >
    <Sparkles size={16} strokeWidth={2.5} />
    <span>Skip</span>
    <LogIn size={17} />
  </Link>
</div>
    </div>
  </div>
</section>
    </main>
  );
}