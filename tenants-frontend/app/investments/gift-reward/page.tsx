"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
} from "lucide-react";
import { useRef, useState } from "react";

const giftCards = [
  {
    id: 1,
    name: "Apple Gift Card Front",
    image: "/images/apple-card-front.png",
  },
  {
    id: 2,
    name: "Apple Gift Card Back",
    image: "/images/apple-card-back.png",
  },
  {
    id: 3,
    name: "Apple Gift Card",
    image: "/images/apple-card-blue.png",
  },
  {
    id: 4,
    name: "Apple Gift Card Receipt",
    image: "/images/apple-card-blue.png",
  },
  {
    id: 5,
    name: "Apple Gift Card Code",
    image: "/images/apple-card-blue.png",
  },
  {
    id: 6,
    name: "Apple Gift Card Package",
    image: "/images/apple-card-blue.png",
  },
];

export default function GiftRewardInvestmentPage() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const giftCardCode = "X7N4-PL29-HQ88";

  const scrollCarousel = (direction: "left" | "right") => {
    if (!carouselRef.current) return;

    carouselRef.current.scrollBy({
      left: direction === "right" ? 250 : -250,
      behavior: "smooth",
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(giftCardCode);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (error) {
      console.error("Unable to copy gift-card code:", error);
    }
  };

  const handleDownload = () => {
    const anchor = document.createElement("a");
    anchor.href = giftCards[0].image;
    anchor.download = "apple-gift-card.png";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  return (
    <main className="min-h-[100svh] bg-black text-white">
      <div className="mx-auto min-h-[100svh] w-full max-w-[430px] border-x border-white/15 bg-black pb-8 pt-10">
        {/* Header */}
        <header className="relative flex items-center justify-center px-4">
          <Link
            href="/investments"
            aria-label="Go back"
            className="absolute left-3 flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/10"
          >
            <ArrowLeft size={20} />
          </Link>

          <p className="font-sf-condensed text-[14px] font-bold tracking-[0.07em]">
            Gregory Winter&apos;s Investments
          </p>
        </header>

        {/* Title */}
        <section className="mt-5 px-5 text-center">
          <h1 className="font-sf-condensed text-[46px] font-black leading-[0.98] tracking-[-1px]">
            Gift &amp;
            <br />
            Reward-Based
          </h1>

          <div className="mx-auto mt-4 h-px w-[242px] bg-white/70" />
        </section>

        {/* Investment summary */}
        <section className="mt-3 grid grid-cols-2 gap-4 px-5">
          <div>
            <p className="font-sf-condensed text-[14px] font-bold tracking-[0.05em]">
              Invested amount:
            </p>

            <p className="mt-1 font-sf-condensed text-[31px] font-black leading-none text-[#2E8B57]">
              $10,000
            </p>
          </div>

          <div className="text-right">
            <p className="font-sf-condensed text-[14px] font-bold tracking-[0.05em]">
              Expected dividend:
            </p>

            <p className="mt-1 font-sf-condensed text-[31px] font-black leading-none text-[#2E8B57]">
              $100,000
            </p>
          </div>
        </section>

        {/* Reason */}
        <section className="mt-4 px-5 text-center">
          <h2 className="font-sf-condensed text-[14px]  tracking-[0.04em]">
            Client&apos;s Reason for Investing:
          </h2>

          <p className="mx-auto mt-2 max-w-[340px] font-lato text-[13px] leading-[15px] text-white">
            I am investing this amount of money using Apple gift-card as method
            of payment with the hope that I shall benefit annual dividend from
            my investment.
          </p>
        </section>

        <div className="mt-3 h-px w-full bg-white/45" />

        {/* Gift-card carousel */}
        <section className="pt-3">
          <h2 className="text-center font-sf-condensed text-[14px] font-bold tracking-[0.04em]">
            Gift-card details
          </h2>

          <div className="relative mt-2">
            <button
              type="button"
              aria-label="Previous gift cards"
              onClick={() => scrollCarousel("left")}
              className="absolute left-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/65 text-white backdrop-blur-sm transition hover:bg-black/85"
            >
              <ChevronLeft size={19} />
            </button>

            <div
              ref={carouselRef}
              className="flex snap-x snap-mandatory gap-1 overflow-x-auto scroll-smooth px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {giftCards.map((card) => (
                <article
                  key={card.id}
                  className="relative h-[215px] min-w-[145px] snap-start overflow-hidden border-r border-black bg-white first:min-w-[155px]"
                >
                  <Image
                    src={card.image}
                    alt={card.name}
                    fill
                    sizes="155px"
                    className="object-cover object-center"
                  />
                </article>
              ))}
            </div>

            <button
              type="button"
              aria-label="Next gift cards"
              onClick={() => scrollCarousel("right")}
              className="absolute right-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/65 text-white backdrop-blur-sm transition hover:bg-black/85"
            >
              <ChevronRight size={19} />
            </button>
          </div>
        </section>

        {/* Actions */}
        <section className="grid grid-cols-2 items-center border-y border-white/40 px-5 py-4">
          <button
            type="button"
            onClick={handleDownload}
            className="flex h-[29px] w-[155px] items-center justify-center gap-2 rounded-full bg-[#808080] font-roboto text-[12px] font-medium text-white transition hover:bg-[#929292] active:scale-[0.98]"
          >
            Download Gift-card
            <Download size={17} />
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="ml-auto flex items-center gap-1.5 font-sf-condensed text-[13px] font-bold text-white transition active:scale-[0.98]"
          >
            {copied ? "Copied" : "Copy"}
            <Copy size={17} />
          </button>
        </section>

        {copied && (
          <p className="mt-3 text-center font-lato text-[12px] text-green-400">
            Gift-card code copied successfully.
          </p>
        )}
      </div>
    </main>
  );
}