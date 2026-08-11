"use client";

import AppShell from "@/components/layout/AppShell";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ChevronDown,
  LoaderCircle,
  RefreshCcw,
  Search,
  Wallet,
  X,
} from "lucide-react";
import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

type AccountStatus = "Active" | "Dormant" | "Suspended" | "Closed";

type AccountType =
  | "Wallet"
  | "Savings"
  | "Current"
  | "Business"
  | "Investment";

type Account = {
  id: string;
  userId?: string;
  name: string;
  accountNumber: string;
  balance: number;
  currency: string;
  type: AccountType;
  status: AccountStatus;
  createdAt?: string;
};

type AccountsApiResponse =
  | Account[]
  | {
      data?: Account[];
      accounts?: Account[];
      total?: number;
      totalAccounts?: number;
      totalBalance?: number;
      dormantAccounts?: number;
    };

type AccountFilter = "All" | AccountStatus;

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const mockAccounts: Account[] = [
  {
    id: "account-001",
    userId: "user-001",
    name: "Gregory Winter",
    accountNumber: "3022222222",
    balance: 250000,
    currency: "NGN",
    type: "Wallet",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "account-002",
    userId: "user-002",
    name: "Amaka James",
    accountNumber: "3022222223",
    balance: 80500,
    currency: "NGN",
    type: "Savings",
    status: "Dormant",
    createdAt: new Date().toISOString(),
  },
];

const accountFilters: AccountFilter[] = [
  "All",
  "Active",
  "Dormant",
  "Suspended",
  "Closed",
];

const getAuthToken = () => {
  if (typeof window === "undefined") {
    return null;
  }

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

const extractAccounts = (response: AccountsApiResponse): Account[] => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response.accounts)) {
    return response.accounts;
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  return [];
};

const formatCurrency = (amount: number, currency = "NGN") => {
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
};

const formatCompactCurrency = (amount: number, currency = "NGN") => {
  const currencySymbols: Record<string, string> = {
    NGN: "₦",
    USD: "$",
    GBP: "£",
    EUR: "€",
  };

  const symbol = currencySymbols[currency] ?? `${currency} `;

  return `${symbol}${new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount)}`;
};

const getStatusClasses = (status: AccountStatus) => {
  switch (status) {
    case "Active":
      return "bg-green-50 text-green-600";

    case "Dormant":
      return "bg-yellow-50 text-yellow-600";

    case "Suspended":
      return "bg-red-50 text-red-600";

    case "Closed":
      return "bg-gray-100 text-gray-600";

    default:
      return "bg-gray-100 text-gray-600";
  }
};

