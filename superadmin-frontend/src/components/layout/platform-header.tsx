"use client";

import Link from "next/link";
import {
  Bell,
  LogOut,
  Menu,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { usePlatformAuth } from "@/src/context/platform-auth-context";
import { platformNotificationsService } from "@/src/services/platform-notifications.service";

export function PlatformHeader({
  onOpenSidebar,
}: {
  onOpenSidebar: () => void;
}) {
  const { user, logout } = usePlatformAuth();

  const [unreadCount, setUnreadCount] =
    useState(0);

  const initials = [
    user?.firstName?.[0],
    user?.lastName?.[0],
  ]
    .filter(Boolean)
    .join("")
    .toUpperCase();

  const loadUnreadCount =
    useCallback(async () => {
      try {
        const response =
          await platformNotificationsService.unreadCount();

        const count = Number(
          response.data?.unreadCount ?? 0,
        );

        console.log(
          "[PLATFORM HEADER] unread count:",
          count,
        );

        setUnreadCount(count);
      } catch (error) {
        console.error(
          "[PLATFORM HEADER] unable to load unread count:",
          error,
        );
      }
    }, []);

  useEffect(() => {
    void loadUnreadCount();

    const interval =
      window.setInterval(() => {
        void loadUnreadCount();
      }, 10000);

    const handleFocus = () => {
      void loadUnreadCount();
    };

    window.addEventListener(
      "focus",
      handleFocus,
    );

    return () => {
      window.clearInterval(interval);

      window.removeEventListener(
        "focus",
        handleFocus,
      );
    };
  }, [loadUnreadCount]);

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-white/10 bg-neutral-950/90 px-5 backdrop-blur-xl sm:px-8">
      <button
        type="button"
        onClick={onOpenSidebar}
        className="rounded-xl border border-white/10 p-2.5 lg:hidden"
        aria-label="Open sidebar"
      >
        <Menu size={20} />
      </button>

      <div className="ml-auto flex items-center gap-3">
        <Link
          href="/notifications"
          className="relative rounded-xl border border-white/10 p-2.5 text-neutral-400 transition hover:bg-white/5 hover:text-white"
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
                -right-2
                -top-2
                z-20
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
                ring-neutral-950
              "
            >
              {unreadCount > 99
                ? "99+"
                : unreadCount}
            </span>
          )}
        </Link>

        <div className="hidden sm:block">
          <p className="text-right text-sm font-medium">
            {user?.firstName}{" "}
            {user?.lastName}
          </p>

          <p className="text-right text-xs text-neutral-500">
            {user?.email}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sm font-semibold text-black">
          {initials || "SA"}
        </div>

        <button
          type="button"
          onClick={() =>
            void logout()
          }
          className="rounded-xl border border-white/10 p-2.5 text-neutral-400 transition hover:bg-white/5 hover:text-red-300"
          aria-label="Sign out"
        >
          <LogOut size={19} />
        </button>
      </div>
    </header>
  );
}