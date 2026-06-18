import Link from "next/link";
import { ArrowLeft, Edit3, MoveDownLeft, MoveUpRight, Send } from "lucide-react";

const transfers = [
  {
    type: "in",
    title: "Transfer from Mar Parkersbur",
    bank: "ZentraBank",
    amount: "-$17,000,000",
  },
  {
    type: "out",
    title: "Transfer to Mark Parkersburg",
    bank: "ZentraBank",
    amount: "-$100,000",
  },
  {
    type: "in",
    title: "Butcher Maxwell has insured ...",
    bank: "ZentraBank",
    amount: "-$150,000",
  },
  {
    type: "out",
    title: "Butcher Maxwell has insured ...",
    bank: "ZentraBank",
    amount: "-$13,000,000",
  },
  {
    type: "in",
    title: "Butcher Maxwell has insured ...",
    bank: "ZentraBank",
    amount: "$100,000",
  },
  {
    type: "in",
    title: "Butcher Maxwell has insured ...",
    bank: "ZentraBank",
    amount: "-$1,000,000",
  },
];

export default function TransferPage() {
  return (
    <main className="min-h-[100svh] bg-black text-white">
      <div className="mx-auto max-w-[430px] px-3 pb-10 pt-10 lg:max-w-5xl lg:px-8 lg:pt-16">
        <Link href="/services" className="inline-flex text-white">
          <ArrowLeft size={18} />
        </Link>

        <h1 className="mt-4 text-center text-[13px] font-bold lg:text-3xl">
          Transfer
        </h1>

        <div className="mt-6 flex justify-center">
          <Link
            href="/services/transfer/new"
            className="flex h-[92px] w-[220px] flex-col items-center justify-center rounded-md bg-[linear-gradient(180deg,#d71919,#9f0505)] shadow-[0_10px_25px_rgba(0,0,0,0.5)] lg:h-[150px] lg:w-[320px] lg:rounded-2xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-white text-emerald-600 lg:h-16 lg:w-16">
              <Send size={28} />
            </div>
            <span className="mt-2 text-[12px] font-medium lg:text-base">
              New Transfer
            </span>
          </Link>
        </div>

        <div className="mx-8 mt-3 h-px bg-white/40 lg:mx-auto lg:max-w-2xl" />

        <h2 className="mt-3 text-[13px] font-bold lg:text-xl">
          Gregory Winter Transfer History
        </h2>

        <div className="mt-3 space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
          {transfers.map((item, index) => {
            const incoming = item.type === "in";

            return (
              <div
                key={index}
                className="flex items-center gap-2 rounded-md bg-white px-3 py-2 text-black shadow-[0_2px_8px_rgba(255,255,255,0.2)] lg:rounded-xl lg:p-4"
              >
                <div
                  className={`shrink-0 ${
                    incoming ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {incoming ? (
                    <MoveDownLeft size={20} />
                  ) : (
                    <MoveUpRight size={20} />
                  )}
                </div>

                <div className="min-w-0 flex-1 text-left">
                  <p className="truncate text-[11px] font-medium text-black/55 lg:text-sm">
                    {item.title}
                  </p>
                  <p className="text-[11px] font-semibold text-black/70 lg:text-sm">
                    {item.bank}
                  </p>
                </div>

                <p
                  className={`max-w-[95px] truncate text-[13px] font-bold lg:max-w-none lg:text-lg ${
                    incoming ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {item.amount}
                </p>

                <Link
                  href={`/services/transfer/${index + 1}/edit`}
                  className="shrink-0 text-black/60"
                >
                  <Edit3 size={16} />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}