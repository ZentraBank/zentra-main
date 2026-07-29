"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

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

      setRows(notifications.data);
      setUnreadCount(count.data.unreadCount);
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
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(event) =>
              setUnreadOnly(
                event.target.checked
              )
            }
          />
          <span className="text-sm">
            Unread only ({unreadCount})
          </span>
        </label>

        <button
          type="button"
          onClick={() =>
            void markAllRead()
          }
          disabled={unreadCount === 0}
          className="rounded-lg border border-white/10 px-4 py-2 text-sm disabled:opacity-40"
        >
          Mark all read
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="space-y-3">
        {isLoading ? (
          <p className="text-sm text-neutral-500">
            Loading notifications…
          </p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-neutral-500">
            No notifications found.
          </p>
        ) : (
          rows.map((notification) => (
            <article
              key={notification.id}
              className={`rounded-2xl border p-5 ${
                notification.is_read
                  ? "border-white/10 bg-white/5"
                  : "border-white/20 bg-white/10"
              }`}
            >
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold">
                      {notification.title}
                    </h2>

                    <span className="rounded-full border border-white/10 px-2 py-0.5 text-xs capitalize">
                      {notification.severity}
                    </span>
                  </div>

                  <p className="mt-2 text-sm leading-6 text-neutral-300">
                    {notification.message}
                  </p>

                  <p className="mt-3 text-xs text-neutral-500">
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
                    className="text-sm font-medium hover:underline"
                  >
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
