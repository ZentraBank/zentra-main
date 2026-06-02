import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function SubscribePage() {
  return (
    <main className="relative min-h-[100svh] overflow-hidden bg-black text-white">
      {/* Background */}
      <Image
        src="/images/Background.png"
        alt="Subscribe background"
        fill
        priority
        className="object-cover"
      />

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[430px] flex-col px-4 pt-19 pb-8 text-center md:max-w-[720px] md:px-8 md:pt-14">
        {/* Back */}
        <Link
        href="/dashboard"
        className="absolute left-4 top-[95px] z-30 inline-flex text-white md:left-8 md:top-[110px]"
        >
          <ArrowLeft size={20} />
        </Link>

        {/* Title */}
        <h1 className="font-heading text-[36px] font-semibold leading-none tracking-[1.5px] text-blue-700 [text-shadow:_0px_1px_0px_rgb(255_255_255_/_1)] md:text-[56px]">
          Subscribe!
        </h1>

        {/* Description */}
        <p className="mx-auto mt-8 max-w-[315px] text-[13px] font-medium leading-[17px] text-white md:mt-10 md:max-w-[520px] md:text-[18px] md:leading-[28px]">
          You can edit what the client sees in their ZentraBank account such as,
          money transfer receipt, account balance, next-of-kin details,
          donations, etc... You can serve as your client’s bank manager and also
          control all that happens to your clients account.
        </p>

        <p className="mt-5 text-[13px] font-medium md:text-[18px]">
          Subscribe to get started!
        </p>

        {/* Choose Plan */}
        <section className="mt-6 overflow-hidden rounded-xl border border-blue-500 bg-white text-black shadow-[0_0_10px_rgba(37,99,235,0.85)] md:mx-auto md:mt-8 md:w-full md:max-w-[560px] md:rounded-2xl">
          <h2 className="pt-1 text-[20px] font-extrabold leading-6 md:pt-3 md:text-[30px]">
            Choose Plan
          </h2>

          <div className="grid grid-cols-3 gap-2 px-4 pb-2 md:px-8 md:pb-4 md:pt-2">
            {["Read", "Unread", "Personal"].map((item, index) => (
              <button
                key={item}
                className={`h-6 rounded-md text-[11px] font-medium md:h-10 md:rounded-xl md:text-[15px] ${
                  index === 0
                    ? "bg-blue-700 text-white"
                    : "bg-gray-400 text-black"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        {/* Ring */}
        <div className="relative mt-7 flex justify-center md:mt-12">
          <Image
            src="/images/ring1.png"
            alt="Subscribe ring"
            width={270}
            height={270}
            priority
            className="h-[245px] w-[245px] object-contain md:h-[360px] md:w-[360px]"
          />

          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-heading text-[34px] font-semibold tracking-[7px] text-blue-700 [text-shadow:_0px_1px_0px_rgb(255_255_255_/_1)] md:text-[52px] md:tracking-[10px]">
              {/* Subscribe! */}
            </span>
          </div>
        </div>

        {/* Button */}
        <div className="mt-8 flex justify-center md:mt-10">
          <Link
            href="/subscribe/checkout"
            className="flex w-[245px] items-center justify-center gap-3 rounded-xl bg-blue-700 px-4 py-3 text-[14px] font-bold text-white shadow-[0_10px_25px_rgba(0,0,0,0.25)] md:w-[340px] md:rounded-2xl md:py-4 md:text-[18px]"
          >
            Subscribe now
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </main>
  );
}