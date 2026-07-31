
"use client";

import Link from "next/link";
import { ArrowLeft, Gift } from "lucide-react";

type DonationGiftItem = {
  id: string;
  title: string;
  description: string;
  buttonText: string;
  type: "gift" | "donation";
};

const mockDonationGifts: DonationGiftItem[] = [
  {
    id: "gift-001",
    title: "Transaction update",
    description: "Vorem ipsum dolor sit amet, consectetur adipiscing elit.",
    buttonText: "Redeem this Gift",
    type: "gift",
  },
  {
    id: "gift-002",
    title: "Vorem ipsum dolor sit amet, consectetur adipiscing elit.",
    description: "Vorem ipsum dolor sit amet, consectetur adipiscing elit.",
    buttonText: "Redeem this Gift",
    type: "gift",
  },
  {
    id: "donation-001",
    title: "Vorem ipsum dolor sit amet, consectetur adipiscing elit.",
    description: "Vorem ipsum dolor sit amet, consectetur adipiscing elit.",
    buttonText: "Redeem this donation",
    type: "donation",
  },
];

export default function DonationsAndGiftPage() {
  const handleRedeem = (item: DonationGiftItem) => {
    console.log("Redeem item:", item);

    // LIVE BACKEND LATER:
    // await fetch(`/api/donations-gifts/${item.id}/redeem`, {
    //   method: "POST",
    // });
  };

  return (
    <main className="min-h-screen bg-[#e8edf3] text-[#3f3f3f]">
      <section className="mx-auto min-h-screen w-full max-w-[430px] px-6 pb-8 pt-12">
        <header className="relative flex items-center justify-center">
          <Link href="/profile" className="absolute left-0 text-[#555]">
            <ArrowLeft size={20} />
          </Link>

          <h1 className="font-heading text-[13px] font-bold tracking-[0.15em]">
            Donations and Gift
          </h1>
        </header>

        <div className="mt-6 space-y-3">
  {mockDonationGifts.map((item) => (
    <div
      key={item.id}
      className="rounded-[7px] bg-white px-3 py-3 shadow-sm"
    >
      <div
        onClick={() => {
          console.log("Open details:", item.id);

          // router.push(`/donations/${item.id}`);
        }}
        className="cursor-pointer"
      >
        <div className="flex items-start gap-2">
          <Gift size={22} className="mt-1 shrink-0 text-[#1D4ED8]" />

          <div className="min-w-0 flex-1">
            <h2 className="text-[14px] font-medium leading-[16px] text-[#444]">
              {item.title}
            </h2>

            
          </div>
        </div>
      </div>

      <div className="mt-2 flex justify-end">
        <p className="mt-2 text-[10px] font-medium leading-[11px] text-[#777]">
              {item.description}
            </p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleRedeem(item);
          }}
          className={`h-[25px] min-w-[150px] rounded-full px-4 text-[12px] font-bold text-white transition active:scale-[0.98] ${
            item.type === "gift"
              ? "bg-[#d99200]"
              : "bg-[#1D4ED8]"
          }`}
        >
          {item.buttonText}
        </button>
      </div>
    </div>
  ))}
</div>
      </section>
    </main>
  );
}

