"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, X } from "lucide-react";
import { navigation } from "@/config/navigation";

type Props = {
  mobileOpen: boolean;
  onClose: () => void;
};

export default function SuperAdminSidebar({ mobileOpen, onClose }: Props) {
  const pathname = usePathname();

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation overlay"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col bg-[#0f1f46] text-white transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-6">
          <Link href="/dashboard" onClick={onClose}>
            <p className="text-xl font-black">ZentraBank</p>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-blue-200">
              Superadmin
            </p>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-blue-100 hover:bg-white/10 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-5">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  active
                    ? "bg-[#2458e8] text-white"
                    : "text-blue-100 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={19} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <form action="/api/auth/logout" method="post" className="border-t border-white/10 p-4">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-200 hover:bg-red-500/15"
          >
            <LogOut size={19} />
            Sign out
          </button>
        </form>
      </aside>
    </>
  );
}
