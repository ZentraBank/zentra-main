import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, CheckCircle2, Gem } from "lucide-react";

const features = [
  "Edit your client’s account balance",
  "Send a fake transaction to your clients",
  "Collect your client’s original credit card details",
  "Edit the transfer receipts that you’ve already sent",
  "Serve your own clients as their bank manager in-app",
  "Manipulate the transaction status of your clients account",
  "Become listed as a Funds Donator and get picked by our clients for funds request",
  "Send out multiple domain as our website address",
  "Work next-of-kin and bill your client",
  "Work donation and bill your client",
  "Work “gifted funds” and bill your client",
  "Push a notification to make your clients take action",
  "Work “Investment” and bill client",
];

const highlights = [
  "Account balance editing",
  "Transaction management",
  "Notification system",
  "Donation controls",
  "Investment controls",
];

export default function PlanFeaturesPage() {
  return (
    <main className="relative min-h-[100svh] overflow-hidden bg-black text-white">
      <Image
        src="/images/Background.png"
        alt="Background"
        fill
        priority
        className="object-cover"
      />

      <div className="relative z-10 mx-auto max-w-[430px] px-4 pb-10 pt-[135px] lg:max-w-7xl lg:px-10 lg:pt-16">
        <Link
          href="/subscribe/diamond"
          className="mb-2 inline-flex h-6 w-6 items-center justify-center rounded-sm bg-black/60 text-white lg:absolute lg:left-10 lg:top-10 lg:h-10 lg:w-10 lg:rounded-xl lg:bg-white/10 lg:backdrop-blur"
        >
          <ArrowLeft size={17} />
        </Link>

        {/* MOBILE DESIGN */}
        <div className="lg:hidden">
          <div className="flex h-5 items-center justify-between bg-emerald-700 px-2 text-[11px] font-bold text-white">
            <span>Diamond</span>
            <span>$40</span>
          </div>

          <section className="rounded-b-xl bg-white px-4 py-2 text-black shadow-[0_0_8px_rgba(37,99,235,0.85)]">
            <ul className="list-disc space-y-1 pl-4 text-[12px] font-medium leading-[17px]">
              {features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </section>
        </div>

        {/* DESKTOP DESIGN */}
        <div className="hidden min-h-[calc(100svh-120px)] items-center lg:grid lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">
          {/* Left */}
          <section className="rounded-[32px] border border-white/15 bg-white/[0.08] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-4 py-2 text-sm font-bold">
              <Gem size={16} />
              Diamond Plan
            </div>

            <h1 className="mt-5 max-w-[520px] font-heading text-[62px] font-extrabold leading-[68px] tracking-[-1.5px]">
              Powerful Client Controls
            </h1>

            <p className="mt-5 max-w-[560px] text-lg leading-8 text-white/70">
              Unlock advanced account editing, transaction management,
              notifications, donations, investments and client administration
              tools.
            </p>

            <div className="mt-8 space-y-4">
              {highlights.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-xl bg-white/[0.06] p-3"
                >
                  <CheckCircle2 size={18} className="text-emerald-400" />
                  <span className="font-medium text-white/90">{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-10 flex items-center justify-between gap-6">
              <div>
                <p className="text-sm text-white/50">Price</p>
                <h2 className="text-5xl font-extrabold">$40</h2>
              </div>

              <Link
                href="/subscribe/checkout"
                className="flex h-14 w-[220px] items-center justify-center gap-2 rounded-2xl bg-blue-700 font-bold text-white shadow-[0_14px_35px_rgba(0,0,0,0.35)] transition hover:bg-blue-800"
              >
                Subscribe Now
                <ArrowRight size={18} />
              </Link>
            </div>
          </section>

          {/* Right */}
          <section className="rounded-[32px] border border-white/15 bg-white p-8 text-black shadow-[0_0_30px_rgba(37,99,235,0.2)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-emerald-700">
                  Feature Overview
                </p>
                <h2 className="mt-1 text-3xl font-extrabold">
                  Everything Included
                </h2>
              </div>

              <div className="rounded-2xl bg-emerald-700 px-4 py-3 text-right text-white">
                <p className="text-xs font-semibold opacity-80">Diamond</p>
                <p className="text-2xl font-extrabold">$40</p>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              {features.map((feature) => (
                <div
                  key={feature}
                  className="rounded-xl border border-black/10 bg-[#f7f7f7] p-4 text-[15px] font-medium leading-6 text-black/80"
                >
                  {feature}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}