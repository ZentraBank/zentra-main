"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, ChevronRight } from "lucide-react";
import BottomNav from "@/components/layout/BottomNav";

const adverts = [
  {
    id: 1,
    title: "Advert Card",
    description: "Vorem ipsum dolor sit amet, consectetur adipiscing elit.",
    image: "/images/advert-cards.png",
  },
  {
    id: 2,
    title: "Premium Card",
    description: "Secure virtual cards for online shopping.",
    image: "/images/advert-cards.png",
  },
  {
    id: 3,
    title: "Instant Payments",
    description: "Pay faster with your Zentra virtual card.",
    image: "/images/advert-cards.png",
  },
];

export default function CardsPage() {
  const [activeAdvert, setActiveAdvert] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveAdvert((prev) => (prev + 1) % adverts.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const advert = adverts[activeAdvert];

  return (
    <main
      className="min-h-screen overflow-x-hidden text-[#252525]"
      style={{
        backgroundImage: "url('/images/cards-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <section className="mx-auto min-h-screen w-full max-w-[430px] px-6 pb-[120px] pt-14 lg:max-w-[1180px] lg:px-8 lg:pb-12 lg:pt-10">
        <header className="relative flex items-center justify-center lg:justify-between">
          <Link
            href="/dashboard"
            className="absolute left-0 text-[#1d2939] lg:static lg:grid lg:h-11 lg:w-11 lg:place-items-center lg:rounded-full lg:bg-white/80 lg:shadow-sm lg:backdrop-blur"
          >
            <ArrowLeft size={20} />
          </Link>

          <h1 className="font-heading text-[13px] font-bold tracking-[0.15em] lg:text-[24px] lg:tracking-normal">
            Cards
          </h1>

          <div className="hidden lg:block lg:w-11" />
        </header>

        <div className="lg:mt-10 lg:grid lg:grid-cols-12 lg:gap-6">
          <section className="mt-8 grid grid-cols-[1fr_155px] items-center gap-2 lg:col-span-7 lg:mt-0 lg:min-h-[430px] lg:grid-cols-[1.1fr_0.9fr] lg:gap-6 lg:rounded-[30px] lg:bg-white/15 lg:p-8 lg:shadow-2xl lg:backdrop-blur-md">
            <div>
              <h2 className="font-sf-condensed font-heading text-[24px] font-black leading-[27px] text-white lg:text-[58px] lg:leading-[60px]">
                Simplify Payments
                <br />
                with Virtual Cards
              </h2>

              <p className="mt-5 text-[14px] font-medium leading-[18px] text-white lg:max-w-[470px] lg:text-[18px] lg:leading-8">
                Instantly issue secure virtual cards for online and in-store
                purchases—no physical card needed.
              </p>

              <Link
                href="/cards/cards-home"
                className="mt-8 flex h-[32px] w-[186px] items-center justify-center gap-6 rounded-[12px] bg-[#1D4ED8] text-[14px] text-white shadow-md transition active:scale-[0.98] lg:h-[54px] lg:w-[230px] lg:rounded-[16px] lg:text-[16px] lg:hover:bg-[#173fb2]"
              >
                Get Started
                <ArrowRight size={18} />
              </Link>
            </div>

            <div className="relative h-[180px] w-[165px] lg:h-[360px] lg:w-full">
              <Image
                src="/images/cards-avatar.png"
                alt="Virtual cards illustration"
                fill
                priority
                className="object-contain"
              />
            </div>
          </section>

          <aside className="lg:col-span-5 lg:space-y-6">
            <Link
              href="/cards/cards-purchase"
              className="mt-7 flex h-[137px] overflow-hidden rounded-[6px] bg-gradient-to-br from-[#98b5ff] via-[#2e67ed] to-[#1D4ED8] shadow-md lg:mt-0 lg:h-[210px] lg:rounded-[28px] lg:shadow-2xl"
            >
              <div className="flex w-[118px] items-center justify-center lg:w-[190px]">
                <div className="relative h-[100px] w-[100px] rounded-[7px] bg-white shadow-lg lg:h-[145px] lg:w-[145px] lg:rounded-[22px]">
                  <Image
                    src="/images/cards-avatar-3.png"
                    alt="Cards"
                    fill
                    className="object-contain p-4"
                  />
                </div>
              </div>

              <div className="flex flex-1 items-center justify-between pr-4 lg:pr-7">
                <div className="flex items-center gap-2 lg:block">
                  <h3 className="font-heading text-[24px] font-black text-[#252525] lg:text-[42px]">
                    Cards
                  </h3>

                  <p className="max-w-[130px] text-center font-sf-condensed text-[14px] leading-[17px] text-white lg:mt-3 lg:max-w-[240px] lg:text-left lg:text-[18px] lg:leading-6">
                    Open to see your available cards and choose which one you
                    like to buy
                  </p>
                </div>

                <ChevronRight size={26} className="text-white" />
              </div>
            </Link>

            <section className="mt-4 lg:mt-0">
              <div className="relative h-[116px] overflow-hidden rounded-[6px] bg-[#138f3d] shadow-sm lg:h-[230px] lg:rounded-[28px] lg:shadow-2xl">
                <Image
                  src={advert.image}
                  alt={advert.title}
                  fill
                  className="object-cover"
                />

                <div className="absolute right-0 top-[21px] h-[72px] w-[222px] bg-[#49db7f] px-4 py-2 lg:bottom-0 lg:top-auto lg:h-[110px] lg:w-full lg:px-7 lg:py-4">
                  <h3 className="font-sf-condensed text-center font-heading text-[20px] font-black leading-[27px] text-white lg:text-left lg:text-[32px]">
                    {advert.title}
                  </h3>

                  <p className="mt-1 text-[15px] font-medium leading-[17px] text-[#164226] lg:text-[16px] lg:leading-6">
                    {advert.description}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex justify-center gap-2">
                {adverts.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveAdvert(index)}
                    className={`h-2 rounded-full transition ${
                      activeAdvert === index
                        ? "w-6 bg-[#1D4ED8]"
                        : "w-2 bg-white/70"
                    }`}
                    aria-label={`Go to advert ${index + 1}`}
                  />
                ))}
              </div>
            </section>
          </aside>
        </div>
      </section>

      <div className="lg:hidden">
        <BottomNav />
      </div>
    </main>
  );
}