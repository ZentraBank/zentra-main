// app/page.tsx

"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Grid2X2, ChevronDown } from "lucide-react";
import AuthOverlay from "@/components/auth/AuthOverlay";

const features = [
  { title: "Loan", image: "/images/loan.png", icon: "/icons/loan.png" },
  {
    title: "Investment",
    image: "/images/investment.png",
    icon: "/icons/investment.png",
  },
  {
    title: "Donations",
    image: "/images/donations.png",
    icon: "/icons/donation.png",
  },
  {
    title: "Bill Payment",
    image: "/images/bill-payment.png",
    icon: "/icons/bill.png",
  },
  {
    title: "P.O.D Net-of-kin",
    image: "/images/nok.png",
    icon: "/icons/pod.png",
  },
  {
    title: "Transfer",
    image: "/images/transfer.png",
    icon: "/icons/transfer.png",
  },
];

const partners = [
  { name: "Santander", image: "/images/santander.png" },
  { name: "Rocket Mortgage", image: "/images/rocket-mortgage.png" },
  { name: "LendingClub", image: "/images/lending-club.png" },
  { name: "Capital One", image: "/images/capital-one.png" },
  { name: "BlackRock", image: "/images/blackrock.png" },
  { name: "American Express", image: "/images/american-express.png" },
  { name: "Robinhood", image: "/images/robinhood.png" },
  { name: "Vanguard", image: "/images/vanguard.png" },
  { name: "Sequoia", image: "/images/sequoia.png" },
  { name: "Charles Schwab", image: "/images/charles-schwab.png" },
];

const providers = [
  "AT&T Mobility",
  "AT&T Mobility",
  "AT&T Mobility",
  "AT&T Mobility",
  "AT&T Mobility",
  "AT&T Mobility",
  "AT&T Mobility",
  "AT&T Mobility",
];