export default function AdminAccountsPage() {
  const router = useRouter();

  const [accounts, setAccounts] = useState<Account[]>(mockAccounts);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] =
    useState<AccountFilter>("All");

  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(Boolean(API_URL));
  const [refreshing, setRefreshing] = useState(false);
  const [openingAccountId, setOpeningAccountId] = useState<string | null>(
    null,
  );
  const [error, setError] = useState("");

  const fetchAccounts = useCallback(async (showRefreshLoader = false) => {
    if (!API_URL) {
      setAccounts(mockAccounts);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      setError("");

      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await fetch(`${API_URL}/accounts`, {
        method: "GET",
        headers: buildHeaders(),
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(
          `Unable to load accounts. Error ${response.status}.`,
        );
      }

      const result = (await response.json()) as AccountsApiResponse;
      setAccounts(extractAccounts(result));
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load accounts.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchAccounts();
  }, [fetchAccounts]);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredAccounts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return accounts.filter((account) => {
      const matchesSearch =
        !normalizedSearch ||
        account.name.toLowerCase().includes(normalizedSearch) ||
        account.accountNumber.toLowerCase().includes(normalizedSearch) ||
        account.type.toLowerCase().includes(normalizedSearch) ||
        account.status.toLowerCase().includes(normalizedSearch);

      const matchesFilter =
        selectedFilter === "All" || account.status === selectedFilter;

      return matchesSearch && matchesFilter;
    });
  }, [accounts, searchTerm, selectedFilter]);

  const accountSummary = useMemo(() => {
    const totalBalance = accounts.reduce(
      (total, account) => total + Number(account.balance || 0),
      0,
    );

    return {
      totalAccounts: accounts.length,
      totalBalance,
      dormantAccounts: accounts.filter(
        (account) => account.status === "Dormant",
      ).length,
    };
  }, [accounts]);

  const mainCurrency = accounts[0]?.currency ?? "NGN";

  const handleViewAccount = (account: Account) => {
    setOpeningAccountId(account.id);

    router.push(`/dashboard/accounts/${account.id}`);
  };

  return (
    <AppShell>
      <main className="relative min-h-[calc(100svh-32px)] overflow-hidden rounded-[28px] bg-black">
        <Image
          src="/images/Background_1.png"
          alt="Accounts background"
          fill
          priority
          className="object-cover"
        />

        <div className="relative z-10 p-4 text-white md:p-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black md:text-4xl">
                Accounts
              </h1>

              <p className="mt-1 text-sm font-medium text-white/70">
                View all customer accounts under this tenant.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void fetchAccounts(true)}
              disabled={refreshing}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50 md:h-11 md:w-11"
              aria-label="Refresh accounts"
            >
              <RefreshCcw
                size={18}
                className={refreshing ? "animate-spin" : ""}
              />
            </button>
          </div>

          {error && (
            <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-red-300/30 bg-red-500/20 px-4 py-3 text-sm text-white backdrop-blur-md">
              <div className="flex min-w-0 items-center gap-2">
                <AlertCircle size={18} className="shrink-0" />

                <p className="truncate">{error}</p>
              </div>

              <button
                type="button"
                onClick={() => setError("")}
                className="shrink-0"
                aria-label="Dismiss error"
              >
                <X size={17} />
              </button>
            </div>
          )}

          <div className="mb-5 grid gap-4 md:grid-cols-3">
            <SummaryCard
              label="Total Accounts"
              value={accountSummary.totalAccounts.toLocaleString()}
            />

            <SummaryCard
              label="Total Balance"
              value={formatCompactCurrency(
                accountSummary.totalBalance,
                mainCurrency,
              )}
            />

            <SummaryCard
              label="Dormant Accounts"
              value={accountSummary.dormantAccounts.toLocaleString()}
            />
          </div>

          <div className="mb-5 flex flex-col gap-3 sm:flex-row">
            <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-black shadow-xl backdrop-blur-md">
              <Search size={18} className="shrink-0 text-gray-500" />

              <input
                type="search"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search accounts"
                className="w-full bg-transparent text-sm font-medium text-black outline-none placeholder:text-gray-500"
              />

              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="text-gray-500 transition hover:text-black"
                  aria-label="Clear search"
                >
                  <X size={17} />
                </button>
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowFilters((current) => !current)}
                className="flex h-full min-h-[48px] w-full items-center justify-between gap-3 rounded-2xl border border-white/20 bg-white/90 px-4 text-sm font-bold !text-black shadow-xl backdrop-blur-md sm:w-[170px]"
              >
                <span>{selectedFilter}</span>

                <ChevronDown
                  size={17}
                  className={`transition ${
                    showFilters ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showFilters && (
                <div className="absolute right-0 top-[calc(100%+8px)] z-30 w-full overflow-hidden rounded-2xl border border-gray-200 bg-white py-2 text-black shadow-2xl sm:w-[190px]">
                  {accountFilters.map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => {
                        setSelectedFilter(filter);
                        setShowFilters(false);
                      }}
                      className={`block w-full px-4 py-2.5 text-left text-sm font-semibold transition hover:bg-gray-100 ${
                        selectedFilter === filter
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/20 bg-white/90 text-black shadow-2xl backdrop-blur-md">
            {loading ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center p-6">
                <LoaderCircle
                  size={32}
                  className="animate-spin text-blue-700"
                />

                <p className="mt-3 text-sm font-medium text-gray-500">
                  Loading accounts...
                </p>
              </div>
            ) : filteredAccounts.length === 0 ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-700/10 text-blue-700">
                  <Wallet size={25} />
                </div>

                <h2 className="mt-4 text-lg font-black">
                  No accounts found
                </h2>

                <p className="mt-1 max-w-[320px] text-sm font-medium text-gray-500">
                  Try changing your search term or selecting another account
                  status.
                </p>

                {(searchTerm || selectedFilter !== "All") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedFilter("All");
                    }}
                    className="mt-4 rounded-xl bg-blue-700 px-4 py-2 text-sm font-bold text-white"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              filteredAccounts.map((account) => {
                const isOpening = openingAccountId === account.id;

                return (
                  <div
                    key={account.id}
                    className="flex flex-col gap-4 border-b border-black/10 p-4 last:border-b-0 lg:flex-row lg:items-center lg:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-700/10 text-blue-700">
                        <Wallet size={20} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-bold">
                          {account.name}
                        </p>

                        <p className="truncate text-sm font-medium text-gray-500">
                          {account.accountNumber} • {account.type}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <p className="font-bold">
                        {formatCurrency(
                          Number(account.balance),
                          account.currency,
                        )}
                      </p>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusClasses(
                          account.status,
                        )}`}
                      >
                        {account.status}
                      </span>

                      <button
                        type="button"
                        disabled={isOpening}
                        onClick={() => handleViewAccount(account)}
                        className="flex min-w-[70px] items-center justify-center rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-bold !text-black shadow-sm transition hover:border-blue-200 hover:bg-blue-50 disabled:cursor-wait disabled:opacity-60"
                      >
                        {isOpening ? (
                          <LoaderCircle
                            size={17}
                            className="animate-spin"
                          />
                        ) : (
                          "View"
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {!loading && filteredAccounts.length > 0 && (
            <p className="mt-3 text-right text-xs font-medium text-white/70">
              Showing {filteredAccounts.length} of {accounts.length} accounts
            </p>
          )}
        </div>
      </main>
    </AppShell>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/90 p-5 text-black shadow-xl backdrop-blur-md">
      <p className="text-sm font-medium text-gray-500">{label}</p>

      <h2 className="mt-2 text-2xl font-black">{value}</h2>
    </div>
  );
}