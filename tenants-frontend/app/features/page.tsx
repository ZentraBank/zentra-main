// app/features/page.tsx

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function FeaturesPage() {
  return (
    <main className="relative h-[100dvh] overflow-hidden bg-black lg:hidden">
      <Image
        src="/images/homepage2.png"
        alt="Complete Billing Formats"
        fill
        priority
        sizes="100vw"
        className="object-cover object-top"
      />

      <div className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2">
        <Link
          href="/login"
          className="flex h-[52px] w-[240px] items-center justify-center gap-3 rounded-2xl bg-[var(--primary)] text-sm font-semibold text-white shadow-2xl"
        >
          See more
          <ArrowRight size={18} />
        </Link>
      </div>
    </main>
  );
}