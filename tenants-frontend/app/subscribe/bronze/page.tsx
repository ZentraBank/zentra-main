import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Video } from "lucide-react";

const plans = ["Read", "Gold", "Diamond"];

export default function SubscribePage() {
  return (
    <main className="relative min-h-[100svh] overflow-hidden bg-black text-white">
      {/* Background image */}
      <Image
        src="/images/Background.png"
        alt="Subscribe background"
        fill
        priority
        className="object-cover"
      />

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[430px] flex-col px-3 pt-9 pb-8 text-center">
        {/* Back */}
        <Link href="/dashboard" className="absolute left-3 top-11 z-20 text-white">
          <ArrowLeft size={18} />
        </Link>

        {/* Title */}
        <h1 className="font-heading text-[34px] font-semibold leading-none tracking-[1px] text-blue-700 [text-shadow:_0px_1px_0px_rgb(255_255_255_/_1)]">
          Subscribe!
        </h1>

        {/* Choose Plan */}
        <section className="mt-9 overflow-hidden border-y border-blue-500 bg-white/95 py-2 text-black">
          <h2 className="text-[20px] font-extrabold leading-5">
            Choose Plan
          </h2>

          <div className="mt-2 grid grid-cols-3 gap-2 px-3">
            {plans.map((plan, index) => (
              <button
                key={plan}
                className={`h-6 rounded-md text-[11px] font-medium ${
                  index === 0
                    ? "bg-blue-700 text-white"
                    : "bg-gray-400 text-black"
                }`}
              >
                {plan}
              </button>
            ))}
          </div>
        </section>

        {/* Ring */}
        <div className="relative mt-5 flex justify-center">
          <Image
            src="/images/ring2.png"
            alt="Subscribe ring"
            width={130}
            height={130}
            priority
            className="h-[118px] w-[118px] object-contain"
          />

          <span className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 font-heading text-[18px] font-semibold tracking-[4px] text-blue-700 [text-shadow:_0px_1px_0px_rgb(255_255_255_/_1)]">
            {/* Subscribe! */}
          </span>
        </div>

        {/* Plan price row */}
        <div className="mx-2 mt-5 flex items-center justify-between text-[10px] font-bold">
          <span>Bronze</span>
          <span>$40</span>
        </div>

        {/* Plan description card */}
        <section className="mx-2 rounded-xl bg-white px-3 py-2 text-left text-black shadow-[0_0_8px_rgba(37,99,235,0.85)]">
          <h2 className="font-heading text-[28px] font-extrabold leading-[36px] tracking-[0.4px]">
            Bronze Plan: Send in-app notifications to front-end users regarding
            account updates or upgrades.
          </h2>
        </section>

        {/* Feature button */}
        <div className="mt-3 flex justify-center">
          <Link
            href="/subscribe/features"
            className="rounded-full bg-white px-4 py-1 text-[11px] font-medium text-black"
          >
            See all plan features
          </Link>
        </div>

        {/* Help button */}
        <div className="mt-4 flex justify-end pr-2">
          <Link
            href="/help"
            className="flex items-center gap-1 rounded-full bg-white/25 px-3 py-1 text-[11px] font-medium text-white"
          >
            How to use this website
            <Video size={13} />
          </Link>
        </div>

        <div className="flex-1" />

        {/* Subscribe button */}
        <div className="flex justify-center pb-3">
          <Link
            href="/subscribe/checkout"
            className="flex w-[245px] items-center justify-center gap-3 rounded-xl bg-blue-700 px-4 py-3 text-[14px] font-bold text-white shadow-[0_10px_25px_rgba(0,0,0,0.25)]"
          >
            Subscribe now
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </main>
  );
}