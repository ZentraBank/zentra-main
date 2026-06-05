import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Check, Gift } from "lucide-react";

const details = [
  ["Current account status", "Unverified!", "text-blue-600"],
  ["Teir-2 Redemption fee", "$700", "text-red-500 font-bold"],
  ["Transaction date", "Sun. July 03, 2025"],
  ["Available Balance", "$101,234.56"],
  ["Transaction time", "03:02 PM"],
  ["Service charge", "$121.95"],
  ["Transaction ID", "98234723948"],
  ["Customer Care", "1-800-XXX-XXXX"],
  ["Type", "InterBank"],
  ["Authorization Code", "009823"],
];

export default function GiftedFundsPage() {
  return (
    <main className="min-h-[100svh] bg-white text-[#555]">
      <div className="mx-auto max-w-[430px] px-5 pb-8 pt-8 lg:max-w-5xl lg:px-10">
        <Link href="/services" className="inline-flex text-black/40">
          <ArrowLeft size={18} />
        </Link>

        <h1 className="-mt-5 text-center text-[13px] font-bold text-black/60 lg:text-2xl">
          Gifted Funds
        </h1>

        <section className="mt-4 flex flex-col items-center">
          <div className="flex h-[180px] w-[180px] items-center justify-center rounded-full bg-[#FFE347] shadow-[0_8px_18px_rgba(0,0,0,0.2)] lg:h-[240px] lg:w-[240px]">
            <Gift size={58} className="text-blue-700 lg:h-20 lg:w-20" />
          </div>

          <h2 className="mt-5 text-[34px] font-semibold leading-none text-emerald-600 lg:text-[52px]">
            $100,000
          </h2>

          <p className="mt-2 text-[12px] font-medium text-blue-600 lg:text-base">
            Gift Sent!
          </p>

          <div className="mt-7 flex items-center justify-center gap-3 text-black">
            <span className="text-[15px] font-extrabold">10</span>
            <span className="text-[12px]">Days</span>
            <span className="text-[15px] font-extrabold">07</span>
            <span className="text-[12px]">Hrs</span>
            <span className="text-[15px] font-extrabold">00</span>
            <span className="text-[12px]">Min</span>
          </div>

          <div className="mt-4 text-center">
            <p className="text-[12px] text-black/45">Sent to</p>
            <div className="flex items-center justify-center gap-2">
              <p className="text-[18px] font-medium text-black/70">
                Mark Parkersburg
              </p>
              <Check size={16} className="text-emerald-600" />
            </div>
          </div>
        </section>

        <section className="mt-4 space-y-3 lg:mx-auto lg:mt-8 lg:max-w-2xl">
          {details.map(([label, value, color]) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-[12px] text-black/45 lg:text-base">
                {label}
              </span>
              <span
                className={`text-[13px] text-black/70 lg:text-base ${
                  color || ""
                }`}
              >
                {value}
              </span>
            </div>
          ))}
        </section>

        <p className="mt-5 text-center text-[13px] text-black/65">
          You can redeem this Gift as fast as you can
        </p>

        <div className="mt-3 h-px bg-black/35" />

        <section className="mt-4 grid grid-cols-2 gap-2 lg:mx-auto lg:max-w-2xl lg:gap-4">
        {["Edit receipt", "Place-on-pending", "Reverse transaction", "Re-send"].map(
            (action) => (
            <button
                key={action}
                className="h-10 rounded-lg border border-black/10 bg-white text-[12px] font-medium text-black/70 shadow-sm lg:h-12 lg:text-base"
            >
                {action}
            </button>
            )
        )}
        </section>

        <div className="mt-2 flex justify-center">
        <button className="h-10 w-full max-w-[260px] rounded-lg border border-black/10 bg-white text-[12px] font-medium text-black/70 shadow-sm lg:h-12 lg:max-w-[320px] lg:text-base">
            Approve
        </button>
        </div>
      </div>
    </main>
  );
}