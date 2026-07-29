"use client";

import Link from "next/link";
import { Bell, LogOut, Menu } from "lucide-react";
import { usePlatformAuth } from "@/src/context/platform-auth-context";

export function PlatformHeader({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const { user, logout } = usePlatformAuth();
  const initials = [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join("").toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-white/10 bg-neutral-950/90 px-5 backdrop-blur-xl sm:px-8">
      <button type="button" onClick={onOpenSidebar} className="rounded-xl border border-white/10 p-2.5 lg:hidden" aria-label="Open sidebar"><Menu size={20} /></button>
      <div className="ml-auto flex items-center gap-3">
        <Link href="/notifications" className="rounded-xl border border-white/10 p-2.5 text-neutral-400" aria-label="Notifications"><Bell size={19} /></Link>
        <div className="hidden sm:block">
          <p className="text-right text-sm font-medium">{user?.firstName} {user?.lastName}</p>
          <p className="text-right text-xs text-neutral-500">{user?.email}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sm font-semibold text-black">{initials || "SA"}</div>
        <button type="button" onClick={() => void logout()} className="rounded-xl border border-white/10 p-2.5 text-neutral-400 hover:text-red-300" aria-label="Sign out"><LogOut size={19} /></button>
      </div>
    </header>
  );
}
