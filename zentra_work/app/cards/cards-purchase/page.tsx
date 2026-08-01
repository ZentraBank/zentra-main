"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

type CardProduct = {
  type:
    | "virtual"
    | "physical"
    | "celebrity"
    | "cryptocurrency"
    | "official"
    | "merchant";
  title: string;
  image: string;
  price: number;
  currency: "GBP";
  description: string;
};

const cardProducts: CardProduct[] = [
  {
    type: "virtual",
    title: "Virtual Card",
    image: "/images/celebrity-card.png",
    price: 10,
    currency: "GBP",
    description: "Instant card for online payments and subscriptions.",
  },
  {
    type: "celebrity",
    title: "Celebrity Card",
    image: "/images/celebrity-card.png",
    price: 20,
    currency: "GBP",
    description: "A premium themed card with a distinctive design.",
  },
  {
    type: "cryptocurrency",
    title: "Cryptocurrency Card",
    image: "/images/crypto-card.jpeg",
    price: 25,
    currency: "GBP",
    description: "A digital-first card design for crypto-focused users.",
  },
  {
    type: "official",
    title: "Official Card",
    image: "/images/official-card.jpeg",
    price: 30,
    currency: "GBP",
    description: "A formal everyday card for personal spending.",
  },
  {
    type: "merchant",
    title: "Merchant Card",
    image: "/images/merchant-card.png",
    price: 40,
    currency: "GBP",
    description: "A business-focused card for merchant expenses.",
  },
  {
    type: "physical",
    title: "Physical Card",
    image: "/images/love-card.png",
    price: 35,
    currency: "GBP",
    description: "A physical card for ATM, contactless, and retail use.",
  },
];

const formatPrice = (price: number, currency: string) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);

export default function CardsPurchasePage() {
  return (
    <main className="min-h-screen bg-[#E7EBF0] text-[#4A4A4A]">
      <section className="mx-auto max-w-[430px] px-4 pb-28 pt-12 lg:max-w-[1180px] lg:px-8 lg:py-10">
        <header className="relative flex items-center justify-center lg:justify-between">
          <Link
            href="/cards/active-cards"
            className="absolute left-0 text-black/60 lg:static lg:grid lg:h-11 lg:w-11 lg:place-items-center lg:rounded-full lg:bg-white lg:shadow-sm"
          >
            <ArrowLeft size={21} />
          </Link>

          <div className="text-center lg:text-left">
            <h1 className="font-heading text-[18px] font-bold lg:text-[28px]">
              Choose a card
            </h1>
            <p className="mt-1 hidden text-sm text-black/50 lg:block">
              Select the card type that suits your needs.
            </p>
          </div>

          <div className="hidden lg:block lg:w-11" />
        </header>

        <section className="mt-8 rounded-[30px] bg-white p-4 shadow-sm lg:p-8">
          <div className="relative h-[180px] overflow-hidden rounded-[24px] bg-[#DCEEFF] lg:h-[300px]">
            <Image
              src="/images/cards-avatar.png"
              alt="Cards illustration"
              fill
              priority
              className="object-cover"
            />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cardProducts.map((card) => (
              <Link
                key={card.type}
                href={`/cards/cards-purchase/${card.type}`}
                className="group overflow-hidden rounded-[24px] border border-black/5 bg-[#F8FAFC] shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative h-[150px]">
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    className="object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-[17px] font-black text-[#252525]">
                        {card.title}
                      </h2>
                      <p className="mt-1 text-[13px] leading-5 text-black/50">
                        {card.description}
                      </p>
                    </div>

                    <span className="shrink-0 rounded-full bg-[#E8F0FF] px-3 py-1 text-[13px] font-bold text-[#2458E8]">
                      {formatPrice(card.price, card.currency)}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm font-bold text-[#2458E8]">
                    <span>Select card</span>
                    <ArrowRight size={17} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}