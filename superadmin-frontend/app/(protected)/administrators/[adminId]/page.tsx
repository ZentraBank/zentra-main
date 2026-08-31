"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useParams } from "next/navigation";
import {
  CalendarDays,
  Check,
  KeyRound,
  Loader2,
  Mail,
  Pencil,
  RefreshCw,
  Save,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

import PageHeader from "@/components/shared/PageHeader";
import { ApiError } from "@/src/lib/api-error";
import { platformAdminsService } from "@/src/services/platform-admins.service";
import type {
  PlatformAdministrator,
  PlatformAdministratorStatus,
  PlatformPermission,
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

  const [
    availablePermissions,
    setAvailablePermissions,
  ] = useState<PlatformPermission[]>([]);

  const [
    selectedPermissions,
    setSelectedPermissions,
  ] = useState<string[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState<string | null>(null);

  const [editingPermissions, setEditingPermissions] =
    useState(false);

  const [
    savingPermissions,
    setSavingPermissions,
  ] = useState(false);

  const [
    updatingStatus,
    setUpdatingStatus,
  ] = useState(false);

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

        setSelectedPermissions(
          response.data.permissions ?? []
        );
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

  const loadPermissionCatalogue =
    useCallback(async () => {
      try {
        const response =
          await platformAdminsService.listPermissions();

        setAvailablePermissions(
          Array.isArray(response.data)
            ? response.data
            : []
        );
      } catch (caught) {
        setError(
          caught instanceof ApiError
            ? caught.message
            : "Unable to load platform permissions."
        );
      }
    }, []);

  useEffect(() => {
    void loadAdministrator();
  }, [loadAdministrator]);

  useEffect(() => {
    if (!editingPermissions) {
      return;
    }

    if (availablePermissions.length > 0) {
      return;
    }

    void loadPermissionCatalogue();
  }, [
    editingPermissions,
    availablePermissions.length,
    loadPermissionCatalogue,
  ]);

  const groupedPermissions = useMemo(() => {
    const groups: Record<
      string,
      PlatformPermission[]
    > = {};

    for (const permission of availablePermissions) {
      const moduleName =
        permission.module?.trim() ||
        "other";

      if (!groups[moduleName]) {
        groups[moduleName] = [];
      }

      groups[moduleName].push(permission);
    }

    return Object.entries(groups)
      .sort(([first], [second]) =>
        first.localeCompare(second)
      )
      .map(
        ([moduleName, permissions]) => ({
          moduleName,
          permissions:
            permissions.sort(
              (first, second) =>
                first.code.localeCompare(
                  second.code
                )
            ),
        })
      );
  }, [availablePermissions]);

  const togglePermission = (
    permissionCode: string
  ) => {
    setSelectedPermissions((current) =>
      current.includes(permissionCode)
        ? current.filter(
            (value) =>
              value !== permissionCode
          )
        : [...current, permissionCode]
    );
  };

  const toggleModule = (
    modulePermissions: PlatformPermission[]
  ) => {
    const moduleCodes =
      modulePermissions.map(
        (permission) => permission.code
      );

    const allSelected =
      moduleCodes.every((code) =>
        selectedPermissions.includes(code)
      );

    if (allSelected) {
      setSelectedPermissions((current) =>
        current.filter(
          (code) =>
            !moduleCodes.includes(code)
        )
      );

      return;
    }

    setSelectedPermissions((current) => [
      ...new Set([
        ...current,
        ...moduleCodes,
      ]),
    ]);
  };

  const cancelPermissionEditing = () => {
    setSelectedPermissions(
      administrator?.permissions ?? []
    );

    setEditingPermissions(false);
    setError(null);
  };

  const savePermissions = async () => {
    if (!administrator) {
      return;
    }

    setSavingPermissions(true);
    setError(null);
    setSuccess(null);

    try {
      const response =
        await platformAdminsService.updatePermissions(
          administrator.id,
          selectedPermissions
        );

      setAdministrator(response.data);

      setSelectedPermissions(
        response.data.permissions ?? []
      );

      setEditingPermissions(false);

      setSuccess(
        "Administrator permissions updated successfully."
      );
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "Unable to update administrator permissions."
      );
    } finally {
      setSavingPermissions(false);
    }
  };

  const changeStatus = async (
    status: PlatformAdministratorStatus
  ) => {
    if (!administrator) {
      return;
    }

    setUpdatingStatus(true);
    setError(null);
    setSuccess(null);

    try {
      const response =
        await platformAdminsService.updateStatus(
          administrator.id,
          status
        );

      setAdministrator((current) =>
        current
          ? {
              ...current,
              status: response.data.status,
            }
          : current
      );

      setSuccess(
        `Administrator status changed to ${formatStatus(
          response.data.status
        )}.`
      );
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "Unable to update administrator status."
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

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

  if (error && !administrator) {
    return (
      <main className="mx-auto max-w-[1200px]">
        <PageHeader
          eyebrow="Administrator record"
          title="Administrator details"
          description={`Viewing record: ${adminId}`}
        />

        <div className="mt-6 rounded-[28px] bg-white p-7 shadow-[0_14px_40px_rgba(22,54,112,0.08)]">
          <p className="text-sm font-medium text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              void loadAdministrator()
            }
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
        </div>
      </main>
    );
  }

  if (!administrator) {
    return null;
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
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700">
            {success}
          </div>
        )}

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
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-blue-600" />

                <h2 className="text-lg font-bold text-slate-950">
                  Assigned permissions
                </h2>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Manage the actions this administrator
                can perform across the platform.
              </p>
            </div>

            {!editingPermissions ? (
              <button
                type="button"
                onClick={() => {
                  setEditingPermissions(true);
                  setError(null);
                  setSuccess(null);
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <Pencil className="h-4 w-4" />
                Edit permissions
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={
                    cancelPermissionEditing
                  }
                  disabled={savingPermissions}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() =>
                    void savePermissions()
                  }
                  disabled={savingPermissions}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {savingPermissions ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}

                  Save permissions
                </button>
              </div>
            )}
          </div>

          {!editingPermissions ? (
            permissions.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5">
                <p className="text-sm text-slate-500">
                  No permissions have been assigned
                  to this administrator.
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
                      <Check className="h-4 w-4 shrink-0 text-emerald-600" />

                      <span className="break-all text-sm font-medium text-slate-700">
                        {permission}
                      </span>
                    </div>
                  )
                )}
              </div>
            )
          ) : availablePermissions.length === 0 ? (
            <div className="mt-6 flex items-center gap-3 rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading permission catalogue…
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-500">
                  {selectedPermissions.length} permissions selected
                </p>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedPermissions(
                        availablePermissions.map(
                          (permission) =>
                            permission.code
                        )
                      )
                    }
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600"
                  >
                    Select all
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedPermissions([])
                    }
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600"
                  >
                    Clear all
                  </button>
                </div>
              </div>

              {groupedPermissions.map(
                ({
                  moduleName,
                  permissions:
                    modulePermissions,
                }) => {
                  const codes =
                    modulePermissions.map(
                      (permission) =>
                        permission.code
                    );

                  const selectedCount =
                    codes.filter((code) =>
                      selectedPermissions.includes(
                        code
                      )
                    ).length;

                  const allSelected =
                    selectedCount ===
                      codes.length &&
                    codes.length > 0;

                  return (
                    <div
                      key={moduleName}
                      className="overflow-hidden rounded-2xl border border-slate-200"
                    >
                      <div className="flex items-center justify-between bg-slate-50 px-5 py-4">
                        <div>
                          <h3 className="font-semibold capitalize text-slate-800">
                            {moduleName.replace(
                              /_/g,
                              " "
                            )}
                          </h3>

                          <p className="mt-1 text-xs text-slate-500">
                            {selectedCount} of{" "}
                            {codes.length} selected
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            toggleModule(
                              modulePermissions
                            )
                          }
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600"
                        >
                          {allSelected
                            ? "Clear module"
                            : "Select module"}
                        </button>
                      </div>

                      <div className="grid gap-3 p-4 md:grid-cols-2">
                        {modulePermissions.map(
                          (permission) => (
                            <label
                              key={permission.id}
                              className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-100 p-4 transition hover:bg-slate-50"
                            >
                              <input
                                type="checkbox"
                                checked={selectedPermissions.includes(
                                  permission.code
                                )}
                                onChange={() =>
                                  togglePermission(
                                    permission.code
                                  )
                                }
                                className="mt-1"
                              />

                              <div>
                                <p className="text-sm font-semibold text-slate-800">
                                  {permission.name}
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                  {permission.code}
                                </p>

                                {permission.description && (
                                  <p className="mt-2 text-xs leading-5 text-slate-500">
                                    {
                                      permission.description
                                    }
                                  </p>
                                )}
                              </div>
                            </label>
                          )
                        )}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </section>

        <section className="rounded-[28px] bg-white p-7 shadow-[0_14px_40px_rgba(22,54,112,0.08)]">
          <div>
            <h2 className="text-lg font-bold text-slate-950">
              Account status
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Activate, suspend or deactivate this
              platform administrator.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={
                updatingStatus ||
                administrator.status ===
                  "active"
              }
              onClick={() =>
                void changeStatus("active")
              }
              className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Activate
            </button>

            <button
              type="button"
              disabled={
                updatingStatus ||
                administrator.status ===
                  "suspended"
              }
              onClick={() =>
                void changeStatus(
                  "suspended"
                )
              }
              className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Suspend
            </button>

            <button
              type="button"
              disabled={
                updatingStatus ||
                administrator.status ===
                  "inactive"
              }
              onClick={() =>
                void changeStatus(
                  "inactive"
                )
              }
              className="rounded-xl bg-slate-700 px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Deactivate
            </button>

            {updatingStatus && (
              <div className="flex items-center gap-2 px-2 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating status…
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}