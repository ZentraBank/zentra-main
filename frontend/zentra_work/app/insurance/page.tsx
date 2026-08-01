import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function InsuranceComingSoonPage() {
  return (
    <main
      className="
        min-h-screen
        bg-[url('/images/cards-bg.png')]
        bg-cover
        bg-top
        bg-no-repeat
        px-6
        pt-11
        text-white
      "
    >
      <header className="relative flex items-center justify-center">
        <Link
          href="/dashboard"
          aria-label="Go back"
          className="absolute left-0 text-[#1F3E78]"
        >
          <ArrowLeft size={20} />
        </Link>

        <h1 className="font-lato text-[13px] font-bold tracking-wide">
          Insurance
        </h1>
      </header>

      <section
        className="
          mt-10
          flex
          h-[177px]
          w-full
          items-center
          justify-center
          rounded-[6px]
          bg-white/45
        "
      >
        <p className="font-lato text-[16px] font-medium text-[#8F96A8]">
          Coming soon!
        </p>
      </section>
    </main>
  );
}