import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Clock,
  RefreshCcw,
  RotateCcw,
  Pencil,
} from "lucide-react";

const details = [
  ["Client account status", "Unverified!"],
  ["Teir-2 Redemption fee", "$700"],
  ["Date requested", "Sun. July 03, 2025"],
  ["Client available balance", "$101,234.56"],
  ["Time requested", "03:02 PM"],
  ["Fake service charge", "$121.95"],
  ["Fake transaction ID", "98234723948"],
  ["Customer care hot line", "1-800-XXX-XXXX"],
  ["Other Preferred funding method by client", "Crypto, Gift card, Cash app, Paypal, Google pay, Apple pay, Zelle,"],
  ["Authorization Code", "009823"],
];

export default function DonationRequestPage() {
  return (
    <main className="min-h-screen bg-white text-[#333] md:bg-black md:text-white">
      <div className="mx-auto min-h-screen max-w-[430px] px-4 pb-10 pt-9 md:max-w-[1180px] md:px-10 md:py-10">
        <Link href="/notifications" className="inline-flex text-gray-400 md:text-white">
          <ArrowLeft size={18} />
        </Link>

        <div className="mx-auto mt-2 max-w-[360px] text-center md:max-w-none">
          <h1 className="text-[35px] font-black leading-[0.82] tracking-[-1px] text-[#2454d8] md:text-[72px]">
            New Donation
            <br />
            Request!
          </h1>

          <p className="mt-5 text-[11px] text-gray-400 md:text-base">
            Requested amount
          </p>

          <h2 className="text-[27px] font-bold text-[#5aa777] md:text-[52px]">
            $100,000
          </h2>
        </div>

        <section className="mx-auto mt-3 max-w-[430px] md:mt-10 md:grid md:max-w-[1180px] md:grid-cols-[420px_1fr] md:gap-8">
          <div className="rounded-[26px] md:bg-[#111827] md:p-8 md:ring-1 md:ring-white/10">
            <div className="flex items-center gap-3 text-center md:text-left">
              <div className="h-[68px] w-[68px] shrink-0 rounded-xl bg-gradient-to-br from-blue-100 to-orange-100 blur-[1px]" />

              <p className="text-[13px] leading-tight md:text-base">
                Your Client,{" "}
                <span className="font-bold">Mark Parkersburg</span>, has
                requested that you send gift to them.
                <br />
                The request details is below:
              </p>
            </div>

            <div className="my-4 h-px bg-gray-300 md:bg-white/10" />

            <div className="space-y-3">
              {details.map(([label, value]) => (
                <div
                  key={label}
                  className="grid grid-cols-[1fr_1fr] items-start gap-3 text-[12px] md:text-sm"
                >
                  <span className="text-gray-600 md:text-gray-400">{label}</span>

                  <span
                    className={`text-right font-medium ${
                      value === "Unverified!"
                        ? "text-[#2454d8]"
                        : value === "$700"
                        ? "inline-flex justify-end"
                        : "text-[#444] md:text-white"
                    }`}
                  >
                    {value === "$700" ? (
                      <span className="rounded-full bg-gray-300 px-3 py-[2px] font-bold text-red-500">
                        $700
                      </span>
                    ) : (
                      value
                    )}

                    {label === "Customer care hot line" && (
                      <Pencil size={13} className="ml-2 inline" />
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-[26px] md:mt-0 md:bg-[#111827] md:p-8 md:ring-1 md:ring-white/10">
            <div className="mx-auto mb-4 h-[70px] w-[120px] rounded-2xl bg-gradient-to-br from-yellow-100 to-orange-200 blur-[1px] md:h-[120px] md:w-[220px]" />

            <p className="mx-auto max-w-[380px] text-center text-[11px] font-semibold leading-tight text-[#9b3d14] md:text-base md:text-orange-300">
              You can use the above information to now bomb this client, on our
              chat page, as the ZentraBank manager or customer care agent and get
              your payment
            </p>

            <div className="my-5 h-px bg-gray-300 md:bg-white/10" />

            <div className="grid grid-cols-2 gap-3">
              <button className="flex h-[38px] items-center justify-center gap-2 rounded-lg border border-gray-200 text-[12px] md:h-12 md:border-white/10 md:bg-white/5 md:text-sm">
                <Check size={15} />
                Approve
              </button>

              <button className="flex h-[38px] items-center justify-center gap-2 rounded-lg border border-gray-200 text-[12px] md:h-12 md:border-white/10 md:bg-white/5 md:text-sm">
                <Clock size={15} />
                Place-on-pending
              </button>

              <button className="flex h-[38px] items-center justify-center gap-2 rounded-lg border border-gray-200 text-[12px] md:h-12 md:border-white/10 md:bg-white/5 md:text-sm">
                <RefreshCcw size={15} />
                Re-send
              </button>

              <button className="flex h-[38px] items-center justify-center gap-2 rounded-lg border border-gray-200 text-[12px] md:h-12 md:border-white/10 md:bg-white/5 md:text-sm">
                <RotateCcw size={15} />
                Reverse transaction
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}