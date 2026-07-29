"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { platformNavigation } from "@/src/config/platform-navigation";
import { usePlatformAuth } from "@/src/context/platform-auth-context";

export function PlatformSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { hasPermission } = usePlatformAuth();

  return (
    <>
      {open && <button type="button" aria-label="Close navigation" onClick={onClose} className="fixed inset-0 z-40 bg-black/70 lg:hidden" />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-white/10 bg-neutral-950 text-white transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <Link href="/dashboard" onClick={onClose}>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">ZentraBank</p>
            <p className="mt-1 text-lg font-semibold">Platform Control</p>
          </Link>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-white/5 lg:hidden" aria-label="Close sidebar"><X size={20} /></button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-5">
          {platformNavigation.filter(([, , permission]) => hasPermission(permission)).map(([label, href, , Icon]) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link key={href} href={href} onClick={onClose} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${active ? "bg-white text-black" : "text-neutral-400 hover:bg-white/5 hover:text-white"}`}>
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
