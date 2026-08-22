"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  Bell,
  CheckCheck,
  CreditCard,
  Loader2,
  MessageCircle,
  RefreshCw,
  ShieldAlert,
  WalletCards,
} from "lucide-react";

import AppShell from "@/components/layout/AppShell";

import {
  notificationService,
  type TenantNotification,
} from "@/services/notification.service";

import {
  useNotificationStore,
} from "@/store/notification.store";

import { getApiErrorMessage } from "@/lib/api";

export default function NotificationsPage() {
  const router = useRouter();

  const [
    notifications,
    setNotifications,
  ] =
    useState<
      TenantNotification[]
    >([]);

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

const decrementUnreadCount =
  useNotificationStore(
    (state) =>
      state.decrementUnreadCount,
  );

const clearUnreadCount =
  useNotificationStore(
    (state) =>
      state.clearUnreadCount,
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    markingAll,
    setMarkingAll,
  ] = useState(false);

  const [
    busyId,
    setBusyId,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const load =
    useCallback(
      async (
        silent = false,
      ) => {
        if (!silent) {
          setLoading(true);
        }

        setError("");

        try {
          const [
            items,
            count,
          ] =
            await Promise.all([
              notificationService.list(
                1,
                50,
              ),

              notificationService.unreadCount(),
            ]);

          setNotifications(
            items,
          );

          setUnreadCount(
            count,
          );
        } catch (
          requestError
        ) {
          setError(
            getApiErrorMessage(
              requestError,
              "Unable to load notifications.",
            ),
          );
        } finally {
          if (!silent) {
            setLoading(false);
          }
        }
      },
      [],
    );

  useEffect(() => {
    void load();
  }, [load]);

  /*
   * Keep tenant notifications reasonably fresh.
   */
  useEffect(() => {
    const interval =
      window.setInterval(
        () => {
          void load(true);
        },
        15000,
      );

    return () => {
      window.clearInterval(
        interval,
      );
    };
  }, [load]);

  const transactionCount =
    useMemo(
      () =>
        notifications.filter(
          (item) =>
            isTransactionNotification(
              item,
            ),
        ).length,
      [notifications],
    );

  const cardRequestCount =
    useMemo(
      () =>
        notifications.filter(
          (item) =>
            isCardRequestNotification(
              item,
            ),
        ).length,
      [notifications],
    );

const openNotification =
  async (
    notification:
      TenantNotification,
  ) => {
    if (
      busyId ===
      notification.id
    ) {
      return;
    }

    setBusyId(
      notification.id,
    );

    setError("");

    try {
      if (
        !notification.is_read
      ) {
        await notificationService.markRead(
          notification.id,
        );

        setNotifications(
          (current) =>
            current.map(
              (item) =>
                item.id ===
                notification.id
                  ? {
                      ...item,
                      is_read:
                        true,
                    }
                  : item,
            ),
        );

        decrementUnreadCount();
      }

      const target =
        getNotificationTarget(
          notification,
        );

      if (target) {
        router.push(target);
      }
    } catch (
      requestError
    ) {
      setError(
        getApiErrorMessage(
          requestError,
          "Unable to mark notification as read.",
        ),
      );
    } finally {
      setBusyId("");
    }
  };

const markAllRead =
  async () => {
    if (
      markingAll ||
      unreadCount === 0
    ) {
      return;
    }

    setMarkingAll(true);
    setError("");

    try {
      await notificationService.markAllRead();

      setNotifications(
        (current) =>
          current.map(
            (item) => ({
              ...item,
              is_read: true,
            }),
          ),
      );

      clearUnreadCount();
    } catch (
      requestError
    ) {
      setError(
        getApiErrorMessage(
          requestError,
          "Unable to mark notifications as read.",
        ),
      );
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-6xl pb-10">

        {/* HEADER */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Notifications
            </h1>

            <p className="text-sm text-gray-500">
              Track card
              requests,
              transactions and
              tenant activity.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                void load()
              }
              disabled={
                loading
              }
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 shadow-sm disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>

            <button
              type="button"
              onClick={() =>
                void markAllRead()
              }
              disabled={
                markingAll ||
                unreadCount ===
                  0
              }
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-tenant px-4 text-sm font-semibold text-white disabled:opacity-50"
            >
              {markingAll ? (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <CheckCheck
                  size={17}
                />
              )}

              Mark all as read
            </button>
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* SUMMARY */}

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Summary
            label="Unread"
            value={String(
              unreadCount,
            )}
          />

          <Summary
            label="Card Requests"
            value={String(
              cardRequestCount,
            )}
          />

          <Summary
            label="Transaction Alerts"
            value={String(
              transactionCount,
            )}
          />
        </div>

        {/* LIST */}

        {loading ? (
          <div className="grid min-h-[360px] place-items-center">
            <div className="text-center">
              <Loader2 className="mx-auto animate-spin text-tenant" />

              <p className="mt-3 text-sm text-gray-400">
                Loading
                notifications…
              </p>
            </div>
          </div>
        ) : notifications.length ===
          0 ? (
          <div className="mt-6 grid min-h-[300px] place-items-center rounded-2xl border border-dashed border-gray-200 bg-white px-6 text-center">
            <div>
              <Bell
                size={36}
                className="mx-auto text-gray-300"
              />

              <h2 className="mt-4 font-bold text-gray-700">
                No notifications
              </h2>

              <p className="mt-2 text-sm text-gray-400">
                New card
                requests and
                account activity
                will appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {notifications.map(
              (
                item,
              ) => (
                <button
                  key={
                    item.id
                  }
                  type="button"
                  onClick={() =>
                    void openNotification(
                      item,
                    )
                  }
                  disabled={
                    busyId ===
                    item.id
                  }
                  className={`block w-full rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                    item.is_read
                      ? "border-gray-200"
                      : "border-tenant"
                  }`}
                >
                  <div className="flex gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-tenant/10 text-tenant">
                      <NotificationIcon
                        notification={
                          item
                        }
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h2 className="font-bold text-gray-900">
                            {
                              item.title
                            }
                          </h2>

                          <p className="mt-1 text-sm leading-5 text-gray-600">
                            {
                              item.message
                            }
                          </p>
                        </div>

                        {!item.is_read && (
                          <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-tenant" />
                        )}
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <p className="text-xs text-gray-400">
                          {formatNotificationTime(
                            item.created_at,
                          )}
                        </p>

                        {item.priority ===
                          "high" && (
                          <span className="rounded-full bg-red-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-red-600">
                            Priority
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ),
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
function getNotificationTarget(
  notification: TenantNotification,
): string | null {
  // Card purchase requests
  if (
    notification.entity_type === "card_purchase_request" ||
    notification.notification_type.includes("card_purchase")
  ) {
    return "/dashboard/card-lock";
  }

  // Card-related activity
  if (
    notification.entity_type === "card" ||
    notification.notification_type.includes("card_")
  ) {
    return "/dashboard/card-lock";
  }

  // Transfers
  if (notification.entity_type === "transfer") {
    return "/transactions";
  }

  // Accounts
  if (notification.entity_type === "account") {
    return "/accounts";
  }

  return null;
}
function Summary({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">
        {label}
      </p>

      <h2 className="mt-2 text-2xl font-bold">
        {value}
      </h2>
    </div>
  );
}

function NotificationIcon({
  notification,
}: {
  notification:
    TenantNotification;
}) {
  const type =
    notification.notification_type ||
    "";

  if (
    type.includes(
      "card_purchase",
    )
  ) {
    return (
      <WalletCards
        size={20}
      />
    );
  }

  if (
    type.includes(
      "card",
    )
  ) {
    return (
      <CreditCard
        size={20}
      />
    );
  }

  if (
    type.includes(
      "transfer",
    ) ||
    type.includes(
      "credit",
    ) ||
    type.includes(
      "debit",
    )
  ) {
    return (
      <CreditCard
        size={20}
      />
    );
  }

  if (
    type.includes(
      "chat",
    ) ||
    type.includes(
      "message",
    )
  ) {
    return (
      <MessageCircle
        size={20}
      />
    );
  }

  if (
    type.includes(
      "security",
    )
  ) {
    return (
      <ShieldAlert
        size={20}
      />
    );
  }

  return (
    <Bell size={20} />
  );
}

function isCardRequestNotification(
  notification:
    TenantNotification,
) {
  return (
    notification.notification_type.includes(
      "card_purchase",
    ) ||
    notification.entity_type ===
      "card_purchase_request"
  );
}

function isTransactionNotification(
  notification:
    TenantNotification,
) {
  const type =
    notification.notification_type;

  return (
    type.includes(
      "transfer",
    ) ||
    type.includes(
      "credit",
    ) ||
    type.includes(
      "debit",
    ) ||
    notification.entity_type ===
      "transfer"
  );
}

function formatNotificationTime(
  value: string,
) {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      dateStyle:
        "medium",

      timeStyle:
        "short",
    },
  ).format(
    date,
  );
}