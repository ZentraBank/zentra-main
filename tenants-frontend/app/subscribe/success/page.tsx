import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export default function SubscribeSuccessPage() {
  return (
    <main className="relative min-h-[100svh] overflow-hidden bg-black text-white">
      <Image
        src="/images/Background.png"
        alt="Background"
        fill
        priority
        className="object-cover"
      />

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[430px] flex-col px-4 pt-10 lg:max-w-6xl lg:px-10 lg:pt-16">
        <Link
          href="/subscribe"
          className="absolute left-3 top-10 text-white lg:left-10 lg:top-10"
        >
          <ArrowLeft size={18} />
        </Link>

        <section className="mt-[115px] rounded-xl border-[4px] border-[#c7b319] bg-black/80 px-5 pb-7 pt-6 text-center shadow-[0_0_14px_rgba(255,255,255,0.18)] lg:mx-auto lg:mt-[80px] lg:grid lg:w-full lg:max-w-5xl lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-10 lg:rounded-[32px] lg:border lg:border-white/15 lg:bg-white/[0.08] lg:p-10 lg:text-left lg:backdrop-blur-xl">
          {/* Image side */}
          <div className="lg:order-2">
            <h1 className="font-heading text-[21px] font-extrabold text-white lg:hidden">
              Congratulations!
            </h1>

            <div className="mt-5 flex justify-center lg:mt-0">
              <Image
                src="/images/success.png"
                alt="Success"
                width={220}
                height={135}
                className="object-contain lg:h-[330px] lg:w-[520px]"
              />
            </div>
          </div>

          {/* Text side */}
          <div className="lg:order-1">
            <div className="hidden lg:mb-6 lg:flex lg:h-14 lg:w-14 lg:items-center lg:justify-center lg:rounded-2xl lg:bg-blue-700/20 lg:text-blue-300">
              <CheckCircle2 size={30} />
            </div>

            <h1 className="hidden font-heading font-extrabold text-white lg:block lg:text-[54px] lg:leading-[60px]">
              Congratulations!
            </h1>

            <p className="mx-auto mt-6 max-w-[280px] text-[13px] leading-[18px] text-white lg:mx-0 lg:mt-5 lg:max-w-[480px] lg:text-[22px] lg:font-semibold lg:leading-[32px]">
              Your account has just been subscribed for the third-level service
            </p>

            <p className="mx-auto mt-3 max-w-[280px] text-[13px] leading-[18px] text-white/90 lg:mx-0 lg:mt-4 lg:max-w-[460px] lg:text-[16px] lg:leading-[26px] lg:text-white/65">
              Jorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>

            <div className="mx-auto mt-5 h-px w-[88%] bg-white/40 lg:mx-0 lg:mt-8 lg:w-full lg:bg-white/15" />

            <Link
              href="/dashboard"
              className="mx-auto mt-7 flex h-11 w-full max-w-[310px] items-center justify-center rounded-xl bg-blue-700 text-[14px] font-bold text-white shadow-[0_10px_25px_rgba(0,0,0,0.25)] lg:mx-0 lg:h-14 lg:max-w-[260px] lg:rounded-2xl lg:text-[16px] lg:transition lg:hover:bg-blue-800"
            >
              Go to Dashboard
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}