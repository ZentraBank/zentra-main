"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Copy, Check } from "lucide-react";

const coins = [
  {
    name: "USDT",
    network: "TON Blockchain",
    address: "shaoDLKJSIjLIDJ38793q9xn",
  },
  {
    name: "BITCOIN",
    network: "TON Blockchain",
    address: "shaoDLKJSIjLIDJ38793q9xn",
  },
  {
    name: "SOLANA",
    network: "TON Blockchain",
    address: "shaoDLKJSIjLIDJ38793q9xn",
  },
];

const plans = {
  bronze: {
    name: "Bronze",
    price: "$10",
    color: "#CD7F32",
  },

  gold: {
    name: "Gold",
    price: "$20",
    color: "#D4AF37",
  },

  diamond: {
    name: "Diamond",
    price: "$40",
    color: "#3D8D69",
  },
};



export default function CryptoCardPurchasePage() {

const [copiedCoin, setCopiedCoin] = useState<string | null>(null);

const copyAddress = async (coinName: string, address: string) => {
  await navigator.clipboard.writeText(address);
  setCopiedCoin(coinName);

  setTimeout(() => {
    setCopiedCoin(null);
  }, 1800);
};
const searchParams = useSearchParams();

const selectedPlan =
  searchParams.get("plan")?.toLowerCase() || "bronze";

const currentPlan =
  plans[selectedPlan as keyof typeof plans] || plans.bronze;


  return (
    <main className="relative min-h-[100svh] overflow-hidden bg-black text-white">
      <Image
        src="/images/Background_1.png"
        alt="Background"
        fill
        priority
        className="pointer-events-none object-cover"
      />

      <div className="relative z-10 mx-auto max-w-[430px] px-2 pb-8 pt-5">
        <header className="relative flex items-center justify-center">
          <Link href="/subscribe" className="absolute left-1 text-white">
            <ArrowLeft size={19} />
          </Link>

          <h2 className="text-[12px] font-bold">Payment</h2>
        </header>

        <section className="mt-9 grid grid-cols-[1fr_132px] items-center gap-2">
          <div>
            <h1 className="text-left text-[30px] font-extrabold leading-[34px] tracking-[-0.5px]">
              Purchase with cryptocurrency
            </h1>

            <p className="mt-4 max-w-[235px] text-left text-[13px] font-bold leading-[16px]">
              After this purchase; you will enjoy this Online Banking for the
              next 1 month. Re-subscribe, once it is expired!
            </p>
          </div>

          <Image
            src="/images/payment-1.png"
            alt="Crypto payment"
            width={135}
            height={135}
            priority
            className="object-contain"
          />
        </section>

        <section className="mt-8 overflow-hidden rounded-lg border border-orange-500 bg-black/40 shadow-[0_4px_15px_rgba(0,0,0,0.4)]">
          <Image
            src="/images/payment-2.png"
            alt=""
            width={420}
            height={90}
            className="absolute h-[88px] w-[calc(100%-16px)] max-w-[414px] rounded-lg object-cover opacity-70"
          />

          <div className="relative z-10 grid grid-cols-[1fr_auto] gap-y-1 px-3 py-3 text-left text-[12px] font-medium leading-4">
            <span>Purchase Amount:</span>
            <span className="text-[26px] font-extrabold leading-6">{currentPlan.price}</span>

            <span>Subscription type:</span>
            <span className="font-extrabold">{currentPlan.name}</span>

            <span>Payment method:</span>
            <span className="font-extrabold">Cryptocurrency</span>
          </div>
        </section>

        <section className="mt-4 rounded-t-xl bg-white px-2 pb-7 pt-3 text-black shadow-[0_0_18px_rgba(255,255,255,0.35)]">
          <h2 className="mb-2 text-left text-[13px] font-extrabold">
            Choose Payment Coin
          </h2>

          <div className="space-y-3">
            {coins.map((coin) => (
              <div
                key={coin.name}
                className="rounded-lg border border-black/15 bg-white px-3 py-2 shadow-sm"
              >
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-[13px] font-extrabold">{coin.name}</h3>
                  <span className="text-[11px] font-semibold">
                    {coin.network}
                  </span>
                </div>

                <button
                type="button"
                onClick={() => copyAddress(coin.name, coin.address)}
                className="flex h-[27px] w-full items-center justify-between rounded-full border border-black/15 px-3"
              >
                <span className="truncate text-[11px] text-black">
                  {copiedCoin === coin.name ? "Copied!" : coin.address}
                </span>

                {copiedCoin === coin.name ? (
                  <Check size={17} className="shrink-0 text-green-600" />
                ) : (
                  <Copy size={17} className="shrink-0 text-blue-700" />
                )}
              </button>
              </div>
            ))}
          </div>

          <ul className="mt-6 list-disc space-y-2 pl-5 text-left text-[11px] leading-[13px] text-black/55">
            <li>Please make this payment using the TON network</li>
            <li>
              You will be redirected outside our application to make this payment
              using your cryptocurrency wallet. Just copy the address above and
              proceed to your cryptocurrency wallet for payment.
            </li>
            <li>
              Upon successful payment, come back to subscriptions, click on
              “activate payment” and upload your payment receipts on the customer
              care chat page for confirmation and activation of your subscription.
            </li>
          </ul>

          <Link
            href="/subscribe/cards/checkout"
            className="mt-8 flex h-[42px] items-center justify-center gap-3 rounded-xl bg-blue-700 text-[14px] font-bold text-white"
          >
            Proceed to pay
            <ArrowRight size={18} />
          </Link>
        </section>
      </div>
    </main>
  );
}