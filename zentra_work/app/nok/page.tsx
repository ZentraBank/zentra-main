"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, FileText, ShieldCheck } from "lucide-react";

const podItems = [
  {
    id: 1,
    title: "Certified death certificate",
    image: "/images/pod-certificates.png",
    card: true,
  },
  {
    id: 2,
    title: "Your valid ID",
    image: "/images/pod-id.png",
    card: false,
  },
  {
    id: 3,
    title: "Claim form",
    image: "/images/pod-claim-form.png",
    card: true,
  },
];

export default function PodRedemptionPage() {
  return (
    <main className="min-h-screen bg-[#E7EBF0] px-6 pb-10 pt-12 text-[#4A4A4A] lg:flex lg:items-center lg:justify-center lg:px-12 lg:py-16">
      {/* Mobile Layout Wrapper */}
      <section className="mx-auto w-full max-w-[430px] lg:hidden">
        <header className="relative flex items-center justify-center">
          <Link href="/dashboard" className="absolute left-0 text-[#555]">
            <ArrowLeft size={24} />
          </Link>

          <h1 className="font-heading text-[14px] font-bold font-sf-condensed tracking-[0.08em] text-[#1f1f1f]/80">
            POD Redemption
          </h1>
        </header>

        <div className="mt-9 flex justify-center">
          <Image
            src="/images/pod-phone.png"
            alt="POD redemption"
            width={150}
            height={150}
            priority
            className="object-contain"
          />
        </div>

        <div className="mt-10 space-y-6">
          {podItems.map((item) => (
            <div key={item.id}>
              <div
                className={
                  item.card
                    ? "flex h-[143px] items-center justify-end rounded-[8px] bg-white px-5"
                    : "flex h-[115px] items-center justify-center"
                }
              >
                <p className="mt-3 text-[15px] font-medium">
                {item.id}.{" "}
                <span className="ml-2">{item.title}</span>
                </p>
                <Image
                  src={item.image}
                  alt={item.title}
                  width={item.card ? 120 : 115}
                  height={item.card ? 120 : 105}
                  className="object-contain"
                />
                
              </div>
              
            </div>
          ))}
        </div>
          <Link
  href="/nok/claims"
  className="mt-4 flex h-[42px] w-full items-center justify-center rounded-[10px] bg-white text-[13px] font-bold text-[#2458E8] shadow-sm"
>
  View my POD claims
</Link>
        <div className="mt-10 rounded-[6px] border border-[#D8DEE8] bg-white px-4 py-4">
          
  <Link
    href="/nok/death-certificate"
    type="button"
    className="
      flex
      h-[35px]
      w-full
      items-center
      justify-center
      rounded-[12px]
      bg-[#1D4ED8]
      text-[16px]
      font-medium
      font-roboto
      text-white
      shadow-sm
      transition
      active:scale-[0.98]
    "
  >
    Proceed
  </Link>

</div>
      </section>

      {/* Desktop Layout Wrapper */}
      <section className="hidden lg:mx-auto lg:flex lg:w-full lg:max-w-[1200px] lg:flex-col">
        {/* Top Header Bar */}
        <header className="relative mb-10 flex items-center justify-between rounded-[24px] border border-black/5 bg-white/70 px-8 py-6 backdrop-blur-md shadow-sm">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="grid h-10 w-10 place-items-center rounded-full bg-white text-[#4A4A4A] shadow-md transition hover:bg-white/90"
              aria-label="Back to dashboard"
            >
              <ArrowLeft size={20} />
            </Link>

            <div>
              <h1 className="font-heading text-[22px] font-black tracking-tight text-[#1f1f1f]">
                Payable on Death (POD) Redemption Portal
              </h1>
              <p className="mt-0.5 text-xs text-black/50">
                Review required legal documentation, verify credentials, and initiate secure beneficiary claims.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/nok/claims"
              className="flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-xs font-bold text-[#2458E8] shadow-md transition hover:bg-white/90"
            >
              <FileText size={16} />
              View My POD Claims
            </Link>
          </div>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-12 gap-10 items-center rounded-[32px] border border-black/5 bg-white/50 p-10 backdrop-blur-md shadow-xl">
          {/* Left Column: Hero & Phone Illustration */}
          <div className="col-span-5 flex flex-col items-center text-center rounded-[24px] bg-white/70 p-8 border border-black/5 shadow-sm">
            <div className="relative flex justify-center py-6">
              <div className="absolute inset-0 bg-blue-500/5 rounded-full blur-2xl" />
              <Image
                src="/images/pod-phone.png"
                alt="POD redemption"
                width={200}
                height={200}
                priority
                className="relative z-10 object-contain drop-shadow-md"
              />
            </div>

            <h2 className="mt-6 text-xl font-black text-[#1f1f1f]">
              Secure Beneficiary Verification
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-black/60">
              Ensure you have all necessary certified documents ready for upload to fast-track your payable on death redemption claim.
            </p>

            <div className="mt-8 w-full">
              <Link
                href="/nok/death-certificate"
                className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[14px] bg-[#1D4ED8] text-base font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-600 active:scale-[0.99]"
              >
                <ShieldCheck size={18} />
                Proceed with Claim
              </Link>
            </div>
          </div>

          {/* Right Column: Required Items Breakdown */}
          <div className="col-span-7 space-y-6">
            <div>
              <h3 className="text-lg font-black text-[#1f1f1f] mb-2">
                Required Verification Documents
              </h3>
              <p className="text-xs text-black/50 mb-6">
                Please prepare the following items to complete your POD redemption process smoothly:
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {podItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-[20px] bg-white p-5 border border-black/5 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-50 text-[#1D4ED8] font-bold text-sm">
                      {item.id}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#1f1f1f]">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-black/45 mt-0.5">
                        Verified authentic and legally compliant document required.
                      </p>
                    </div>
                  </div>

                  <div className="relative h-16 w-20 shrink-0">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-[16px] bg-emerald-500/10 p-4 border border-emerald-500/20 flex items-center gap-3">
              <CheckCircle2 size={20} className="text-emerald-700 shrink-0" />
              <p className="text-xs font-semibold text-emerald-800">
                All submissions are encrypted under strict bank-grade privacy standards and reviewed by our compliance team.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}