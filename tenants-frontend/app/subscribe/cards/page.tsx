import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Copy, Sparkles } from "lucide-react";

export default function CryptoCardPurchasePage() {
  return (
    <main className="relative min-h-[100svh] overflow-hidden bg-black text-white">
      <Image
        src="/images/Background.png"
        alt="Background"
        fill
        priority
        className="object-cover"
      />

      <div className="relative z-10 mx-auto max-w-[430px] px-4 pb-8 pt-10">
        <Link
          href="/subscribe"
          className="absolute left-3 top-10 inline-flex text-white"
        >
          <ArrowLeft size={18} />
        </Link>

        <p className="text-center text-[11px] font-semibold text-black/30">
          Cards
        </p>

        <section className="mt-8 grid grid-cols-[1fr_120px] items-center gap-3">
          <div>
            <h1 className="text-left font-heading text-[31px] font-extrabold leading-[35px] tracking-[-0.5px] text-white">
              Purchase with cryptocurrency
            </h1>

            <p className="mt-4 max-w-[230px] text-left text-[13px] font-bold leading-[16px] text-white">
              After this purchase; you will enjoy this Online Banking for the
              next 1 month. Re-subscribe, if your&apos;s is expired!
            </p>
          </div>

          <Image
            src="/images/crypto-illustration.png"
            alt="Crypto payment"
            width={125}
            height={125}
            className="object-contain"
          />
        </section>

        <section className="mt-8 rounded-lg border border-orange-400 bg-[linear-gradient(135deg,#168a25_0%,#ed1717_48%,#168a25_100%)] px-2 py-2 shadow-[0_4px_10px_rgba(0,0,0,0.35)]">
          <div className="grid grid-cols-[1fr_1fr] gap-y-1 text-left text-[11px] font-bold leading-4">
            <span>Purchase Amount:</span>
            <span className="text-[24px] leading-5">$30</span>

            <span>Card Type:</span>
            <span>Virtual</span>

            <span>Payment method:</span>
            <span>Cryptocurrency</span>
          </div>
        </section>

        <section className="mt-6 rounded-lg bg-white/10 p-4 shadow-[0_0_18px_rgba(255,255,255,0.12)]">
          <h2 className="text-left text-[13px] font-extrabold text-white">
            Crypto wallet address:
          </h2>

          <div className="mt-3 rounded-md bg-white px-3 py-3 text-black">
            <div className="flex h-9 items-center justify-between rounded-full border border-black/15 px-3">
              <span className="truncate text-[11px] text-black/70">
                shaodLKJSIjLIDJ38793q9xn
              </span>
              <Copy size={17} className="text-blue-700" />
            </div>

            <p className="mt-3 text-left text-[13px] font-medium text-black">
              TON Blockchain
            </p>

            <ul className="mt-8 list-disc space-y-3 pl-5 text-left text-[10px] leading-[11px] text-black/50">
              <li>Please make this payment using the TON network</li>
              <li>
                You will be redirected outside our application to make this
                payment using your cryptocurrency wallet. Just copy the address
                above and proceed to your cryptocurrency wallet for payment
              </li>
              <li>
                Upon successful payment, come back to cards and upload your
                payment receipts for verification and confirmation of your card
                purchase.
              </li>
            </ul>

            <Link
              href="/subscribe/cards/checkout"
              className="mt-5 flex h-10 items-center justify-center gap-3 rounded-xl bg-blue-700 text-[13px] font-bold text-white"
            >
              <Sparkles size={15} />
              Proceed to pay
              <ArrowRight size={17} />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}