export default function WelcomePage() {
  const [authOpen, setAuthOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"register" | "login">("register");

  const openRegister = () => {
    setAuthMode("register");
    setAuthOpen(true);
    setMenuOpen(false);
  };

  const openLogin = () => {
    setAuthMode("login");
    setAuthOpen(true);
    setMenuOpen(false);
  };

  return (
    <>
      <main className="min-h-screen bg-[#E7EBF0] text-[#1F1F1F]/80">
        <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
          <Image
            src="/images/logo.png"
            alt="ZentraBank"
            width={54}
            height={54}
            className="rounded-md"
          />

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openLogin}
              className="flex items-center gap-2 rounded-xl bg-[#E7EBF0] px-5 py-2 text-sm font-semibold shadow-sm"
            >
              Login <ArrowRight size={17} className="text-[#2E8B57]" />
            </button>

            <button title="Open menu"
              type="button"
              onClick={() => setMenuOpen(true)}
              className="grid h-11 w-11 place-items-center rounded-full bg-white/70 shadow-sm"
            >
              <Grid2X2 className="text-[#2E8B57]" size={24} />
            </button>
          </div>
        </header>

        <section className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="relative overflow-hidden rounded-[28px] bg-transparent text-white lg:min-h-[560px] w-full">
            <Image
              src="/images/hero.png"
              alt="ZentraBank city"
              fill
              priority
              className="object-cover"
            />

            <div className="relative z-10 flex min-h-[455px] flex-col items-center justify-center px-5 py-16 text-center lg:min-h-[560px]">
              <h1
                className="
                  max-w-4xl
                  text-center
                  font-sf-condensed
                  text-[24px]
                  font-bold
                  uppercase
                  leading-[30px]
                  text-[#1f1f1f]/80
                  [text-shadow:_-2px_-2px_0_#ffffff,_2px_-2px_0_#ffffff,_-2px_2px_0_#ffffff,_2px_2px_0_#ffffff,_4px_4px_0_#ffffff]
                  md:text-6xl
                  md:leading-[64px]
                "
              >
                Welcome to the ONE-
                <br />
                STOP Banking
                <br />
                Network in USA
              </h1>

              <p className="mt-8 max-w-xl font-lato text-[14px] font-semibold drop-shadow md:text-lg">
                Zentrabank Gateway is the best thing that can happen to you
              </p>

              <Link
              href="/onboarding"
              className="mt-14 flex h-[35px] w-[200px] items-center justify-center rounded-[12px] bg-[#1D4ED8] px-12 text-[12px] font-bold text-white shadow-lg"
            >
              Create account
            </Link>
            </div>
          </div>
        </section>

        <section id="about" className="mx-auto mt-8 max-w-7xl px-5 lg:px-8">
          <div className="mb-5 -mt-6 flex">
            <span className="ml-auto h-[16px] w-[162px] rounded-[12px] bg-white/30 px-8 font-lato text-[10px]">
              What is ZentraBank?
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 md:grid-cols-6 lg:gap-6">
            {features.map((item) => (
              <div
                key={item.title}
                className="relative h-[145px] overflow-hidden rounded-t-[18px] md:h-[190px] lg:h-[220px]"
                style={{
                  borderBottomLeftRadius: "55% 14%",
                  borderBottomRightRadius: "55% 14%",
                }}
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                />

                <span className="absolute bottom-[28px] left-1/2 max-w-[86px] -translate-x-1/2 bg-black/85 px-2 py-[2px] text-center text-[12px] leading-[13px] text-white md:max-w-[110px] md:text-sm md:leading-4">
                  {item.title}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 flex h-[40px] items-center justify-between gap-4 md:justify-center md:gap-10">
            <p className="max-w-[345px] font-lato text-[14px] leading-5 text-[#1f1f1f]/80 md:max-w-lg md:text-base">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>

            <button className="h-[24px] min-w-[118px] rounded-[12px] bg-white px-8 font-roboto text-sm font-semibold text-[#555]">
              Button
            </button>
          </div>
        </section>

        <section className="mt-10 bg-[#1D4ED8] px-5 py-8 text-white">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-5 text-center font-sf-condensed text-[16px] font-bold tracking-widest text-[#1f1f1f]/80">
              About ZentraBank
            </h2>

            <p className="max-w-3xl font-lato text-[14px] leading-6 md:text-base">
              ZentraBank is a modern digital finance platform built to help
              users manage subscriptions, payments, virtual cards, transfers,
              and secure account activities from one simple dashboard.
            </p>
          </div>
        </section>

        <section id="services" className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
          <h2 className="mb-8 text-center text-[16px] font-bold tracking-widest text-[#1f1f1f]/80">
            Our Services
          </h2>

          <div className="relative mx-auto h-[330px] w-full max-w-[390px]">
            <Image
              src="/images/home-3.png"
              alt="Services Background"
              fill
              priority
              className="object-contain"
            />

            <Link href="/services" className="absolute inset-0 z-10">
              <Image
                src="/images/services.png"
                alt="Our Services"
                fill
                className="object-contain"
              />
            </Link>
          </div>
        </section>

        <section
          id="how-it-works"
          className="mx-auto max-w-7xl px-5 py-10 lg:px-8"
        >
          <h2 className="mb-8 text-center text-[16px] font-bold tracking-widest text-[#1F1F1F]/80">
            How ZentraBank Works
          </h2>

          <div className="mx-auto w-full max-w-[390px]">
            <Image
              src="/images/flowchart.png"
              alt="ZentraBank Flow Chart"
              width={390}
              height={498}
              priority
              className="h-auto w-full object-contain"
            />
          </div>
        </section>

        <section className="mx-auto max-w-[390px] px-5 pb-10">
          <div className="grid grid-cols-5 gap-x-4 gap-y-4">
            {partners.map((partner) => (
              <div
                key={partner.name}
                className="flex h-[38px] items-center justify-center overflow-hidden"
              >
                <Image
                  src={partner.image}
                  alt={partner.name}
                  width={58}
                  height={38}
                  className="h-full w-full object-contain"
                />
              </div>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <Link
              href="/onboarding"
              className="mt-14 flex h-[35px] w-[200px] items-center justify-center rounded-[12px] bg-[#1D4ED8] px-12 text-[12px] font-bold text-white shadow-lg"
            >
              Create account
            </Link>
          </div>

          <section id="faqs" className="mx-auto max-w-[390px] px-4 py-5">
            <div className="grid grid-cols-2 gap-x-3 gap-y-2">
              {providers.map((provider, index) => (
                <button
                  key={index}
                  type="button"
                  className="
                    flex h-[34px] items-center justify-between
                    rounded-tl-[4px]
                    rounded-tr-[4px]
                    rounded-bl-[4px]
                    rounded-br-[20px]
                    bg-white px-3 text-left font-lato text-[13px]
                    font-medium text-[#1f1f1f]/80
                  "
                >
                  <span>{provider}</span>
                  <ChevronDown size={16} className="text-[#555]" />
                </button>
              ))}
            </div>
          </section>
        </section>

        <footer className="bg-[#27673F] px-5 pt-6 text-[#102414]">
          <div className="mx-auto max-w-[390px]">
            <h2 className="mb-3 text-center font-sf-condensed text-[14px] font-bold tracking-[2px]">
              Subscribe to our Newsletter
            </h2>

            <div className="mb-3 flex h-[35px] items-center rounded-full border border-white/30 bg-white/35 px-2">
              <input
                placeholder="Enter email"
                className="h-full flex-1 bg-transparent px-2 text-[13px] text-[#1F1F1F] outline-none placeholder:text-[#1F1F1F]/40"
              />

              <button className="h-[20px] rounded-[12px] bg-[#1D4ED8] px-7 font-roboto text-[12px] font-semibold text-white">
                Subscribe
              </button>
            </div>

            <h3 className="py-1 text-center font-sf-condensed text-[14px] font-bold tracking-[2px]">
              Our Services
            </h3>

            <p className="mt-3 font-lato text-[13px] font-medium leading-[18px] text-black">
              ZentraBank is a complete e-Banking system. We have account-holders
              from almost all over the world. We are your trusted partner in the
              world of intelligent investing and financial growth. We are a
              premier banking institution that specializes in serving the unique
              needs of hedge funds, institutional investors, and high-net-worth
              individuals.
            </p>

            <div className="mt-3">
              <h4 className="text-[13px] font-bold text-white">Quick Links</h4>

              <div className="mt-3 grid grid-cols-3 gap-2 text-[12px] font-medium text-[#14351F]">
                <Link href="/register">Register</Link>
                <Link href="/branches">Our Branches</Link>
                <Link href="/contact">Contact</Link>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-[13px] font-bold text-white">Quick Links</h4>

              <div className="mt-3 grid grid-cols-2 gap-y-2 text-[12px] font-medium text-[#14351F]">
                <Link href="/company-policy">Company Policy</Link>
                <Link href="/privacy-policy">Privacy Policy</Link>
                <Link href="/terms">Terms of Service</Link>
                <Link href="/register">Register</Link>
              </div>
            </div>

            <div className="mt-4 flex items-end justify-between gap-4">
              <div>
                <h4 className="text-[13px] font-bold text-[#14351F]">
                  Contact Us
                </h4>

                <ul className="mt-1 list-disc pl-4 text-[12px] font-medium leading-[18px] text-[#14351F]">
                  <li>Istanbul, Istanbul, Turkey</li>
                  <li>support@isbrkonline.com</li>
                </ul>
              </div>

              <div className="flex items-center gap-2 pb-1">
                <Image
                  src="/images/facebook.png"
                  alt="Facebook"
                  width={18}
                  height={18}
                />
                <Image
                  src="/images/instagram.png"
                  alt="Instagram"
                  width={18}
                  height={18}
                />
                <Image
                  src="/images/google.png"
                  alt="Google"
                  width={18}
                  height={18}
                />
              </div>
            </div>

            <div className="mx-auto mt-12 h-[37px] w-[320px] rounded-t-[2px] bg-[#39945A] py-4 text-center text-[12px] font-medium text-white">
              Copyright © 2023 İşbank All Right Reserved
            </div>
          </div>
        </footer>
      </main>

     {menuOpen && (
  <div className="fixed inset-0 z-50 bg-[#E7EBF0]/70 backdrop-blur-[1px]">
    <button
      type="button"
      onClick={() => setMenuOpen(false)}
      className="absolute inset-0"
      aria-label="Close menu"
    />

    <div className="absolute right-5 top-[78px] h-[358px] w-[224px] rounded-[6px] p-3">
      <div className="mb-4 flex ">
        <Image
          src="/images/logo.png"
          alt="ZentraBank"
          width={50}
          height={50}
          className="rounded-md"
        />
      </div>

      <nav className="relative z-10 flex flex-col gap-2">
        {[
          { label: "Login/Sign up", action: openRegister },
          { label: "About Us", href: "#about" },
          { label: "Our Services", href: "#services" },
          { label: "How it works", href: "#how-it-works" },
          { label: "Frequently Asked Questions", href: "#faqs" },
        ].map((item) =>
          item.href ? (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="relative flex min-h-[36px] items-center gap-3 overflow-hidden rounded-tl-[4px] rounded-tr-[4px] rounded-bl-[4px] rounded-br-[22px] bg-white px-3 font-lato text-[14px] leading-[18px] text-[#1F1F1F] shadow-sm"
            >
              <span className="relative z-10 text-[#1f1f1f]/80">✓</span>
              <span className="relative z-10">{item.label}</span>

             <span className="pointer-events-none absolute right-0 bottom-0 h-[24px] w-[34px] rounded-br-[22px] border-r-2 border-b-2 border-[#15803D]" />
            </Link>
          ) : (
            <button
              key={item.label}
              type="button"
              onClick={item.action}
              className="relative flex min-h-[36px] w-full items-center gap-3 overflow-hidden rounded-tl-[4px] rounded-tr-[4px] rounded-bl-[4px] rounded-br-[22px] bg-white px-3 text-left font-lato text-[14px] leading-[18px] text-[#1F1F1F] shadow-sm"
            >
              <span className="relative z-10 text-[#2E8B57]">✓</span>
<span className="relative z-10">{item.label}</span>

<span className="pointer-events-none absolute right-0 bottom-0 h-[24px] w-[34px] rounded-br-[22px] border-r-2 border-b-2 border-[#2E8B57]" />
            </button>
          )
        )}
      </nav>
    </div>
  </div>
)}

      <AuthOverlay
        open={authOpen}
        mode={authMode}
        onClose={() => setAuthOpen(false)}
      />
    </>
  );
}