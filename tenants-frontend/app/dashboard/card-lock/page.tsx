"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Lock, Unlock } from "lucide-react";

const cards = [
  {
    title: "Celebrity card",
    emoji: "🏵️",
    img: "/images/crypto-card.jpeg",
  },
  {
    title: "Cryptocurrency card",
    emoji: "💳",
    img: "/images/cryptocurrency.jpeg",
  },
  {
    title: "Official card",
    emoji: "🏆",
    img: "/images/official-card.jpeg",
  },
  {
    title: "Merchant card",
    emoji: "🤠",
    img: "/images/merchant-card.jpeg",
  },
];

const actions = [
  { label: "Deactivate", key: "deactivate" },
  { label: "Unblock card", key: "unblock" },
  { label: "Unfreeze card", key: "unfreeze" },
  { label: "Disapprove", key: "disapprove" },
] as const;

type ActionKey = (typeof actions)[number]["key"];

const actionColors: Record<ActionKey, string> = {
  deactivate: "bg-red-500",
  unblock: "bg-green-500",
  unfreeze: "bg-sky-500",
  disapprove: "bg-orange-500",
};

function ToggleSwitch({
  enabled,
  color = "bg-green-500",
  disabled = false,
  onToggle,
}: {
  enabled: boolean;
  color?: string;
  disabled?: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={enabled}
      className={`relative h-[16px] w-[32px] rounded-full transition-all duration-300 md:h-5 md:w-10 ${
        enabled ? color : "bg-gray-300"
      } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
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
  const [lockedCards, setLockedCards] = useState<boolean[]>(
    cards.map(() => false)
  );

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

  const toggleCardLock = async (cardIndex: number) => {
    const newValue = !lockedCards[cardIndex];

    /*
      Backend later:

      await fetch(`/api/cards/${cardIndex}/lock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locked: newValue,
        }),
      });
    */

    setLockedCards((prev) =>
      prev.map((locked, index) => (index === cardIndex ? newValue : locked))
    );
  };

  const toggleSetting = async (cardIndex: number, key: ActionKey) => {
    if (lockedCards[cardIndex]) return;

    const newValue = !cardSettings[cardIndex][key];

    /*
      Backend later:

      await fetch(`/api/cards/${cardIndex}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: key,
          enabled: newValue,
        }),
      });
    */

    setCardSettings((prev) =>
      prev.map((card, index) =>
        index === cardIndex ? { ...card, [key]: newValue } : card
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
          {cards.map((card, cardIndex) => {
            const isLocked = lockedCards[cardIndex];

            return (
              <div
                key={card.title}
                className={`overflow-hidden rounded-[12px] border-[3px] border-white bg-white shadow-[0_0_0_2px_#bfa23a] transition-all duration-300 ${
                  isLocked ? "opacity-75 grayscale" : "opacity-100"
                }`}
              >
                <div className="relative h-[100px] overflow-hidden md:h-[180px] lg:h-[200px]">
                  <Image
                    src={card.img}
                    alt={card.title}
                    fill
                    className="object-cover"
                  />

                  <div className="absolute inset-0 bg-black/25" />

                  {isLocked && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/45">
                      <div className="flex items-center gap-2 rounded-full bg-black/80 px-4 py-2 text-[12px] font-bold text-white">
                        <Lock size={15} />
                        Card Locked
                      </div>
                    </div>
                  )}

                  <div className="absolute left-4 top-3 z-30 text-[24px] md:left-6 md:top-5 md:text-[38px]">
                    {card.emoji}
                  </div>

                  <h2 className="absolute inset-x-0 top-5 z-30 text-center text-[15px] font-extrabold tracking-wide md:top-8 md:text-2xl">
                    {card.title}
                  </h2>

                  <div className="absolute right-4 top-3 z-40 flex items-center gap-2 md:right-6 md:top-5">
                    {isLocked ? (
                      <Lock size={14} className="text-red-400" />
                    ) : (
                      <Unlock size={14} className="text-green-400" />
                    )}

                    <ToggleSwitch
                      enabled={!isLocked}
                      color="bg-green-500"
                      onToggle={() => toggleCardLock(cardIndex)}
                    />
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 z-30 grid grid-cols-4 items-end bg-black/75 px-4 py-2 text-[8px] leading-tight md:px-6 md:py-4 md:text-xs">
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
                  {actions.map((action) => {
                    const isActive = cardSettings[cardIndex][action.key];

                    return (
                      <div
                        key={action.key}
                        className={`flex h-[20px] items-center justify-between rounded-sm px-1 text-[11px] shadow-sm transition-all duration-300 md:h-9 md:rounded-md md:px-3 md:text-sm ${
                          isLocked
                            ? "bg-gray-100 text-black/35"
                            : isActive
                            ? "bg-blue-50 ring-2 ring-[#2458e8]"
                            : "bg-white"
                        }`}
                      >
                        <span
                          className={`transition-colors duration-300 ${
                            isLocked
                              ? "text-black/35"
                              : isActive
                              ? "font-bold text-[#2458e8]"
                              : "text-black"
                          }`}
                        >
                          {action.label}
                        </span>

                        <ToggleSwitch
                          enabled={isActive}
                          color={actionColors[action.key]}
                          disabled={isLocked}
                          onToggle={() => toggleSetting(cardIndex, action.key)}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}