"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Globe2,
  Loader2,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
} from "lucide-react";

import { ApiError } from "@/src/lib/api-error";
import {
  platformDomainsService,
  type PlatformDomainListItem,
  type PlatformDomainStatus,
  type PlatformDomainType,
} from "@/src/services/platform-domains.service";

const PAGE_SIZE = 20;

const statusOptions: Array<{
  value: "" | PlatformDomainStatus;
  label: string;
}> = [
  {
    value: "",
    label: "All statuses",
  },
  {
    value: "verification_pending",
    label: "Verification pending",
  },
  {
    value: "verified",
    label: "Verified",
  },
  {
    value: "provisioning",
    label: "Provisioning",
  },
  {
    value: "active",
    label: "Active",
  },
  {
    value: "failed",
    label: "Failed",
  },
  {
    value: "disconnected",
    label: "Disconnected",
  },
];

const typeOptions: Array<{
  value: "" | PlatformDomainType;
  label: string;
}> = [
  {
    value: "",
    label: "All domain types",
  },
  {
    value: "custom",
    label: "Custom",
  },
  {
    value: "temporary",
    label: "Temporary",
  },
];

const formatStatus = (
  value: string
) =>
  value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );

const formatDate = (
  value: string | null
) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(date);
};

function StatusBadge({
  status,
}: {
  status: PlatformDomainStatus;
}) {
  const classes =
    status === "active"
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
      : status === "failed"
        ? "border-red-500/20 bg-red-500/10 text-red-300"
        : status ===
            "verification_pending"
          ? "border-amber-500/20 bg-amber-500/10 text-amber-300"
          : status ===
              "provisioning"
            ? "border-blue-500/20 bg-blue-500/10 text-blue-300"
            : "border-white/10 bg-white/5 text-white/60";

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${classes}`}
    >
      {formatStatus(status)}
    </span>
  );
}

function SslBadge({
  status,
}: {
  status: string | null;
}) {
  if (!status) {
    return (
      <span className="text-sm text-white/35">
        —
      </span>
    );
  }

  const active =
    status === "active";

  const failed =
    status === "failed";

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
        active
          ? "text-emerald-300"
          : failed
            ? "text-red-300"
            : "text-amber-300"
      }`}
    >
      <ShieldCheck
        size={14}
      />

      {formatStatus(status)}
    </span>
  );
}

