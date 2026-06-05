"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const cards = [
  {
    title: "Celebrity card",
    emoji: "🏵️",
    img: "/images/celebrity-card.png",
  },
  {
    title: "Cryptocurrency card",
    emoji: "💳",
    img: "/images/crypto-card.png",
  },
  {
    title: "Official card",
    emoji: "🏆",
    img: "/images/official-card.png",
  },
  {
    title: "Merchant card",
    emoji: "🤠",
    img: "/images/merchant-card.png",
  },
];

const actions = [
  { label: "Deactivate", key: "deactivate" },
  { label: "Unblock card", key: "unblock" },
  { label: "Unfreeze card", key: "unfreeze" },
  { label: "Disapprove", key: "disapprove" },
] as const;

type ActionKey = (typeof actions)[number]["key"];

function ToggleSwitch({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative h-[16px] w-[32px] rounded-full transition-all duration-300 md:h-5 md:w-10 ${
        enabled ? "bg-green-500" : "bg-gray-300"
      }`}
    >
      <span
        className={`absolute top-[2px] h-3 w-3 rounded-full bg-white shadow transition-all duration-300 md:h-4 md:w-4 ${
          enabled ? "left-[18px] md:left-5" : "left-[2px]"
        }`}
      />
    </button>
  );
}

export default function CardStatusPage() {
  const [cardSettings, setCardSettings] = useState<
    Record<ActionKey, boolean>[]
  >(
    cards.map(() => ({
      deactivate: false,
      unblock: false,
      unfreeze: false,
      disapprove: false,
    }))
  );

  const toggleSetting = (cardIndex: number, key: ActionKey) => {
    setCardSettings((prev) =>
      prev.map((card, index) =>
        index === cardIndex ? { ...card, [key]: !card[key] } : card
      )
    );
  };

  return (
    <main className="min-h-screen bg-black px-3 py-8 text-white md:px-10 lg:px-16">
      <div className="mx-auto max-w-[1200px]">
        <Link href="/dashboard" className="mb-6 inline-flex text-white">
          <ArrowLeft size={22} />
        </Link>

        <div className="mx-auto mb-8 max-w-[720px] text-center md:mb-12">
          <h1 className="text-[34px] font-black leading-[0.9] tracking-[-1px] text-[#2f73ff] drop-shadow-[0_2px_0_#ffffff] md:text-[58px] lg:text-[72px]">
            Control Your client&apos;s
            <br />
            card status
          </h1>

          <p className="mx-auto mt-5 max-w-[480px] text-[11px] font-bold leading-tight md:text-base">
            Control Your Client&apos;s Credit card or Debit card Status
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {cards.map((card, cardIndex) => (
            <div
              key={card.title}
              className="overflow-hidden rounded-[12px] border-[3px] border-white bg-white shadow-[0_0_0_2px_#bfa23a]"
            >
              <div className="relative h-[100px] overflow-hidden md:h-[180px] lg:h-[200px]">
                <Image
                  src={card.img}
                  alt={card.title}
                  fill
                  className="object-cover"
                />

                <div className="absolute inset-0 bg-black/25" />

                <div className="absolute left-4 top-3 text-[24px] md:left-6 md:top-5 md:text-[38px]">
                  {card.emoji}
                </div>

                <h2 className="absolute inset-x-0 top-5 text-center text-[15px] font-extrabold tracking-wide md:top-8 md:text-2xl">
                  {card.title}
                </h2>

                <div className="absolute right-4 top-3 h-4 w-7 rounded-full bg-white/80 md:right-6 md:top-5 md:h-6 md:w-11">
                  <div className="ml-auto mr-[2px] mt-[2px] h-3 w-3 rounded-full bg-[#68d391] md:h-5 md:w-5" />
                </div>

                <div className="absolute bottom-0 left-0 right-0 grid grid-cols-4 items-end bg-black/75 px-4 py-2 text-[8px] leading-tight md:px-6 md:py-4 md:text-xs">
                  <div>
                    <p>2386 **** **** 1234</p>
                    <p>CVV: 7XX</p>
                  </div>

                  <div />

                  <div>
                    <p>Expiry date: 27/</p>
                    <p>XX</p>
                  </div>

                  <p className="text-right text-[11px] font-semibold md:text-base">
                    Credit card
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-2 gap-y-1 bg-white/90 px-3 py-2 text-black md:gap-3 md:px-5 md:py-4">
                {actions.map((action) => (
                  <div
                    key={action.key}
                    className="flex h-[20px] items-center justify-between rounded-sm bg-white px-1 text-[11px] shadow-sm md:h-9 md:rounded-md md:px-3 md:text-sm"
                  >
                    <span>{action.label}</span>

                    <ToggleSwitch
                      enabled={cardSettings[cardIndex][action.key]}
                      onToggle={() => toggleSetting(cardIndex, action.key)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}