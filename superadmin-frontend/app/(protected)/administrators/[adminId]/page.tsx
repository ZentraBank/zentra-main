"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { useParams } from "next/navigation";
import {
  CalendarDays,
  KeyRound,
  Loader2,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import PageHeader from "@/components/shared/PageHeader";
import { ApiError } from "@/src/lib/api-error";
import { platformAdminsService } from "@/src/services/platform-admins.service";
import type {
  PlatformAdministrator,
} from "@/src/types/platform-admin";

const formatRole = (
  role: PlatformAdministrator["role_code"]
) => {
  switch (role) {
    case "platform_superadmin":
      return "Platform Superadmin";

    case "platform_support":
      return "Platform Support";

    case "platform_auditor":
      return "Platform Auditor";

    default:
      return role;
  }
};

const formatStatus = (
  status: PlatformAdministrator["status"]
) => {
  switch (status) {
    case "active":
      return "Active";

    case "inactive":
      return "Inactive";

    case "suspended":
      return "Suspended";

    default:
      return status;
  }
};

const formatDate = (
  value: string | null | undefined
) => {
  if (!value) {
    return "Never";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(date);
};

export default function DetailPage() {
  const params =
    useParams<{ adminId: string }>();

  const adminId = params.adminId;

  const [administrator, setAdministrator] =
    useState<PlatformAdministrator | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const loadAdministrator =
    useCallback(async () => {
      if (!adminId) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response =
          await platformAdminsService.getById(
            adminId
          );

        setAdministrator(response.data);
      } catch (caught) {
        setError(
          caught instanceof ApiError
            ? caught.message
            : "Unable to load administrator."
        );
      } finally {
        setLoading(false);
      }
    }, [adminId]);

  useEffect(() => {
    void loadAdministrator();
  }, [loadAdministrator]);

  if (loading) {
    return (
      <main className="mx-auto max-w-[1200px]">
        <PageHeader
          eyebrow="Administrator record"
          title="Administrator details"
          description="Loading administrator record"
        />

        <div className="mt-6 flex min-h-[260px] items-center justify-center rounded-[28px] bg-white p-7 shadow-[0_14px_40px_rgba(22,54,112,0.08)]">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading administrator…
          </div>
        </div>
      </main>
    );
  }

  if (error || !administrator) {
    return (
      <main className="mx-auto max-w-[1200px]">
        <PageHeader
          eyebrow="Administrator record"
          title="Administrator details"
          description={`Viewing record: ${adminId}`}
        />

        <div className="mt-6 rounded-[28px] bg-white p-7 shadow-[0_14px_40px_rgba(22,54,112,0.08)]">
          <p className="text-sm font-medium text-red-600">
            {error ||
              "Administrator record could not be found."}
          </p>

          <button
            type="button"
            onClick={() =>
              void loadAdministrator()
            }
            className="mt-4 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  const permissions =
    administrator.permissions ?? [];

  return (
    <main className="mx-auto max-w-[1200px]">
      <PageHeader
        eyebrow="Administrator record"
        title="Administrator details"
        description={`Viewing record: ${administrator.id}`}
      />

      <div className="mt-6 space-y-6">
        <section className="rounded-[28px] bg-white p-7 shadow-[0_14px_40px_rgba(22,54,112,0.08)]">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <UserRound className="h-6 w-6" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  {administrator.first_name}{" "}
                  {administrator.last_name}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {formatRole(
                    administrator.role_code
                  )}
                </p>
              </div>
            </div>

            <span
              className={`inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${
                administrator.status ===
                "active"
                  ? "bg-emerald-50 text-emerald-700"
                  : administrator.status ===
                      "suspended"
                    ? "bg-red-50 text-red-700"
                    : "bg-slate-100 text-slate-600"
              }`}
            >
              {formatStatus(
                administrator.status
              )}
            </span>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                <Mail className="h-4 w-4" />
                Email
              </div>

              <p className="mt-2 break-all text-sm font-semibold text-slate-800">
                {administrator.email}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                <ShieldCheck className="h-4 w-4" />
                Role
              </div>

              <p className="mt-2 text-sm font-semibold text-slate-800">
                {formatRole(
                  administrator.role_code
                )}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                <CalendarDays className="h-4 w-4" />
                Last login
              </div>

              <p className="mt-2 text-sm font-semibold text-slate-800">
                {formatDate(
                  administrator.last_login_at
                )}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                <CalendarDays className="h-4 w-4" />
                Created
              </div>

              <p className="mt-2 text-sm font-semibold text-slate-800">
                {formatDate(
                  administrator.created_at
                )}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] bg-white p-7 shadow-[0_14px_40px_rgba(22,54,112,0.08)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-blue-600" />

                <h2 className="text-lg font-bold text-slate-950">
                  Assigned permissions
                </h2>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Permissions currently granted
                to this administrator.
              </p>
            </div>

            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
              {permissions.length}{" "}
              {permissions.length === 1
                ? "permission"
                : "permissions"}
            </span>
          </div>

          {permissions.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5">
              <p className="text-sm text-slate-500">
                No permissions have been
                assigned to this administrator.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {permissions.map(
                (permission) => (
                  <div
                    key={permission}
                    className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3"
                  >
                    <div className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />

                    <span className="break-all text-sm font-medium text-slate-700">
                      {permission}
                    </span>
                  </div>
                )
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}