export default function PlatformDomainsPage() {
  const [domains, setDomains] =
    useState<
      PlatformDomainListItem[]
    >([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [
    submittedSearch,
    setSubmittedSearch,
  ] = useState("");

  const [
    status,
    setStatus,
  ] = useState<
    "" | PlatformDomainStatus
  >("");

  const [
    domainType,
    setDomainType,
  ] = useState<
    "" | PlatformDomainType
  >("");

  const [page, setPage] =
    useState(1);

  const [total, setTotal] =
    useState(0);

  const [
    totalPages,
    setTotalPages,
  ] = useState(1);

  const loadDomains =
    useCallback(async () => {
      setLoading(true);
      setError("");

      try {
        const response =
          await platformDomainsService.list(
            {
              page,
              limit:
                PAGE_SIZE,

              search:
                submittedSearch ||
                undefined,

              status:
                status ||
                undefined,

              domainType:
                domainType ||
                undefined,
            }
          );

        setDomains(
          response.data ?? []
        );

        setTotal(
          response.meta?.total ??
            0
        );

        setTotalPages(
          Math.max(
            1,
            response.meta
              ?.totalPages ??
              1
          )
        );
      } catch (caught) {
        setDomains([]);

        setError(
          caught instanceof
            ApiError
            ? caught.message
            : "Unable to load tenant domains."
        );
      } finally {
        setLoading(false);
      }
    }, [
      page,
      submittedSearch,
      status,
      domainType,
    ]);

  useEffect(() => {
    void loadDomains();
  }, [loadDomains]);

  const submitSearch = (
    event:
      React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setPage(1);

    setSubmittedSearch(
      search.trim()
    );
  };

  const resetFilters = () => {
    setSearch("");
    setSubmittedSearch("");
    setStatus("");
    setDomainType("");
    setPage(1);
  };

  return (
    <main className="min-h-screen bg-black px-5 py-6 text-white md:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/35">
              Platform operations
            </p>

            <h1 className="mt-2 text-3xl font-black md:text-5xl">
              Tenant domains
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">
              Monitor custom
              domains, ownership
              verification,
              provisioning and SSL
              status across all
              ZentraBank tenants.
            </p>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={() =>
              void loadDomains()
            }
            className="flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold transition hover:bg-white/10 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-white/45">
                Matching domains
              </p>

              <Globe2
                size={19}
                className="text-white/30"
              />
            </div>

            <p className="mt-3 text-3xl font-black">
              {total}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-white/45">
                Failed on this page
              </p>

              <AlertTriangle
                size={19}
                className="text-red-300"
              />
            </div>

            <p className="mt-3 text-3xl font-black">
              {
                domains.filter(
                  (domain) =>
                    domain.status ===
                    "failed"
                ).length
              }
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-white/45">
                Active on this page
              </p>

              <CheckCircle2
                size={19}
                className="text-emerald-300"
              />
            </div>

            <p className="mt-3 text-3xl font-black">
              {
                domains.filter(
                  (domain) =>
                    domain.status ===
                    "active"
                ).length
              }
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4 md:p-5">
          <form
            onSubmit={
              submitSearch
            }
            className="grid gap-3 lg:grid-cols-[1fr_220px_200px_auto]"
          >
            <div className="relative">
              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
              />

              <input
                value={search}
                onChange={(
                  event
                ) =>
                  setSearch(
                    event.target
                      .value
                  )
                }
                placeholder="Search domain, tenant or app..."
                className="h-12 w-full rounded-xl border border-white/10 bg-black pl-11 pr-4 text-sm outline-none transition focus:border-white/30"
              />
            </div>

            <select
              value={status}
              onChange={(
                event
              ) => {
                setPage(1);

                setStatus(
                  event.target
                    .value as
                    | ""
                    | PlatformDomainStatus
                );
              }}
              className="h-12 rounded-xl border border-white/10 bg-black px-4 text-sm outline-none"
            >
              {statusOptions.map(
                (option) => (
                  <option
                    key={
                      option.value
                    }
                    value={
                      option.value
                    }
                  >
                    {
                      option.label
                    }
                  </option>
                )
              )}
            </select>

            <select
              value={
                domainType
              }
              onChange={(
                event
              ) => {
                setPage(1);

                setDomainType(
                  event.target
                    .value as
                    | ""
                    | PlatformDomainType
                );
              }}
              className="h-12 rounded-xl border border-white/10 bg-black px-4 text-sm outline-none"
            >
              {typeOptions.map(
                (option) => (
                  <option
                    key={
                      option.value
                    }
                    value={
                      option.value
                    }
                  >
                    {
                      option.label
                    }
                  </option>
                )
              )}
            </select>

            <button
              type="submit"
              className="h-12 rounded-xl bg-white px-6 text-sm font-bold text-black"
            >
              Search
            </button>
          </form>

          {(submittedSearch ||
            status ||
            domainType) && (
            <button
              type="button"
              onClick={
                resetFilters
              }
              className="mt-3 text-xs font-semibold text-white/45 hover:text-white"
            >
              Clear filters
            </button>
          )}
        </section>

        {error ? (
          <div className="mt-6 flex gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
            <AlertTriangle
              size={18}
              className="mt-0.5 shrink-0"
            />

            <p>{error}</p>
          </div>
        ) : null}

        <section className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          {loading ? (
            <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-white/45">
              <Loader2
                size={20}
                className="animate-spin"
              />

              Loading tenant
              domains…
            </div>
          ) : domains.length ===
            0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
              <Globe2
                size={36}
                className="text-white/20"
              />

              <p className="mt-4 font-bold">
                No domains found
              </p>

              <p className="mt-2 max-w-md text-sm leading-6 text-white/40">
                There are no
                tenant domains
                matching the
                selected filters.
              </p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full text-left">
                  <thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-wide text-white/35">
                    <tr>
                      <th className="px-5 py-4">
                        Tenant
                      </th>

                      <th className="px-5 py-4">
                        Domain
                      </th>

                      <th className="px-5 py-4">
                        Type
                      </th>

                      <th className="px-5 py-4">
                        Status
                      </th>

                      <th className="px-5 py-4">
                        SSL
                      </th>

                      <th className="px-5 py-4">
                        Provider
                      </th>

                      <th className="px-5 py-4">
                        Updated
                      </th>

                      <th className="px-5 py-4" />
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/10">
                   {domains.map(
                        (domain, index) => (
                            <tr
                            key={
                                domain.id ||
                                `${domain.tenant_id}-${domain.domain}-${index}`
                            }
                          className={
                            domain.status ===
                            "failed"
                              ? "bg-red-500/[0.035]"
                              : ""
                          }
                        >
                          <td className="px-5 py-5">
                            <p className="font-semibold">
                              {
                                domain.tenant_name
                              }
                            </p>

                            <p className="mt-1 text-xs text-white/35">
                              {
                                domain.tenant_slug
                              }
                            </p>
                          </td>

                          <td className="max-w-[280px] px-5 py-5">
                            <div className="flex items-center gap-2">
                              <Globe2
                                size={
                                  15
                                }
                                className="shrink-0 text-white/30"
                              />

                              <span className="truncate font-medium">
                                {
                                  domain.domain
                                }
                              </span>
                            </div>

                            {Boolean(
                              domain.is_primary
                            ) ? (
                              <span className="mt-2 inline-flex rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-300">
                                Primary
                              </span>
                            ) : null}

                            {domain.failure_reason ? (
                              <p className="mt-2 line-clamp-2 text-xs leading-5 text-red-300">
                                {
                                  domain.failure_reason
                                }
                              </p>
                            ) : null}
                          </td>

                          <td className="px-5 py-5 text-sm capitalize text-white/55">
                            {
                              domain.domain_type
                            }
                          </td>

                          <td className="px-5 py-5">
                            <StatusBadge
                              status={
                                domain.status
                              }
                            />
                          </td>

                          <td className="px-5 py-5">
                            <SslBadge
                              status={
                                domain.ssl_status
                              }
                            />
                          </td>

                          <td className="px-5 py-5">
                            <div className="flex items-center gap-2 text-sm text-white/55">
                              <Server
                                size={
                                  15
                                }
                              />

                              {domain.provider ||
                                "—"}
                            </div>
                          </td>

                          <td className="whitespace-nowrap px-5 py-5 text-xs text-white/40">
                            {formatDate(
                              domain.updated_at
                            )}
                          </td>

                          <td className="px-5 py-5 text-right">
                            <Link
                              href={`/dashboard/domains/${domain.id}`}
                              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold hover:bg-white/10"
                            >
                              Inspect

                              <ExternalLink
                                size={
                                  13
                                }
                              />
                            </Link>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-white/10 lg:hidden">
                {domains.map(
                    (domain, index) => (
                        <article
                        key={
                            domain.id ||
                            `${domain.tenant_id}-${domain.domain}-${index}`
                        }
                      className="p-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs text-white/35">
                            {
                              domain.tenant_name
                            }
                          </p>

                          <p className="mt-1 break-all font-bold">
                            {
                              domain.domain
                            }
                          </p>
                        </div>

                        <StatusBadge
                          status={
                            domain.status
                          }
                        />
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-xs text-white/35">
                            Type
                          </p>

                          <p className="mt-1 capitalize">
                            {
                              domain.domain_type
                            }
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-white/35">
                            SSL
                          </p>

                          <div className="mt-1">
                            <SslBadge
                              status={
                                domain.ssl_status
                              }
                            />
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-white/35">
                            Provider
                          </p>

                          <p className="mt-1">
                            {domain.provider ||
                              "—"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-white/35">
                            Attempts
                          </p>

                          <p className="mt-1">
                            {
                              domain.verification_attempts
                            }
                          </p>
                        </div>
                      </div>

                      {domain.failure_reason ? (
                        <p className="mt-4 rounded-xl bg-red-500/10 p-3 text-xs leading-5 text-red-200">
                          {
                            domain.failure_reason
                          }
                        </p>
                      ) : null}

                      <Link
                        href={`/dashboard/domains/${domain.id}`}
                        className="mt-4 flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 text-xs font-bold"
                      >
                        Inspect domain

                        <ExternalLink
                          size={13}
                        />
                      </Link>
                    </article>
                  )
                )}
              </div>
            </>
          )}
        </section>

        {!loading &&
        total > 0 ? (
          <div className="mt-5 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-xs text-white/40">
              Page {page} of{" "}
              {totalPages} ·{" "}
              {total} domain
              {total === 1
                ? ""
                : "s"}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={
                  page <= 1
                }
                onClick={() =>
                  setPage(
                    (current) =>
                      Math.max(
                        1,
                        current -
                          1
                      )
                  )
                }
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-30"
              >
                Previous
              </button>

              <button
                type="button"
                disabled={
                  page >=
                  totalPages
                }
                onClick={() =>
                  setPage(
                    (current) =>
                      Math.min(
                        totalPages,
                        current +
                          1
                      )
                  )
                }
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}