"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    href: "/dashboard",
    src: "/images/profile-dashboard.png",
  },
  {
    href: "/cards",
    src: "/images/profile-profile.png",
  },
  {
    href: "/profile",
    src: "/images/profile-transactions.png",
  },
  {
    href: "/wallet",
    src: "/images/profile-investment.png",
  },
  {
    href: "/transactions",
    src: "/images/profile-more.png",
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 z-50 flex w-full max-w-[430px] -translate-x-1/2 items-center justify-between border-t border-[#16884F] bg-white/80 px-3 py-2 shadow-[0_-8px_25px_rgba(0,0,0,0.25)] backdrop-blur-md">
      {navItems.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex h-[55px] w-[67px] items-center justify-center rounded-[17px] border-2 border-[#16884F] bg-white/70 backdrop-blur transition active:scale-95 ${
              active ? "shadow-md" : ""
            }`}
          >
            <Image
              src={item.src}
              alt="Navigation icon"
              width={33}
              height={33}
            />
          </Link>
        );
      })}
    </nav>
  );
}