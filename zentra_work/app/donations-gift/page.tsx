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
    href: "/insurance",
    description: "Dorem ipsum dolor sit amet, consectetur adipiscing elit.",
    gradient:
      "bg-gradient-to-b from-[#3D6EF2] via-[#B5C8FF] to-[#F6F6F6]",
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
      <section className="mx-auto w-full max-w-[390px] px-5 pb-10 pt-8 md:max-w-[1180px] md:px-8 md:pb-16 md:pt-8 xl:max-w-[1320px]">
        <header className="flex items-center gap-4 md:rounded-[18px] md:bg-white/10 md:px-5 md:py-4 md:backdrop-blur-sm">
          <Link
            href="/dashboard"
            aria-label="Back to dashboard"
            className="grid h-9 w-9 place-items-center rounded-full text-white transition hover:bg-white/10 md:h-10 md:w-10"
          >
            <ArrowLeft size={20} />
          </Link>

          <h1 className="font-heading text-[14px] font-bold tracking-[0.08em] text-white md:text-[18px]">
            Donation
          </h1>
        </header>

        <div className="mt-8 md:mt-10 md:grid md:grid-cols-[360px_1fr] md:items-start md:gap-10 lg:grid-cols-[400px_1fr] xl:gap-14">
          <div className="flex flex-col items-center md:sticky md:top-8 md:rounded-[24px] md:bg-black/10 md:px-7 md:py-10 md:backdrop-blur-[2px]">
            <div className="relative flex h-[163px] w-[192px] items-center justify-center rounded-full md:h-[230px] md:w-[270px]">
              <Image
                src="/images/donation-avatar.png"
                alt="Donation Robot"
                width={270}
                height={230}
                priority
                className="object-contain"
              />
            </div>

            <p className="mt-8 max-w-[260px] text-center text-[15px] leading-[20px] text-white md:mt-7 md:max-w-[310px] md:text-[17px] md:leading-[25px]">
              Experience how amazing it is to make wealth from the goodwill of
              your love ones, and helpers through our platform
            </p>
          </div>

          <div className="mt-8 space-y-3 md:mt-0 md:grid md:grid-cols-2 md:gap-5 md:space-y-0">
            {donationOptions.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`
                  group
                  block
                  rounded-[8px]
                  border
                  border-white/40
                  p-5
                  shadow-[0_0_12px_rgba(255,255,255,0.4)]
                  transition
                  hover:scale-[1.01]
                  active:scale-[0.99]
                  md:min-h-[245px]
                  md:rounded-[20px]
                  md:p-6
                  md:shadow-[0_10px_30px_rgba(0,0,0,0.12)]
                  md:hover:-translate-y-1
                  md:hover:scale-100
                  md:hover:shadow-[0_18px_40px_rgba(0,0,0,0.18)]
                  ${item.gradient}
                `}
              >
                <div className="flex flex-col items-center md:items-start">
                  <div className="flex h-[56px] w-[56px] items-center justify-center rounded-[16px] border border-[#2E8B57]/40 md:h-[64px] md:w-[64px] md:bg-white/50 md:transition-transform md:group-hover:scale-105">
                    <Image
                      src="/images/donations-icon.png"
                      alt={item.title}
                      width={38}
                      height={38}
                      className="md:h-[42px] md:w-[42px]"
                    />
                  </div>

                  <h2 className="mt-3 text-[22px] font-black text-[#1F1F1F] md:mt-5 md:text-[26px]">
                    {item.title}
                  </h2>
                </div>

                <p className="mt-3 text-[14px] leading-[18px] text-[#252525] md:mt-4 md:text-[15px] md:leading-[22px]">
                  {item.description}
                </p>

                <div className="mt-5 hidden items-center justify-between border-t border-black/10 pt-4 text-[13px] font-semibold text-black/55 md:flex">
                  <span>Explore service</span>
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}