"use client";

import Link from "next/link";
import {
  Bell,
  Menu,
} from "lucide-react";
import {
  useCallback,
  useEffect,
} from "react";

import { useTenantStore } from "@/store/tenant.store";
import { useUIStore } from "@/store/ui.store";
import { useNotificationStore } from "@/store/notification.store";

import {
  notificationService,
} from "@/services/notification.service";

import {
  connectSocket,
} from "@/lib/socket";


export default function Topbar() {
  const tenant =
    useTenantStore(
      (state) => state.tenant,
    );

  const openSidebar =
    useUIStore(
      (state) => state.openSidebar,
    );

  const unreadCount =
    useNotificationStore(
      (state) =>
        state.unreadCount,
    );

  const setUnreadCount =
    useNotificationStore(
      (state) =>
        state.setUnreadCount,
    );

  const loadUnreadCount =
    useCallback(async () => {
      try {
        const count =
          await notificationService.unreadCount();

        setUnreadCount(count);
      } catch {
        // Do not break the topbar
        // if notification count fails.
      }
    }, [setUnreadCount]);

  useEffect(() => {
    void loadUnreadCount();

    const interval =
      window.setInterval(
        () => {
          void loadUnreadCount();
        },
        15000,
      );

    return () => {
      window.clearInterval(
        interval,
      );
    };
  }, [loadUnreadCount]);

  useEffect(() => {
  let activeSocket:
    ReturnType<
      typeof connectSocket
    > | null = null;

  const handleNewNotification =
    () => {
      void loadUnreadCount();
    };

  try {
    activeSocket =
      connectSocket();

    activeSocket.on(
      "notification:new",
      handleNewNotification,
    );
  } catch {
    /*
     * Realtime is an enhancement.
     * The 15-second polling remains
     * available as fallback.
     */
  }

  return () => {
    if (activeSocket) {
      activeSocket.off(
        "notification:new",
        handleNewNotification,
      );
    }
  };
}, [loadUnreadCount]);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-black px-5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={
            openSidebar
          }
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-700 md:hidden"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        <div>
          <h2 className="text-sm font-bold text-white">
            {tenant?.app_name ||
              "ZentraBank"}
          </h2>

          <p className="text-xs text-gray-500">
            Welcome back
          </p>
        </div>
      </div>

      <Link
        href="/notifications"
        className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition hover:bg-gray-200"
        aria-label={
          unreadCount > 0
            ? `${unreadCount} unread notifications`
            : "Notifications"
        }
      >
        <Bell size={18} />

        {unreadCount > 0 && (
          <span className="absolute -right-2 -top-2 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-black leading-none text-white shadow">
            {unreadCount > 99
              ? "99+"
              : unreadCount}
          </span>
        )}
      </Link>
    </header>
  );
}