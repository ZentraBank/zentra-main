"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Check, Copy, ExternalLink } from "lucide-react";

export default function CryptoPaymentPage() {
  const walletAddress = "shaoDLKJSIjLIDJ38793q9xn";
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy wallet address", err);
    }
  };

  return (
    <main className="min-h-screen bg-[#2F69E8] text-white lg:bg-[#E7EBF0] lg:text-[#252525]">
      <section className="mx-auto max-w-[430px] px-6 pb-10 pt-14 lg:max-w-[1180px] lg:px-8 lg:py-10">
        <header className="relative flex items-center justify-center lg:justify-between">
          <Link
            href="/cards/cards-purchase"
            className="absolute left-0 lg:static lg:grid lg:h-11 lg:w-11 lg:place-items-center lg:rounded-full lg:bg-white lg:text-[#252525] lg:shadow-sm"
          >
            <ArrowLeft size={22} />
          </Link>

          <h1 className="font-heading text-[15px] font-bold tracking-[0.15em] lg:text-[24px] lg:tracking-normal">
            Cards
          </h1>

          <div className="hidden lg:block lg:w-11" />
        </header>

        <div className="lg:mt-10 lg:grid lg:grid-cols-12 lg:gap-6">
          <section className="relative mt-10 min-h-[220px] lg:col-span-7 lg:mt-0 lg:min-h-[520px] lg:rounded-[32px] lg:bg-[#2F69E8] lg:p-10 lg:shadow-2xl">
            <div className="max-w-[230px] lg:max-w-[560px]">
              <h2 className="font-heading text-[30px] font-black font-sf-condensed leading-[38px] lg:text-[64px] lg:leading-[66px]">
                Purchase with cryptocurrency
              </h2>

              <p className="mt-6 text-center text-[14px] font-semibold font-lato leading-[20px] lg:max-w-[520px] lg:text-left lg:text-[18px] lg:leading-8">
                Due to your need to upgrade your account, you have to make your
                payment via our cryptocurrency address.
              </p>
            </div>

            <div className="absolute right-[-12px] top-0 h-[200px] w-[150px] lg:bottom-8 lg:right-8 lg:top-auto lg:h-[300px] lg:w-[260px]">
              <Image
                src="/images/crypto-payment.png"
                alt="Crypto illustration"
                fill
                priority
                className="object-contain"
              />
            </div>
          </section>

          <aside className="lg:col-span-5 lg:space-y-6">
            <section className="rounded-[10px] bg-white px-4 py-4 text-[#1f1f1f]/80 shadow-[0_8px_16px_rgba(0,0,0,0.18)] lg:rounded-[28px] lg:p-6 lg:shadow-sm w-[348px] h-[100px]">
              {/* <h2 className="hidden text-[22px] font-bold text-[#252525] lg:block">
                Payment Summary
              </h2> */}

              <div className="grid grid-cols-[1fr_auto] gap-y-2 lg:mt-5 lg:gap-y-5">
                <span className="font-heading text-[14px] font-black lg:text-[17px] text-[#1f1f1f]/80">
                  Purchase Amount:
                </span>

                <span className="text-[14px] font-black text-[#2F69E8] lg:text-[28px]">
                  $30
                </span>

                <span className="font-heading text-[14px] font-black lg:text-[17px] text-[#1f1f1f]/80">
                  Card Type:
                </span>

                <span className="text-[14px] font-semibold">Virtual</span>

                <span className="font-heading text-[14px] font-black lg:text-[17px] text-[#1f1f1f]/80">
                  Payment Method:
                </span>

                <span className="text-[14px] font-semibold">
                  Cryptocurrency
                </span>
              </div>
            </section>

            <section className="mt-7 rounded-[8px] border border-white/20 bg-[#A7C7E7]/10 p-4 shadow-[0_10px_20px_rgba(0,0,0,0.2)] backdrop-blur-sm lg:mt-0 lg:rounded-[28px] lg:border-none lg:bg-white lg:p-6 lg:text-[#252525] lg:shadow-sm">
              <h3 className="font-heading text-[14px] font-sf-condensed lg:text-[22px]">
                Crypto wallet address:
              </h3>

              <div className="mt-4 rounded-[8px] bg-white p-4 text-black lg:bg-[#F8FAFC]">
                <button
                  onClick={handleCopy}
                  className="flex w-full items-center justify-between rounded-full border border-gray-300 bg-[#F6F6F6] px-4 py-3 transition hover:bg-[#EFEFEF] lg:h-[52px]"
                >
                  <span className="truncate text-[14px] font-medium">
                    {walletAddress}
                  </span>

                  {copied ? (
                    <Check size={20} className="text-green-600" />
                  ) : (
                    <Copy size={20} className="text-[#2F69E8]" />
                  )}
                </button>

                {copied && (
                  <p className="mt-2 text-center text-[13px] font-medium text-green-600">
                    Wallet address copied successfully
                  </p>
                )}

                <p className="mt-4 text-[14px] font-medium text-[#252525] font-lato">
                  TON Blockchain
                </p>

                <ul className="mt-8 list-disc space-y-4 pl-5 text-[12px] leading-[16px] text-[#666666] lg:leading-6">
                  <li>Please make this payment using the TON network.</li>

                  <li>
                    Copy the address above and proceed to your cryptocurrency
                    wallet.
                  </li>

                  <li>
                    After successful payment, return to the cards section and
                    upload your receipt for verification.
                  </li>
                </ul>

                <Link
                  href="https://ton.org"
                  target="_blank"
                  className="mt-8 flex h-[29px] w-full items-center justify-center gap-2 rounded-[12px] bg-[#1D4ED8] text-[12px]  text-white shadow-md transition hover:opacity-90"
                >
                  Proceed to Pay
                  <ExternalLink size={18} />
                </Link>
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}