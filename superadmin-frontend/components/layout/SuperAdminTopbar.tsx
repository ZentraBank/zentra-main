"use client";

import Link from "next/link";
import {
  Bell,
  Menu,
  Search,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { platformNotificationsService } from "@/src/services/platform-notifications.service";

export default function SuperAdminTopbar({
  onOpenMenu,
}: {
  onOpenMenu: () => void;
}) {
  const [unreadCount, setUnreadCount] =
    useState(0);

  const loadUnreadCount =
    useCallback(async () => {
      try {
        const response =
          await platformNotificationsService.unreadCount();

        const count = Number(
          response.data?.unreadCount ?? 0,
        );

        setUnreadCount(count);
      } catch (error) {
        console.error(
          "Unable to load unread notification count:",
          error,
        );
      }
    }, []);

 useEffect(() => {
  void loadUnreadCount();

  const handleFocus = () => {
    void loadUnreadCount();
  };

  window.addEventListener(
    "focus",
    handleFocus,
  );

  return () => {
    window.removeEventListener(
      "focus",
      handleFocus,
    );
  };
}, [loadUnreadCount]);

  return (
    <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Open navigation"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 lg:hidden"
        >
          <Menu size={20} />
        </button>

        <div className="hidden items-center gap-3 rounded-xl bg-slate-100 px-4 py-2.5 md:flex md:w-[320px]">
          <Search
            size={18}
            className="text-slate-400"
          />

          <input
            type="search"
            placeholder="Search platform"
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 transition hover:bg-slate-50"
          aria-label={
            unreadCount > 0
              ? `${unreadCount} unread notifications`
              : "Notifications"
          }
        >
          <Bell size={19} />

          {unreadCount > 0 && (
            <span
              className="
                absolute
                -right-1.5
                -top-1.5
                flex
                h-5
                min-w-5
                items-center
                justify-center
                rounded-full
                bg-red-500
                px-1
                text-[10px]
                font-bold
                leading-none
                text-white
                ring-2
                ring-white
              "
            >
              {unreadCount > 99
                ? "99+"
                : unreadCount}
            </span>
          )}
        </Link>

        <Link
          href="/profile"
          className="flex items-center gap-3 rounded-xl p-1.5 pr-3 hover:bg-slate-100"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2458e8] text-sm font-bold text-white">
            SA
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-bold">
              Super Admin
            </p>

            <p className="text-xs text-slate-500">
              Platform owner
            </p>
          </div>
        </Link>
      </div>
    </header>
  );
}