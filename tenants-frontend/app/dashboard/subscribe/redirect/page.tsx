import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

const wallets = [
  {
    name: "Trust Wallet",
    image: "/images/trust-wallet.png",
    href: "/subscribe/cards/payment-proof",
  },
  {
    name: "Coinbase Wallet",
    image: "/images/coinbase-wallet.png",
    href: "/subscribe/cards/payment-proof",
  },
  {
    name: "Meta Wallet",
    image: "/images/meta-wallet.png",
    href: "/subscribe/cards/payment-proof",
  },
  {
    name: "Hot Wallet",
    image: "/images/hot-wallet.png",
    href: "/subscribe/cards/payment-proof",
  },
];

export default function CryptoRedirectPage() {
  return (
    <main className="relative min-h-[100svh] overflow-hidden bg-black text-white">
      <Image
        src="/images/Background_1.png"
        alt="Background"
        fill
        priority
        className="pointer-events-none object-cover"
      />

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[430px] flex-col px-4 py-5">
        <Link href="/subscribe/cards" className="text-white">
          <ArrowLeft size={20} />
        </Link>

        <section className="mt-20 rounded-[10px] border-[5px] border-white bg-black/90 px-4 py-5 shadow-[0_0_18px_rgba(255,255,255,0.35)]">
          <h1 className="text-center text-[22px] font-extrabold tracking-wide">
            Re-directing...
          </h1>

          <div className="mx-auto mt-7 h-[125px] w-[205px] overflow-hidden rounded-tl-[90px] rounded-br-[90px] bg-red-700">
            <Image
              src="/images/payment-1.png"
              alt="Crypto payment"
              width={205}
              height={125}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="mx-auto mt-7 h-px w-[88%] bg-white/70" />

          <p className="mx-auto mt-7 max-w-[260px] text-center text-[14px] font-medium leading-[18px]">
            You will be re-directed to your cryptocurrency wallet for this
            subscription
          </p>

          <div className="mx-auto mt-8 h-px w-[88%] bg-white/70" />

          <div className="mt-7 rounded-md bg-white px-2 py-3 text-black">
            <h2 className="mb-2 text-left text-[13px] font-extrabold text-gray-500">
              Choose a Crypto wallet
            </h2>

            <div className="grid grid-cols-4 gap-2">
              {wallets.map((wallet) => (
                <Link
                  key={wallet.name}
                  href={wallet.href}
                  className="rounded-md bg-blue-700 p-1 text-center shadow-[0_0_0_2px_rgba(37,99,235,0.9)]"
                >
                  <div className="relative mx-auto h-[38px] w-[38px]">
                    <Image
                      src={wallet.image}
                      alt={wallet.name}
                      fill
                      className="object-contain"
                    />
                  </div>

                  <p className="mt-1 text-[10px] font-semibold leading-[11px] text-white">
                    {wallet.name}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}