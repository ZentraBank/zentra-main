"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const sections = [
  {
    id: "charity-impact",
    title: "Charity & Impact Investments",
    items: [
      {
        id: "crowdfunded-charity-1",
        title: "Crowdfunded Charity Proj...",
        image: "/images/investments.png",
      },
      {
        id: "crowdfunded-charity-2",
        title: "Crowdfunded Charity Proj...",
        image: "/images/investments.png",
      },
      {
        id: "nonprofit-investment-pools",
        title: "Nonprofit Investment Pools",
        image: "/images/investments.png",
      },
      {
        id: "charity-impact-1",
        title: "Charity & Impact Investments",
        image: "/images/investments.png",
      },
      {
        id: "charity-impact-2",
        title: "Charity & Impact Investments",
        image: "/images/investments.png",
      },
    ],
  },
  {
    id: "will-next-of-kin",
    title: "Will(Next-of-kin)",
    items: [
      {
        id: "p2p-lending-will",
        title: "P2P Lending (Microloans)",
        image: "/images/investments.png",
      },
      {
        id: "p2p-gifting-will",
        title: "P2P Gifting Circles",
        image: "/images/investments.png",
      },
      {
        id: "rosca-will",
        title: "Rotating Savings & Association (ROSCA)",
        image: "/images/investments.png",
      },
    ],
  },
  {
    id: "gift-reward",
    title: "Gift & Reward-Based Investments",
    items: [
      {
        id: "gift-savings",
        title: "Gift Savings",
        image: "/images/investments.png",
      },
      {
        id: "reward-investment",
        title: "Reward Investment",
        image: "/images/investments.png",
      },
      {
        id: "digital-gift-pool",
        title: "Digital Gift Pool",
        image: "/images/investments.png",
      },
    ],
  },
  {
    id: "other-investments-1",
    title: "Other Investments",
    items: [
      {
        id: "p2p-lending-other-1",
        title: "P2P Lending (Microloans)",
        image: "/images/investments.png",
      },
      {
        id: "p2p-gifting-other-1",
        title: "P2P Gifting Circles",
        image: "/images/investments.png",
      },
      {
        id: "rosca-other-1",
        title: "Rotating Savings & Association (ROSCA)",
        image: "/images/investments.png",
      },
    ],
  },
  {
    id: "other-investments-2",
    title: "Other Investments",
    items: [
      {
        id: "p2p-lending-other-2",
        title: "P2P Lending (Microloans)",
        image: "/images/investments.png",
      },
      {
        id: "p2p-gifting-other-2",
        title: "P2P Gifting Circles",
        image: "/images/investments.png",
      },
      {
        id: "rosca-other-2",
        title: "Rotating Savings & Association (ROSCA)",
        image: "/images/investments.png",
      },
    ],
  },
];

export default function InvestmentsPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#13813d]">
      <section className="mx-auto min-h-screen w-full max-w-[430px] px-6 pb-10 pt-14">
        <header className="relative flex items-center justify-center">
          <Link href="/investment" className="absolute left-0 text-[#1F1F1F]">
            <ArrowLeft size={20} />
          </Link>

          <p className="font-heading text-[13px] font-bold tracking-[0.15em] text-[#1F1F1F]">
            Investments
          </p>
        </header>

        <h1 className="mt-6 text-center font-heading text-[31px] font-black leading-[34px] text-white">
          Take Financial Control
        </h1>

        <p className="mx-auto mt-4 max-w-[340px] text-center text-[13px] font-medium leading-[18px] text-white">
          Dorem ipsum dolor sit amet, consectetur adipiscing elit.
        </p>

        <div className="mt-8 space-y-4">
          {sections.map((section) => (
            <InvestmentSection key={section.id} section={section} />
          ))}
        </div>
      </section>
    </main>
  );
}

function InvestmentSection({
  section,
}: {
  section: {
    id: string;
    title: string;
    items: {
      id: string;
      title: string;
      image: string;
    }[];
  };
}) {
  return (
    <section className="rounded-[8px] border border-white bg-[#16884b] p-2 text-white shadow-md">
      <h2 className="mb-3 font-heading text-[14px] font-black">
        {section.title}
      </h2>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {section.items.map((item) => (
          <InvestmentCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

function InvestmentCard({
  item,
}: {
  item: {
    id: string;
    title: string;
    image: string;
  };
}) {
  return (
    <Link
      href="/investment/details"
      className="min-w-[122px] overflow-hidden rounded-[7px] bg-[#c9f2ee] text-[#263238] shadow-sm"
    >
      <div className="relative mx-auto h-[120px] w-full overflow-hidden rounded-[7px]">
        <Image
          src={item.image}
          alt={item.title}
          fill
          className="object-cover"
        />
      </div>

      <div className="px-2 pb-3 pt-2">
        <h3 className="font-sf-condensed text-[13px] font-bold leading-[14px]">
          {item.title}
        </h3>

        <p className="mt-2 text-[7px] font-medium leading-[9px] text-[#333]">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate
          libero et velit interdum, ac aliquet odio mattis.
        </p>
      </div>
    </Link>
  );
}