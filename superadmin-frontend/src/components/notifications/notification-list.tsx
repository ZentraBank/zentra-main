"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Bell,
  CheckCheck,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import { ApiError } from "@/src/lib/api-error";
import { platformNotificationsService } from "@/src/services/platform-notifications.service";
import type {
  PlatformNotification,
} from "@/src/types/platform-operations";

export function NotificationList() {
  const [rows, setRows] =
    useState<PlatformNotification[]>([]);
  const [unreadOnly, setUnreadOnly] =
    useState(false);
  const [unreadCount, setUnreadCount] =
    useState(0);
  const [error, setError] =
    useState<string | null>(null);
  const [isLoading, setIsLoading] =
    useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [notifications, count] =
        await Promise.all([
          platformNotificationsService.list({
            limit: 100,
            unreadOnly,
          }),
          platformNotificationsService.unreadCount(),
        ]);

      setRows(
        Array.isArray(notifications.data)
          ? notifications.data
          : []
      );

      setUnreadCount(
        Number(count.data?.unreadCount ?? 0)
      );
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "Unable to load notifications."
      );
    } finally {
      setIsLoading(false);
    }
  }, [unreadOnly]);

  useEffect(() => {
    void load();
  }, [load]);

  const markRead = async (
    notificationId: string
  ) => {
    await platformNotificationsService.markRead(
      notificationId
    );

    setRows((current) =>
      current.map((item) =>
        item.id === notificationId
          ? {
              ...item,
              is_read: true,
              read_at:
                new Date().toISOString(),
            }
          : item
      )
    );

    setUnreadCount((value) =>
      Math.max(0, value - 1)
    );
  };

  const markAllRead = async () => {
    await platformNotificationsService.markAllRead();

    setRows((current) =>
      current.map((item) => ({
        ...item,
        is_read: true,
        read_at:
          item.read_at ||
          new Date().toISOString(),
      }))
    );

    setUnreadCount(0);
  };

  return (
    <div className="space-y-6 text-neutral-900">
      {/* Header controls */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(event) =>
              setUnreadOnly(
                event.target.checked
              )
            }
            className="h-4 w-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-semibold text-neutral-800">
            Unread only{" "}
            <span className="ml-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600 font-bold">
              {unreadCount}
            </span>
          </span>
        </label>

        <button
          type="button"
          onClick={() =>
            void markAllRead()
          }
          disabled={unreadCount === 0}
          className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 shadow-sm transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <CheckCheck size={16} className="text-blue-600" />
          Mark all read
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 shadow-sm">
          {error}
        </div>
      )}

      {/* Notifications list */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <Loader2 size={18} className="animate-spin text-blue-600" />
              Loading notifications…
            </div>
          </div>
        ) : !Array.isArray(rows) || rows.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
              <Bell size={24} />
            </div>
            <p className="mt-3 text-sm font-semibold text-neutral-700">
              No notifications found.
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              You are all caught up with your notifications.
            </p>
          </div>
        ) : (
          rows.map((notification) => (
            <article
              key={notification.id}
              className={`relative overflow-hidden rounded-2xl border p-6 shadow-sm transition ${
                notification.is_read
                  ? "border-neutral-200 bg-white"
                  : "border-blue-200 bg-blue-50/40"
              }`}
            >
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-bold text-neutral-900">
                      {notification.title}
                    </h2>

                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                        notification.severity === "high" || notification.severity === "critical"
                          ? "bg-red-100 text-red-700 border border-red-200"
                          : notification.severity === "medium"
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : "bg-neutral-100 text-neutral-700 border border-neutral-200"
                      }`}
                    >
                      {notification.severity}
                    </span>

                    {!notification.is_read && (
                      <span className="flex h-2 w-2 rounded-full bg-blue-600" />
                    )}
                  </div>

                  <p className="text-sm leading-relaxed text-neutral-600">
                    {notification.message}
                  </p>

                  <p className="text-xs font-medium text-neutral-400">
                    {new Date(
                      notification.created_at
                    ).toLocaleString("en-GB")}
                  </p>
                </div>

                {!notification.is_read && (
                  <button
                    type="button"
                    onClick={() =>
                      void markRead(
                        notification.id
                      )
                    }
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 shadow-xs transition hover:bg-neutral-50 hover:text-blue-600"
                  >
                    <CheckCircle2 size={14} className="text-blue-600" />
                    Mark read
                  </button>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}