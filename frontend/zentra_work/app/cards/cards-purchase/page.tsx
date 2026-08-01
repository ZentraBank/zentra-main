"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

const cards = [
  { id: 1, title: "Celebrity card", image: "/images/celebrity-card.png" },
  { id: 2, title: "Merchant card", image: "/images/merchant-card.png" },
  { id: 3, title: "Love card", image: "/images/love-card.png" },
];

const sections = [
  {
    title: "Basic Features",
    items: [
      "Credit Limit – Maximum amount you can borrow.",
      "Card Number – Unique 16-digit identification number.",
      "Expiry Date – Validity of the card.",
      "CVV/CVC Code – Security code for online transactions.",
      "Issuer Name & Logo – Bank or financial institution providing the card.",
      "Card Network – Visa, Mastercard, American Express, Discover, etc.",
    ],
  },
  {
    title: "Financial Features",
    items: [
      "Interest Rate (APR) – Percentage charged on unpaid balances.",
      "Grace Period – Interest-free period for full payments.",
      "Minimum Payment – Smallest amount due to avoid default.",
      "Balance Transfer Option – Ability to move balances from other cards.",
      "Cash Advance – Withdrawing cash using the credit card.",
      "Fees – Annual fee, late fee, foreign transaction fee, balance transfer fee, etc.",
    ],
  },
  {
    title: "Security Features",
    items: [
      "EMV Chip – Protects against fraud with encrypted transactions.",
      "Magnetic Stripe – Traditional swipe method.",
      "Contactless/NFC Tap-to-Pay – Touchless payment feature.",
      "PIN Protection – Required for ATM and some in-store payments.",
      "Fraud Monitoring & Alerts – Detects suspicious activity.",
      "Zero Liability Protection – No responsibility for unauthorized charges.",
      "Virtual Card Numbers – For safe online shopping.",
    ],
  },
  {
    title: "Digital & Convenience Features",
    items: [
      "Mobile Wallet Integration – Apple Pay, Google Pay, Samsung Pay.",
      "Online/Mobile Banking Access – Track spending, statements, and payments.",
      "E-statements – Digital monthly account statements.",
      "Autopay Option – Automatic bill payments.",
      "Card Lock/Freeze – Temporarily disable if lost/stolen.",
    ],
  },
];

export default function CardDetailsPage() {
  return (
    <main className="min-h-screen bg-[#E7EBF0] text-[#4A4A4A]">
      <section className="mx-auto max-w-[430px] lg:max-w-[1180px] lg:px-8 lg:py-10">
        <div className="sticky top-0 z-30 bg-[#E7EBF0] px-6 pb-4 pt-14 lg:static lg:rounded-[30px] lg:bg-white lg:p-8 lg:shadow-sm">
          <header className="relative flex items-center justify-center lg:justify-between">
            <Link
              href="/cards"
              className="absolute left-0 text-black/60 lg:static lg:grid lg:h-11 lg:w-11 lg:place-items-center lg:rounded-full lg:bg-[#E7EBF0] lg:shadow-sm"
            >
              <ArrowLeft size={21} />
            </Link>

            <h1 className="font-heading text-[15px] font-bold tracking-[0.12em] lg:text-[24px] lg:tracking-normal">
              Cards
            </h1>

            <Link
              href="/cards/purchase-crypto"
              className="hidden h-11 items-center justify-center gap-3 rounded-full bg-[#2458E8] px-6 text-[14px] font-bold text-white shadow-md transition hover:bg-[#1d46c0] lg:flex"
            >
              Buy card $30
              <ArrowRight size={18} />
            </Link>
          </header>

          <div className="lg:mt-8 lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="relative mx-auto mt-5 h-[220px] w-full lg:col-span-6 lg:mt-0 lg:h-[430px]">
              <Image
                src="/images/cards-avatar.png"
                alt="Cards illustration"
                fill
                priority
                className="object-cover lg:rounded-[28px]"
              />
            </div>

            <div className="lg:col-span-6 lg:flex lg:flex-col lg:justify-center">
              <h2 className="hidden font-heading text-[48px] font-black leading-[52px] text-[#2458E8] lg:block">
                Choose Your
                <br />
                Virtual Card
              </h2>

              <p className="mt-5 hidden max-w-[480px] text-[16px] leading-7 text-black/55 lg:block">
                Browse card styles, review features, and purchase the card that
                fits your online spending needs.
              </p>

              <div className="mt-2 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 scrollbar-hide lg:mt-8 lg:gap-4">
                {cards.map((card) => (
                  <Link
                    key={card.id}
                    href={`/cards/${card.id}`}
                    className="relative h-[126px] min-w-[178px] snap-start overflow-hidden rounded-[5px] shadow-md lg:h-[150px] lg:min-w-[230px] lg:rounded-[18px]"
                  >
                    <Image
                      src={card.image}
                      alt={card.title}
                      fill
                      className="object-cover transition hover:scale-105"
                    />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        <section className="px-6 pb-[110px] pt-3 lg:grid lg:grid-cols-2 lg:gap-6 lg:px-0 lg:pb-24 lg:pt-8">
          {sections.map((section) => (
            <div
              key={section.title}
              className="mb-5 lg:mb-0 lg:rounded-[26px] lg:bg-white lg:p-6 lg:shadow-sm"
            >
              <h2 className="mb-3 font-heading text-[16px] font-black tracking-[0.04em] lg:text-[22px]">
                {section.title}
              </h2>

              <ul className="list-disc space-y-1 pl-6 text-[14px] font-medium leading-[17px] lg:space-y-3 lg:text-[15px] lg:leading-6">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      </section>

      <div className="fixed bottom-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 border-t border-white/50 bg-[#E7EBF0]/90 px-6 py-4 backdrop-blur-md lg:hidden">
        <Link
          href="/cards/purchase-crypto"
          className="flex h-[36px] w-full items-center justify-center gap-4 rounded-[12px] bg-[#1D4ED8] text-[13px] text-white shadow-md active:scale-[0.98]"
        >
          Buy card $30
          <ArrowRight size={21} />
        </Link>
      </div>
    </main>
  );
}