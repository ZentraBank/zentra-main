"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  CreditCard,
  House,
  Landmark,
  Menu,
  Send,
  UserRound,
  X,
} from "lucide-react";

const navItems = [
  {
    label: "Home",
    href: "/dashboard",
    icon: House,
  },
  {
    label: "Accounts",
    href: "/dashboard/accounts",
    icon: Landmark,
  },
  {
    label: "Transfer",
    href: "/dashboard/transfer",
    icon: Send,
  },
  {
    label: "Cards",
    href: "/dashboard/cards",
    icon: CreditCard,
  },
  {
    label: "Profile",
    href: "/dashboard/profile",
    icon: UserRound,
  },
];

export default function TransparentNavbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href;
    }

    return pathname.startsWith(href);
  };

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-[100] px-4 pt-4 md:px-8 md:pt-6">
        <nav
          aria-label="Main navigation"
          className="mx-auto flex h-[62px] w-full max-w-[1200px] items-center justify-between rounded-[22px] border border-white/20 bg-white/10 px-4 shadow-[0_14px_40px_rgba(0,0,0,0.16)] backdrop-blur-2xl md:h-[70px] md:px-5"
        >
          <Link
            href="/dashboard"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-3 text-white"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-white/20 bg-white/10 shadow-inner md:h-11 md:w-11">
              <Landmark size={21} strokeWidth={2.3} />
            </div>

            <div>
              <p className="text-[17px] font-black leading-none tracking-[-0.02em] md:text-[19px]">
                ZentraBank
              </p>

              <p className="mt-1 text-[8px] font-medium uppercase tracking-[0.22em] text-white/65 md:text-[9px]">
                Online Banking
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((previous) => !previous)}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            className="flex h-11 w-11 items-center justify-center rounded-[15px] border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
          >
            {menuOpen ? (
              <X size={23} strokeWidth={2.3} />
            ) : (
              <Menu size={24} strokeWidth={2.3} />
            )}
          </button>
        </nav>
      </header>

      {/* Dark transparent backdrop */}
      <button
        type="button"
        aria-label="Close navigation menu"
        onClick={() => setMenuOpen(false)}
        className={`fixed inset-0 z-[80] bg-black/25 backdrop-blur-[2px] transition-all duration-300 ${
          menuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      {/* Dropdown menu */}
      <div
        className={`fixed left-4 right-4 top-[88px] z-[90] mx-auto max-w-[1200px] transition-all duration-300 md:left-8 md:right-8 md:top-[108px] ${
          menuOpen
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-4 opacity-0"
        }`}
      >
        <div className="ml-auto w-full overflow-hidden rounded-[24px] border border-white/20 bg-black/20 p-3 shadow-[0_24px_70px_rgba(0,0,0,0.35)] backdrop-blur-3xl sm:w-[330px]">
          <div className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`group flex min-h-[58px] items-center gap-3 rounded-[17px] px-4 transition-all duration-200 ${
                    active
                      ? "bg-white text-[#173d2a] shadow-[0_10px_28px_rgba(0,0,0,0.18)]"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] ${
                      active
                        ? "bg-[#173d2a]/10"
                        : "border border-white/10 bg-white/10"
                    }`}
                  >
                    <Icon
                      size={20}
                      strokeWidth={active ? 2.6 : 2.1}
                    />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-bold">{item.label}</p>

                    <p
                      className={`mt-0.5 text-[10px] ${
                        active ? "text-[#173d2a]/60" : "text-white/50"
                      }`}
                    >
                      Go to {item.label.toLowerCase()}
                    </p>
                  </div>

                  {active && (
                    <span className="h-2 w-2 rounded-full bg-[#173d2a]" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}