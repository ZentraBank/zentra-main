"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function MobileNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const menuItems = [
    { label: "Home", href: "/" },
    { label: "Features", href: "/features" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <div className="fixed left-0 top-0 z-50 w-full bg-white px-6 py-3 shadow-sm md:hidden">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-sm font-bold text-black/80">
          ZentraBank
        </Link>

        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-black/5 text-black/80"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <div className="mt-4 flex flex-col gap-2 border-t border-black/10 pt-3">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-left text-sm font-semibold text-black/80 hover:bg-black/5"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}