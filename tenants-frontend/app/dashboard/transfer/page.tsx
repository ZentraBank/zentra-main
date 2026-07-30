/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowLeftRight,
  SquarePen,
  MoveDownLeft,
  MoveUpRight,
  RefreshCw,
} from "lucide-react";

import { api, getApiErrorMessage } from "@/lib/api";

type TransferDirection = "in" | "out";

type BackendTransfer = {
  id: string;
  tenant_id?: string;

  user_id?: string;
  created_by?: string;

  source_account_id: string;
  destination_account_id: string;

  source_account_number?: string | null;
  destination_account_number?: string | null;

  source_account_name?: string | null;
  destination_account_name?: string | null;

  amount: string | number;
  currency: string;

  description?: string | null;
  reference?: string | null;
  status?: string | null;

  created_at: string;
  completed_at?: string | null;
};

type TransferListResponse = {
  success: boolean;
  message?: string;
  data:
    | BackendTransfer[]
    | {
        transfers?: BackendTransfer[];
        items?: BackendTransfer[];
        results?: BackendTransfer[];
        pagination?: {
          page?: number;
          pageSize?: number;
          total?: number;
          totalPages?: number;
        };
      };
};

type DisplayTransfer = {
  id: string;
  type: TransferDirection;
  title: string;
  bank: string;
  amount: string;
  status: string;
  reference: string;
  createdAt: string;
};

const formatMoney = (
  amount: string | number,
  currency: string,
  direction: TransferDirection
) => {
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount)) {
    return String(amount);
  }

  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(numericAmount));

  return direction === "out" ? `-${formatted}` : `+${formatted}`;
};

const getTransferDirection = (
  transfer: BackendTransfer
): TransferDirection => {
  /*
   * For the tenant-admin list, the backend may not explicitly return whether
   * the transfer is incoming or outgoing.
   *
   * Internal transfers normally represent money leaving the source account,
   * so we default to "out". If your backend later returns a direction field,
   * this function can use it directly.
   */
  return "out";
};

const normaliseTransfer = (
  transfer: BackendTransfer
): DisplayTransfer => {
  const type = getTransferDirection(transfer);

  const destination =
    transfer.destination_account_name ||
    transfer.destination_account_number ||
    "Unknown destination";

  const source =
    transfer.source_account_name ||
    transfer.source_account_number ||
    "Unknown source";

  return {
    id: String(transfer.id),
    type,
    title:
      type === "out"
        ? `Transfer to ${destination}`
        : `Transfer from ${source}`,
    bank: transfer.description || "ZentraBank",
    amount: formatMoney(
      transfer.amount,
      transfer.currency || "USD",
      type
    ),
    status: transfer.status || "unknown",
    reference: transfer.reference || "No reference",
    createdAt: transfer.created_at,
  };
};

const extractTransfers = (
  data: TransferListResponse["data"]
): BackendTransfer[] => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data.transfers)) {
    return data.transfers;
  }

  if (Array.isArray(data.items)) {
    return data.items;
  }

  if (Array.isArray(data.results)) {
    return data.results;
  }

  return [];
};

