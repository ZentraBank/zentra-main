"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Landmark,
} from "lucide-react";
import { useState } from "react";

type InvestmentItem = {
  label: string;
  href: string;
};

type InvestmentCategory = {
  id: string;
  title: string;
  items: InvestmentItem[];
};

const investmentCategories: InvestmentCategory[] = [
  {
    id: "charity-impact",
    title: "Charity & Impact Investments",
    items: [
      {
        label: "Crowdfunded Charity Project",
        href: "/investments/charity-impact/crowdfunded-project",
      },
      {
        label: "Nonprofit Investment Pools",
        href: "/investments/charity-impact/nonprofit-pools",
      },
      {
        label: "Social Impact Bonds",
        href: "/investments/charity-impact/social-impact-bonds",
      },
      {
        label: "Cause-driven Savings Plans",
        href: "/investments/charity-impact/cause-driven-savings",
      },
      {
        label: "Charity & Impact Investments",
        href: "/investments/charity-impact/all",
      },
    ],
  },
  {
    id: "gift-reward",
    title: "Gift & Reward-Based Investments",
    items: [
      {
        label: "Gift Cards with Cashback",
        href: "/investments/gift-reward/gift-cards",
      },
      {
        label: "Reward-Based Savings",
        href: "/investments/gift-reward/savings",
      },
      {
        label: "Loyalty Reward Investments",
        href: "/investments/gift-reward/loyalty",
      },
    ],
  },
  {
    id: "digital-assets",
    title: "Digital Asset Investments",
    items: [
      {
        label: "Charity-Linked Digital Assets",
        href: "/investments/digital-assets/charity-linked",
      },
      {
        label: "Tokenised Investment Products",
        href: "/investments/digital-assets/tokenised",
      },
      {
        label: "Digital Asset Portfolios",
        href: "/investments/digital-assets/portfolios",
      },
    ],
  },
  {
    id: "sustainable-ethical",
    title: "Sustainable & Ethical Investments",
    items: [
      {
        label: "Green Investment Funds",
        href: "/investments/sustainable/green-funds",
      },
      {
        label: "Ethical Business Investments",
        href: "/investments/sustainable/ethical-business",
      },
      {
        label: "Renewable Energy Portfolios",
        href: "/investments/sustainable/renewable-energy",
      },
    ],
  },
  {
    id: "alternative",
    title: "Alternative Investments",
    items: [
      {
        label: "Property Investment Pools",
        href: "/investments/alternative/property",
      },
      {
        label: "Private Equity Opportunities",
        href: "/investments/alternative/private-equity",
      },
      {
        label: "Collectible Asset Investments",
        href: "/investments/alternative/collectibles",
      },
    ],
  },
  {
    id: "loyalty-community",
    title: "Loyalty & Community-Based Investments",
    items: [
      {
        label: "Community Savings Groups",
        href: "/investments/community/savings-groups",
      },
      {
        label: "Loyalty Investment Plans",
        href: "/investments/community/loyalty-plans",
      },
      {
        label: "Local Business Portfolios",
        href: "/investments/community/local-business",
      },
    ],
  },
  {
    id: "insurance-linked",
    title: "Insurance-Linked Investments",
    items: [
      {
        label: "Life Insurance Investments",
        href: "/investments/insurance/life",
      },
      {
        label: "Insurance Savings Plans",
        href: "/investments/insurance/savings",
      },
      {
        label: "Risk-Linked Portfolios",
        href: "/investments/insurance/risk-linked",
      },
    ],
  },
  {
    id: "education-skills",
    title: "Education & Skills Investments",
    items: [
      {
        label: "Student Support Funds",
        href: "/investments/education/student-support",
      },
      {
        label: "Professional Training Funds",
        href: "/investments/education/training",
      },
      {
        label: "Education Savings Plans",
        href: "/investments/education/savings",
      },
    ],
  },
  {
    id: "savings-crowdfunding",
    title: "Savings & Crowdfunding Products",
    items: [
      {
        label: "Personal Savings Campaigns",
        href: "/investments/crowdfunding/personal-savings",
      },
      {
        label: "Business Crowdfunding",
        href: "/investments/crowdfunding/business",
      },
      {
        label: "Community Funding Products",
        href: "/investments/crowdfunding/community",
      },
    ],
  },
];

export default function InvestmentCategoriesPage() {
  const [openCategory, setOpenCategory] = useState("charity-impact");

  const toggleCategory = (categoryId: string) => {
    setOpenCategory((currentCategory) =>
      currentCategory === categoryId ? "" : categoryId
    );
  };

  return (
    <main className="relative min-h-[100svh] overflow-x-hidden bg-black text-white">
      {/* Background image */}
      <Image
        src="/images/Background_1.png"
        alt="Investment management background"
        fill
        priority
        className="fixed object-cover object-center"
      />

      {/* Optional overlay */}
      <div className="fixed inset-0 bg-black/5" />

      <div className="relative z-10 mx-auto min-h-[100svh] w-full max-w-[430px] px-4 pb-5 pt-10">
        {/* Header */}
        <header className="relative flex items-center justify-center">
          <Link
            href="/investments"
            aria-label="Go back"
            className="absolute left-0 flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/10"
          >
            <ArrowLeft size={20} />
          </Link>

          <p className="font-sf-condensed text-[13px] font-bold tracking-[0.05em]">
            Charity &amp; Impact Investments
          </p>
        </header>

        {/* Description */}
        <section className="mx-auto mt-5 max-w-[355px] text-center">
          <p className="font-lato text-[14px] font-medium leading-[17px] text-white">
            Make your clients discover verified social investment projects,
            donate to trusted charities, track financial returns and measurable
            community impact, manage their investment portfolio, automate
            giving, reinvest profits, view transparent reports, calculate
            potential returns, monitor transactions, earn impact rewards, and
            support causes through secure, purpose-driven investments.
          </p>
        </section>

        {/* Accordion */}
        <section className="mt-5 space-y-2">
          {investmentCategories.map((category) => {
            const isOpen = openCategory === category.id;

            return (
              <article
                key={category.id}
                className={`overflow-hidden rounded-[12px] shadow-[0_5px_14px_rgba(0,0,0,0.25)] ${
                  isOpen ? "bg-[#2E8B57]" : "bg-white"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  aria-expanded={isOpen}
                  className={`flex min-h-[42px] w-full items-center justify-between px-4 text-left font-roboto text-[14px] font-medium transition ${
                    isOpen
                      ? "bg-white text-[#555]"
                      : "bg-white text-[#555] hover:bg-gray-50"
                  }`}
                >
                  <span>{category.title}</span>

                  {isOpen ? (
                    <ChevronUp size={17} className="text-black/45" />
                  ) : (
                    <ChevronDown size={17} className="text-black/45" />
                  )}
                </button>

                {isOpen && (
                  <div className="bg-[#477B45] px-10 pb-2 pt-1">
                    <div className="space-y-1.5">
                      {category.items.map((item) => (
                        <Link
                          key={item.label}
                          href={item.href}
                          className="group flex min-h-[34px] items-center gap-2 rounded-[12px] bg-gradient-to-b from-[#C51212] to-[#A90000] px-2.5 py-1 text-white shadow-[0_2px_4px_rgba(0,0,0,0.22)] transition hover:brightness-110 active:scale-[0.99]"
                        >
                          <span className="flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-[5px] bg-white text-[#2E8B57]">
                            <Landmark size={16} strokeWidth={2.3} />
                          </span>

                          <span className="truncate font-roboto text-[14px] font-medium">
                            {item.label}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}