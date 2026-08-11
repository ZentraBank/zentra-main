"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Gift,
  Landmark,
  FileWarning,
  CornerDownRight,
  Search,
  Filter,
  LoaderCircle,
  RefreshCcw,
  CheckCheck,
  X,
} from "lucide-react";
import {
  ChangeEvent,
  ComponentType,
  SVGProps,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

type NotificationCategory =
  | "donation"
  | "otp"
  | "gifted-funds"
  | "virtual-card"
  | "complaint"
  | "next-of-kin";

type NotificationPriority = "low" | "normal" | "high";

type NotificationItem = {
  id: string;
  category: NotificationCategory;
  tag: string;
  text: string;
  title: string;
  priority: NotificationPriority;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  userId?: string;
};

type NotificationApiResponse =
  | NotificationItem[]
  | {
      data: NotificationItem[];
      notifications?: NotificationItem[];
    };

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

type NotificationStyle = {
  icon: IconType;
  color: string;
  bg: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/*
|--------------------------------------------------------------------------
| Temporary frontend data
|--------------------------------------------------------------------------
| This data is used only when NEXT_PUBLIC_API_URL has not been configured.
| Once your backend URL is added, notifications will be loaded from the API.
*/

const mockNotifications: NotificationItem[] = [
  {
    id: "notification-001",
    category: "donation",
    tag: "Donation",
    text: "Creg Mack has just made a new donation request of $40,000,000",
    title: "New Donation Request!",
    priority: "high",
    isRead: false,
    createdAt: new Date().toISOString(),
    actionUrl: "/dashboard/donations",
    userId: "user-001",
  },
  {
    id: "notification-002",
    category: "otp",
    tag: "OTP",
    text: "Creg Mack is requesting a donated funds redemption OTP to access funds",
    title: "Redemption Request!",
    priority: "high",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    actionUrl: "/dashboard/admin-codes",
    userId: "user-001",
  },
  {
    id: "notification-003",
    category: "gifted-funds",
    tag: "Gifted Funds",
    text: "Creg Mack is requesting a gifted funds redemption OTP to access funds",
    title: "Redemption Request!",
    priority: "normal",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    actionUrl: "/dashboard/gifts",
    userId: "user-001",
  },
  {
    id: "notification-004",
    category: "virtual-card",
    tag: "Virtual Card",
    text: "Creg Mack is chatting with you for help with a virtual card purchase",
    title: "Virtual Card!",
    priority: "normal",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    actionUrl: "/dashboard/chat",
    userId: "user-001",
  },
  {
    id: "notification-005",
    category: "complaint",
    tag: "Complaint",
    text: "Creg Mack is chatting with you for help with their account. Please pay urgent attention",
    title: "Complaint",
    priority: "high",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    actionUrl: "/dashboard/chat",
    userId: "user-001",
  },
  {
    id: "notification-006",
    category: "next-of-kin",
    tag: "Next of kin",
    text: "Creg Mack is chatting with you for help with redeeming next-of-kin funds",
    title: "Next-of-kin",
    priority: "normal",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    actionUrl: "/dashboard/chat",
    userId: "user-001",
  },
];

const notificationStyles: Record<
  NotificationCategory,
  NotificationStyle
> = {
  donation: {
    icon: Gift,
    color: "text-blue-400",
    bg: "bg-blue-500/15",
  },
  otp: {
    icon: Gift,
    color: "text-indigo-400",
    bg: "bg-indigo-500/15",
  },
  "gifted-funds": {
    icon: Gift,
    color: "text-purple-400",
    bg: "bg-purple-500/15",
  },
  "virtual-card": {
    icon: Landmark,
    color: "text-emerald-400",
    bg: "bg-emerald-500/15",
  },
  complaint: {
    icon: FileWarning,
    color: "text-orange-400",
    bg: "bg-orange-500/15",
  },
  "next-of-kin": {
    icon: CornerDownRight,
    color: "text-red-400",
    bg: "bg-red-500/15",
  },
};

const getAuthToken = () => {
  if (typeof window === "undefined") return null;

  return (
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("accessToken")
  );
};

const buildHeaders = (): HeadersInit => {
  const token = getAuthToken();

  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const getNotificationList = (
  response: NotificationApiResponse,
): NotificationItem[] => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response.notifications)) {
    return response.notifications;
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  return [];
};

const formatNotificationTime = (dateString: string) => {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const difference = Date.now() - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (difference < minute) return "Just now";

  if (difference < hour) {
    return `${Math.floor(difference / minute)}m ago`;
  }

  if (difference < day) {
    return `${Math.floor(difference / hour)}h ago`;
  }

  if (difference < day * 7) {
    return `${Math.floor(difference / day)}d ago`;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

export default function NotificationPage() {
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(mockNotifications);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "unread" | "high"
  >("all");

  const [showSearch, setShowSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(Boolean(API_URL));
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState("");

  const fetchNotifications = useCallback(async (showRefreshLoader = false) => {
    if (!API_URL) {
      setNotifications(mockNotifications);
      setLoading(false);
      return;
    }

    try {
      setError("");

      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await fetch(`${API_URL}/notifications`, {
        method: "GET",
        headers: buildHeaders(),
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(
          `Unable to load notifications. Error ${response.status}.`,
        );
      }

      const result = (await response.json()) as NotificationApiResponse;
      setNotifications(getNotificationList(result));
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load notifications.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

  const markNotificationAsRead = async (notificationId: string) => {
    const selectedNotification = notifications.find(
      (notification) => notification.id === notificationId,
    );

    if (!selectedNotification || selectedNotification.isRead) {
      return;
    }

    const previousNotifications = notifications;

    setProcessingId(notificationId);
    setError("");

    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification,
      ),
    );

    if (!API_URL) {
      setProcessingId(null);
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/notifications/${notificationId}/read`,
        {
          method: "PATCH",
          headers: buildHeaders(),
          body: JSON.stringify({
            isRead: true,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Unable to mark the notification as read.");
      }
    } catch (requestError) {
      setNotifications(previousNotifications);

      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to update the notification.",
      );
    } finally {
      setProcessingId(null);
    }
  };

  const markAllAsRead = async () => {
    if (!notifications.some((notification) => !notification.isRead)) {
      return;
    }

    const previousNotifications = notifications;

    setMarkingAll(true);
    setError("");

    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) => ({
        ...notification,
        isRead: true,
      })),
    );

    if (!API_URL) {
      setMarkingAll(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/notifications/read-all`, {
        method: "PATCH",
        headers: buildHeaders(),
        body: JSON.stringify({
          isRead: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to mark all notifications as read.");
      }
    } catch (requestError) {
      setNotifications(previousNotifications);

      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to update the notifications.",
      );
    } finally {
      setMarkingAll(false);
    }
  };

  const handleNotificationClick = async (notification: NotificationItem) => {
    await markNotificationAsRead(notification.id);

    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredNotifications = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return notifications.filter((notification) => {
      const matchesSearch =
        !normalizedSearch ||
        notification.title.toLowerCase().includes(normalizedSearch) ||
        notification.text.toLowerCase().includes(normalizedSearch) ||
        notification.tag.toLowerCase().includes(normalizedSearch);

      const matchesFilter =
        selectedFilter === "all" ||
        (selectedFilter === "unread" && !notification.isRead) ||
        (selectedFilter === "high" &&
          notification.priority === "high");

      return matchesSearch && matchesFilter;
    });
  }, [notifications, searchTerm, selectedFilter]);

  const unreadCount = useMemo(
    () =>
      notifications.filter((notification) => !notification.isRead).length,
    [notifications],
  );

  const highPriorityCount = useMemo(
    () =>
      notifications.filter(
        (notification) => notification.priority === "high",
      ).length,
    [notifications],
  );

  return (
    <main className="min-h-screen bg-black text-white md:bg-[radial-gradient(circle_at_top,#1f2937_0%,#050505_48%,#000_100%)]">
      <div className="mx-auto min-h-screen max-w-[430px] border-x border-white/10 px-2 pb-10 pt-10 md:max-w-none md:border-0 md:px-8 md:py-8 lg:px-12">
        <header className="mb-4 flex items-center justify-between md:mb-8">
          <Link
            href="/dashboard"
            aria-label="Return to dashboard"
            className="text-white md:flex md:h-11 md:w-11 md:items-center md:justify-center md:rounded-full md:bg-white/10 md:backdrop-blur md:ring-1 md:ring-white/10"
          >
            <ArrowLeft size={18} />
          </Link>

          <div className="text-center md:text-left">
            <h1 className="text-[13px] font-bold md:text-3xl">
              Notification
            </h1>

            <p className="hidden text-sm text-gray-400 md:block">
              Manage client alerts, requests, and automated notifications.
            </p>
          </div>

          <button
            type="button"
            aria-label="Refresh notifications"
            disabled={refreshing}
            onClick={() => void fetchNotifications(true)}
            className="flex h-[24px] w-[24px] items-center justify-center rounded-full text-white disabled:opacity-50 md:h-11 md:w-11 md:bg-white/10 md:ring-1 md:ring-white/10"
          >
            <RefreshCcw
              size={17}
              className={refreshing ? "animate-spin" : ""}
            />
          </button>
        </header>

        {error && (
          <div className="mx-auto mb-4 flex max-w-[1180px] items-center justify-between rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-200 md:text-sm">
            <span>{error}</span>

            <button
              type="button"
              aria-label="Dismiss error"
              onClick={() => setError("")}
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="mx-auto grid max-w-[1180px] gap-6 lg:grid-cols-[360px_1fr]">
          <aside className="space-y-4">
            <section className="rounded-md bg-[#a7a7a7] p-2 md:rounded-[28px] md:bg-[#151515] md:p-6 md:ring-1 md:ring-white/10">
              <h2 className="mb-2 text-[12px] font-bold text-black md:mb-4 md:text-lg md:text-white">
                Push notifications to clients
              </h2>

              <Link
                href="/dashboard/notifications/push"
                className="flex w-full items-center gap-3 rounded-md bg-[#cce7ff] px-3 py-3 text-left shadow-[0_0_8px_rgba(255,255,255,0.45)] transition hover:scale-[1.01] md:rounded-2xl md:bg-gradient-to-br md:from-blue-600 md:to-indigo-700 md:px-5 md:py-5 md:text-white md:shadow-lg md:shadow-blue-900/20"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/90 text-green-600 md:text-blue-600">
                  <Bell size={22} />
                </span>

                <div className="flex-1">
                  <h3 className="text-[16px] font-black text-[#2447d8] md:text-xl md:text-white">
                    Push a Notification
                  </h3>

                  <p className="text-[11px] leading-tight text-gray-600 md:mt-1 md:text-sm md:text-blue-100">
                    Remind or compel your clients to take action on any
                    service.
                  </p>
                </div>

                <ArrowRight
                  className="text-gray-500 md:text-white"
                  size={20}
                />
              </Link>
            </section>

            <section className="hidden rounded-[28px] bg-[#151515] p-6 ring-1 ring-white/10 md:block">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-400">
                  Notification summary
                </p>

                <button
                  type="button"
                  disabled={markingAll || unreadCount === 0}
                  onClick={() => void markAllAsRead()}
                  className="flex items-center gap-1 text-xs font-semibold text-blue-400 transition hover:text-blue-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {markingAll ? (
                    <LoaderCircle size={14} className="animate-spin" />
                  ) : (
                    <CheckCheck size={14} />
                  )}
                  Mark all read
                </button>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedFilter("unread")}
                  className={`rounded-2xl p-4 text-left transition ${
                    selectedFilter === "unread"
                      ? "bg-blue-600"
                      : "bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <p className="text-3xl font-black text-white">
                    {unreadCount}
                  </p>

                  <p
                    className={`text-xs ${
                      selectedFilter === "unread"
                        ? "text-blue-100"
                        : "text-gray-400"
                    }`}
                  >
                    Unread alerts
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedFilter("high")}
                  className={`rounded-2xl p-4 text-left transition ${
                    selectedFilter === "high"
                      ? "bg-blue-600"
                      : "bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <p className="text-3xl font-black text-white">
                    {highPriorityCount}
                  </p>

                  <p
                    className={`text-xs ${
                      selectedFilter === "high"
                        ? "text-blue-100"
                        : "text-gray-400"
                    }`}
                  >
                    High priority
                  </p>
                </button>
              </div>

              {selectedFilter !== "all" && (
                <button
                  type="button"
                  onClick={() => setSelectedFilter("all")}
                  className="mt-4 text-xs font-semibold text-gray-400 hover:text-white"
                >
                  Show all notifications
                </button>
              )}
            </section>
          </aside>

          <section className="rounded-md bg-[#a7a7a7] p-2 md:rounded-[28px] md:bg-[#151515] md:p-6 md:ring-1 md:ring-white/10">
            <div className="mb-2 flex items-center justify-between gap-2 md:mb-6">
              <div>
                <h2 className="text-[12px] font-bold text-black md:text-xl md:text-white">
                  Default Notifications
                </h2>

                <p className="hidden text-xs text-gray-500 md:mt-1 md:block">
                  {filteredNotifications.length} notification
                  {filteredNotifications.length === 1 ? "" : "s"} displayed
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Search notifications"
                  onClick={() => setShowSearch((current) => !current)}
                  className="flex h-8 items-center gap-2 rounded-full bg-black/10 px-3 text-[11px] text-black md:h-10 md:bg-white/10 md:px-4 md:text-sm md:text-gray-300"
                >
                  <Search size={15} />
                  <span className="hidden md:inline">Search</span>
                </button>

                <button
                  type="button"
                  aria-label="Filter notifications"
                  onClick={() => setShowFilters((current) => !current)}
                  className="flex h-8 items-center gap-2 rounded-full bg-blue-600 px-3 text-[11px] text-white md:h-10 md:px-4 md:text-sm"
                >
                  <Filter size={15} />
                  <span className="hidden md:inline">Filter</span>
                </button>
              </div>
            </div>

            {showSearch && (
              <div className="relative mb-3 md:mb-5">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="search"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Search notifications..."
                  className="h-11 w-full rounded-xl border border-black/10 bg-white pl-10 pr-10 text-sm text-black outline-none placeholder:text-gray-400 focus:border-blue-500 md:border-white/10 md:bg-white/5 md:text-white"
                />

                {searchTerm && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            )}

            {showFilters && (
              <div className="mb-3 flex gap-2 overflow-x-auto pb-1 md:mb-5">
                {(
                  [
                    { value: "all", label: "All" },
                    { value: "unread", label: "Unread" },
                    { value: "high", label: "High priority" },
                  ] as const
                ).map((filter) => (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setSelectedFilter(filter.value)}
                    className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${
                      selectedFilter === filter.value
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-600 md:bg-white/10 md:text-gray-300"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            )}

            {loading ? (
              <div className="flex min-h-[280px] flex-col items-center justify-center">
                <LoaderCircle
                  size={30}
                  className="animate-spin text-blue-500"
                />

                <p className="mt-3 text-xs text-gray-600 md:text-sm md:text-gray-400">
                  Loading notifications...
                </p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl bg-white/40 px-6 text-center md:bg-white/5">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/15 text-blue-500">
                  <Bell size={26} />
                </span>

                <h3 className="mt-4 font-bold text-black md:text-white">
                  No notifications found
                </h3>

                <p className="mt-1 max-w-[300px] text-xs text-gray-600 md:text-sm md:text-gray-400">
                  Try changing your search term or notification filter.
                </p>
              </div>
            ) : (
              <div className="grid gap-2 md:gap-4 xl:grid-cols-2">
                {filteredNotifications.map((item) => {
                  const style =
                    notificationStyles[item.category] ??
                    notificationStyles.donation;

                  const Icon = style.icon;
                  const isProcessing = processingId === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      disabled={isProcessing}
                      onClick={() => void handleNotificationClick(item)}
                      className={`group relative flex min-h-[64px] items-center gap-3 rounded-md px-3 py-2 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl disabled:cursor-wait md:min-h-[132px] md:rounded-3xl md:border md:px-5 md:py-5 ${
                        item.isRead
                          ? "bg-white md:border-white/10 md:bg-[#202020]"
                          : "bg-[#f0f7ff] ring-1 ring-blue-300 md:border-blue-500/30 md:bg-[#20283a] md:ring-0"
                      }`}
                    >
                      {!item.isRead && (
                        <span
                          title="Unread notification"
                          className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-500 md:right-4 md:top-4"
                        />
                      )}

                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl md:h-12 md:w-12 ${style.bg}`}
                      >
                        <Icon className={style.color} width={22} height={22} />
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="hidden md:mb-2 md:flex md:items-center md:justify-between">
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-gray-300">
                              {item.tag}
                            </span>

                            {item.priority === "high" && (
                              <span className="rounded-full bg-red-500/15 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-red-400">
                                Urgent
                              </span>
                            )}
                          </div>

                          {isProcessing ? (
                            <LoaderCircle
                              size={17}
                              className="animate-spin text-blue-400"
                            />
                          ) : (
                            <ArrowRight
                              size={17}
                              className="text-gray-500 transition group-hover:translate-x-1 group-hover:text-blue-400"
                            />
                          )}
                        </div>

                        <p className="line-clamp-2 text-[11px] leading-tight text-gray-500 md:text-sm md:leading-relaxed md:text-gray-400">
                          {item.text}
                        </p>

                        <div className="flex items-end justify-between gap-2">
                          <h3 className="text-[16px] font-black leading-tight text-[#2447d8] md:mt-2 md:text-xl md:text-blue-400">
                            {item.title}
                          </h3>

                          <span className="shrink-0 text-[9px] font-medium text-gray-400 md:text-[11px]">
                            {formatNotificationTime(item.createdAt)}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}