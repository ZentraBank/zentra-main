"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

type NavbarProps = {
  variant?: "light" | "dark";
};

export default function Navbar({ variant = "light" }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const isDark = variant === "dark";

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Features", href: "/features" },
    { label: "Services", href: "/services" },
    { label: "Contact", href: "/contact" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav
      className={`fixed left-0 top-0 z-50 w-full px-5 py-3 md:px-8 md:py-4 ${
        isDark ? "text-white" : "text-black"
      }`}
    >
      <div
        className={`mx-auto max-w-7xl rounded-2xl border px-5 py-3 shadow-lg backdrop-blur-xl md:rounded-3xl md:px-6 md:py-4 ${
          isDark
            ? "border-white/10 bg-black/45"
            : "border-black/10 bg-white/85"
        }`}
      >
        <div className="flex items-center justify-between">
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="text-sm font-bold md:text-lg"
          >
            ZentraBank
          </Link>

          {/* Desktop Menu */}
          <div className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`text-sm font-medium transition ${
                  isActive(item.href)
                    ? isDark
                      ? "text-white"
                      : "text-blue-700"
                    : isDark
                    ? "text-white/65 hover:text-white"
                    : "text-black/65 hover:text-blue-700"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <Link
            href="/subscribe"
            className="hidden rounded-2xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-600 md:block"
          >
            Subscribe
          </Link>

          {/* Mobile Toggle */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className={`flex h-9 w-9 items-center justify-center rounded-lg md:hidden ${
              isDark ? "bg-white/10 text-white" : "bg-black/5 text-black"
            }`}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div
            className={`mt-4 flex flex-col gap-2 border-t pt-3 md:hidden ${
              isDark ? "border-white/10" : "border-black/10"
            }`}
          >
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${
                  isActive(item.href)
                    ? isDark
                      ? "bg-white/10 text-white"
                      : "bg-blue-50 text-blue-700"
                    : isDark
                    ? "text-white/75 hover:bg-white/10"
                    : "text-black/75 hover:bg-black/5"
                }`}
              >
                {item.label}
              </Link>
            ))}

            <Link
              href="/subscribe"
              onClick={() => setMenuOpen(false)}
              className="mt-2 rounded-xl bg-blue-700 px-4 py-3 text-center text-sm font-semibold text-white"
            >
              Subscribe
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}