export default function TransferPage() {
  const router = useRouter();

  const [transfers, setTransfers] = useState<DisplayTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const recordCount = useMemo(
    () => transfers.length,
    [transfers]
  );

  const fetchTransfers = useCallback(
    async (showRefreshIndicator = false) => {
      setError("");

      if (showRefreshIndicator) {
        setRefreshing(true);
      }

      try {
        const response = await api.get<TransferListResponse>(
          "/transfers/tenant",
          {
            params: {
              page: 1,
              pageSize: 50,
            },
          }
        );

        const backendTransfers = extractTransfers(
          response.data.data
        );

        const normalisedTransfers = backendTransfers.map(
          normaliseTransfer
        );

        setTransfers(normalisedTransfers);
      } catch (error) {
        setTransfers([]);
        setError(getApiErrorMessage(error));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  const goToEdit = (transferId: string) => {
    router.push(
      `/dashboard/transfer/edit?id=${encodeURIComponent(
        transferId
      )}`
    );
  };

  const goToTransaction = (transferId: string) => {
    router.push(
      `/dashboard/transfer/transaction?id=${encodeURIComponent(
        transferId
      )}`
    );
  };

  return (
    <main className="min-h-[100svh] bg-black text-white">
      <section className="mx-auto min-h-[100svh] w-full max-w-[430px] px-[14px] pb-10 pt-4 md:max-w-none md:px-10 md:py-8 lg:px-16">
        <div className="mx-auto w-full max-w-[1180px]">
          <div className="relative flex items-center justify-center md:justify-between">
            <Link
              href="/dashboard"
              className="absolute left-0 inline-flex text-white md:static md:h-11 md:w-11 md:items-center md:justify-center md:rounded-full md:bg-white/10 md:backdrop-blur"
              aria-label="Go back"
            >
              <ArrowLeft size={18} />
            </Link>

            <div className="md:flex-1 md:text-center">
              <h1 className="text-[13px] font-bold md:text-[28px] md:font-black">
                Transfer
              </h1>

              <p className="mt-1 hidden text-sm text-white/55 md:block">
                Manage tenant transfer records
              </p>
            </div>

            <button
              type="button"
              onClick={() => fetchTransfers(true)}
              disabled={refreshing}
              className="hidden h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50 md:flex"
              aria-label="Refresh transfers"
            >
              <RefreshCw
                size={18}
                className={refreshing ? "animate-spin" : ""}
              />
            </button>
          </div>

          <div className="md:mt-10 md:grid md:grid-cols-[340px_1fr] md:gap-8">
            <div className="mt-6 flex justify-center md:mt-0 md:block">
              <Link
                href="/dashboard/transfer/edit"
                className="flex h-[92px] w-[220px] flex-col items-center justify-center gap-2 rounded-[10px] bg-[linear-gradient(180deg,#d71919,#9f0505)] shadow-[0_8px_18px_rgba(160,0,0,0.45)] transition-transform active:scale-[0.98] md:h-[260px] md:w-full md:rounded-[28px] md:shadow-[0_24px_60px_rgba(160,0,0,0.4)] md:hover:scale-[1.015]"
              >
                <div className="flex h-[44px] w-[44px] items-center justify-center rounded-[8px] bg-white text-emerald-600 md:h-[86px] md:w-[86px] md:rounded-[22px]">
                  <ArrowLeftRight
                    size={22}
                    strokeWidth={2.4}
                    className="md:h-10 md:w-10"
                  />
                </div>

                <span className="text-[12px] font-semibold text-white md:text-[22px] md:font-black">
                  New Transfer
                </span>

                <p className="hidden max-w-[220px] text-center text-sm text-white/70 md:block">
                  Create a new client transfer record.
                </p>
              </Link>
            </div>

            <div className="md:rounded-[28px] md:border md:border-white/10 md:bg-white/[0.06] md:p-6 md:shadow-[0_20px_70px_rgba(0,0,0,0.35)] md:backdrop-blur-xl">
              <div className="mx-8 mt-4 h-px bg-white/50 md:hidden" />

              <div className="md:flex md:items-end md:justify-between">
                <div>
                  <h2 className="mt-3 text-[13px] font-bold md:mt-0 md:text-[24px] md:font-black">
                    Transfer History
                  </h2>

                  <p className="hidden text-sm text-white/50 md:block">
                    Latest tenant transfers
                  </p>
                </div>

                <div className="hidden rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white/75 md:block">
                  {recordCount} records
                </div>
              </div>

              {error && (
                <div className="mt-4 rounded-xl bg-red-500/10 px-4 py-3">
                  <p className="text-xs font-semibold text-red-200">
                    {error}
                  </p>

                  <button
                    type="button"
                    onClick={() => fetchTransfers(true)}
                    className="mt-2 text-xs font-bold text-white underline"
                  >
                    Try again
                  </button>
                </div>
              )}

              {loading ? (
                <div className="mt-6 space-y-4">
                  {Array.from({ length: 4 }).map(
                    (_, index) => (
                      <div
                        key={index}
                        className="h-[48px] animate-pulse rounded-[8px] bg-white/20 md:h-[82px] md:rounded-[20px]"
                      />
                    )
                  )}
                </div>
              ) : transfers.length === 0 ? (
                <div className="mt-6 rounded-[20px] bg-white p-8 text-center text-black">
                  <p className="text-lg font-black">
                    No transfers yet
                  </p>

                  <p className="mt-1 text-sm text-black/55">
                    Transfer records will appear here.
                  </p>
                </div>
              ) : (
                <div className="mt-3 space-y-[9px] md:mt-6 md:space-y-4">
                  {transfers.map((item) => {
                    const incoming = item.type === "in";

                    return (
                      <div
                        key={item.id}
                        role="button"
                        tabIndex={0}
                        onClick={() =>
                          goToTransaction(item.id)
                        }
                        onKeyDown={(event) => {
                          if (
                            event.key === "Enter" ||
                            event.key === " "
                          ) {
                            goToTransaction(item.id);
                          }
                        }}
                        className="flex h-[48px] w-full cursor-pointer items-center gap-2 rounded-[8px] bg-white px-2.5 text-black shadow-[0_1px_5px_rgba(255,255,255,0.15)] transition hover:bg-white/95 md:h-[82px] md:gap-4 md:rounded-[20px] md:px-5 md:shadow-[0_14px_35px_rgba(0,0,0,0.18)]"
                      >
                        <div
                          className={`flex h-[26px] w-[26px] flex-none items-center justify-center rounded-full md:h-[48px] md:w-[48px] ${
                            incoming
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-red-50 text-red-600"
                          }`}
                        >
                          {incoming ? (
                            <MoveDownLeft
                              size={15}
                              strokeWidth={2.6}
                              className="md:h-6 md:w-6"
                            />
                          ) : (
                            <MoveUpRight
                              size={15}
                              strokeWidth={2.6}
                              className="md:h-6 md:w-6"
                            />
                          )}
                        </div>

                        <div className="min-w-0 flex-1 overflow-hidden">
                          <p className="truncate text-[11px] font-medium leading-[13px] text-black/55 md:text-[15px] md:leading-5">
                            {item.title}
                          </p>

                          <p className="truncate text-[11px] font-bold leading-[13px] text-black/75 md:text-[17px] md:leading-6">
                            {item.bank}
                          </p>

                          <p className="hidden truncate text-xs text-black/45 md:block">
                            {item.reference} · {item.status}
                          </p>
                        </div>

                        <p
                          className={`flex-none truncate text-right text-[13px] font-bold md:text-[20px] ${
                            incoming
                              ? "text-emerald-600"
                              : "text-red-600"
                          }`}
                          style={{ maxWidth: 180 }}
                        >
                          {item.amount}
                        </p>

                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            goToEdit(item.id);
                          }}
                          className="flex h-[26px] w-[22px] flex-none items-center justify-center active:scale-90 md:h-11 md:w-11 md:rounded-full md:bg-black/5 md:hover:bg-black/10"
                          aria-label={`Edit transfer ${item.reference}`}
                        >
                          <SquarePen
                            size={16}
                            strokeWidth={2.3}
                            color="#000000"
                            className="md:h-5 md:w-5"
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}