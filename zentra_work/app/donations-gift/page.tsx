"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const donationOptions = [
  {
    id: 1,
    title: "Donations",
    href: "/donations-gift/donations",
    description:
      "ZentraBank works with Philanthropists around the world, who are willing to make financial donation to help the poor and needy...",
    gradient:
      "bg-gradient-to-br from-[#D8E3F1] via-[#C8D8EC] to-[#E8F0F8]",
  },
  {
    id: 2,
    title: "Insurance",
    href:"/insurance",
    description: "Dorem ipsum dolor sit amet, consectetur adipiscing elit.",
    gradient: "bg-gradient-to-b from-[#3D6EF2] via-[#B5C8FF] to-[#F6F6F6]",
  },
  {
    id: 3,
    title: "Investing",
    href: "/investment",
    description: "Dorem ipsum dolor sit amet, consectetur adipiscing elit.",
    gradient:
      "bg-[linear-gradient(135deg,#1A8F4A_0%,#5DC77A_35%,#F8F8F8_65%,#0F8A3C_100%)]",
  },
  {
    id: 4,
    title: "Lending",
    href: "/lending",
    description: "Dorem ipsum dolor sit amet, consectetur adipiscing elit.",
    gradient:
      "bg-[linear-gradient(135deg,#D6E3F1_0%,#E9EFF7_45%,#CDEFD8_100%)]",
  },
];

export default function DonationPage() {
  return (
    <main
      className="min-h-screen overflow-hidden"
      style={{
        backgroundImage: "url('/images/donations-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <section className="mx-auto w-full max-w-[430px] px-5 pb-10 pt-12">
        <header className="relative flex items-center justify-center">
          <Link href="/dashboard" className="absolute left-0">
            <ArrowLeft
              size={20}
              className="text-[#2F2F2F] transition hover:opacity-70"
            />
          </Link>

          <h1 className="font-heading text-[14px] font-bold tracking-[0.08em] text-white">
            Donation
          </h1>
        </header>

        <div className="mt-8 flex flex-col items-center">
          <div className="relative flex h-[163px] w-[192px] items-center justify-center rounded-full">
            <Image
              src="/images/donation-avatar.png"
              alt="Donation Robot"
              width={192}
              height={163}
              priority
              className="object-cover"
            />
          </div>

          <p className="mt-8 max-w-[260px] text-center text-[15px] leading-[20px] text-white">
            Experience how amazing it is to make wealth from the goodwill of
            your love ones, and helpers through our platform
          </p>
        </div>

        <div className="mt-8 space-y-3">
          {donationOptions.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`
                block
                rounded-[8px]
                border
                border-white/40
                p-5
                shadow-[0_0_12px_rgba(255,255,255,0.4)]
                transition
                hover:scale-[1.01]
                active:scale-[0.99]
                ${item.gradient}
              `}
            >
              <div className="flex flex-col items-center">
                <div className="flex h-[56px] w-[56px] items-center justify-center rounded-[16px] border border-[#2E8B57]/40">
                  <Image
                    src="/images/donations-icon.png"
                    alt={item.title}
                    width={38}
                    height={38}
                  />
                </div>

                <h2 className="mt-3 text-[22px] font-black text-[#1F1F1F]">
                  {item.title}
                </h2>
              </div>

              <p className="mt-3 text-[14px] leading-[18px] text-[#252525]">
                {item.description}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

