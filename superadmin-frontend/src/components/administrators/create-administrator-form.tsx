"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { ApiError } from "@/src/lib/api-error";
import { platformAdminsService } from "@/src/services/platform-admins.service";
import type {
  PlatformAdministratorRole,
  PlatformPermission,
} from "@/src/types/platform-admin";

export function CreateAdministratorForm() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    roleCode:
      "platform_support" as PlatformAdministratorRole,
    temporaryPassword: "",
  });

  const [availablePermissions, setAvailablePermissions] =
    useState<PlatformPermission[]>([]);

  const [permissions, setPermissions] =
    useState<string[]>([]);

  const [error, setError] =
    useState<string | null>(null);

  const [isLoadingPermissions, setIsLoadingPermissions] =
    useState(true);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadPermissions = async () => {
      setIsLoadingPermissions(true);
      setError(null);

      try {
        const response =
          await platformAdminsService.listPermissions();

        if (cancelled) {
          return;
        }

        const rows = Array.isArray(response.data)
          ? response.data
          : [];

        setAvailablePermissions(rows);
      } catch (caught) {
        if (cancelled) {
          return;
        }

        setError(
          caught instanceof ApiError
            ? caught.message
            : "Unable to load platform permissions."
        );
      } finally {
        if (!cancelled) {
          setIsLoadingPermissions(false);
        }
      }
    };

    void loadPermissions();

    return () => {
      cancelled = true;
    };
  }, []);

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
      .map(([moduleName, modulePermissions]) => ({
        moduleName,
        permissions: modulePermissions.sort(
          (first, second) =>
            first.code.localeCompare(second.code)
        ),
      }));
  }, [availablePermissions]);

  const togglePermission = (
    permissionCode: string
  ) => {
    setPermissions((current) =>
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
        permissions.includes(code)
      );

    if (allSelected) {
      setPermissions((current) =>
        current.filter(
          (code) =>
            !moduleCodes.includes(code)
        )
      );

      return;
    }

    setPermissions((current) => [
      ...new Set([
        ...current,
        ...moduleCodes,
      ]),
    ]);
  };

  const selectAllPermissions = () => {
    setPermissions(
      availablePermissions.map(
        (permission) => permission.code
      )
    );
  };

  const clearAllPermissions = () => {
    setPermissions([]);
  };

  const submit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError(null);

    if (permissions.length === 0) {
      setError(
        "Select at least one permission."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response =
        await platformAdminsService.create({
          ...form,
          status: "active",
          permissions,
        });

      router.push(
        `/administrators/${response.data.id}`
      );
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "Unable to create administrator."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="space-y-6 text-gray-900"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <input
          value={form.firstName}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              firstName:
                event.target.value,
            }))
          }
          placeholder="First name"
          required
          className="h-12 rounded-xl border border-gray-300 bg-white px-4 text-gray-900 placeholder-gray-400 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
        />

        <input
          value={form.lastName}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              lastName:
                event.target.value,
            }))
          }
          placeholder="Last name"
          required
          className="h-12 rounded-xl border border-gray-300 bg-white px-4 text-gray-900 placeholder-gray-400 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
        />

        <input
          type="email"
          value={form.email}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              email:
                event.target.value,
            }))
          }
          placeholder="Email address"
          required
          className="h-12 rounded-xl border border-gray-300 bg-white px-4 text-gray-900 placeholder-gray-400 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
        />

        <input
          type="password"
          value={form.temporaryPassword}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              temporaryPassword:
                event.target.value,
            }))
          }
          placeholder="Temporary password"
          minLength={12}
          required
          className="h-12 rounded-xl border border-gray-300 bg-white px-4 text-gray-900 placeholder-gray-400 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
        />

        <select
          value={form.roleCode}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              roleCode:
                event.target
                  .value as PlatformAdministratorRole,
            }))
          }
          className="h-12 rounded-xl border border-gray-300 bg-white px-4 text-gray-900 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
        >
          <option value="platform_support">
            Platform Support
          </option>

          <option value="platform_auditor">
            Platform Auditor
          </option>

          <option value="platform_superadmin">
            Platform Superadmin
          </option>
        </select>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Permissions
            </h2>

            <p className="mt-1 text-sm text-gray-600">
              Select what this administrator
              is allowed to access and manage.
            </p>
          </div>

          {!isLoadingPermissions &&
            availablePermissions.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={selectAllPermissions}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
                >
                  Select all
                </button>

                <button
                  type="button"
                  onClick={clearAllPermissions}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
                >
                  Clear all
                </button>
              </div>
            )}
        </div>

        {isLoadingPermissions ? (
          <div className="rounded-xl border border-gray-300 bg-white p-5 text-sm text-gray-500 shadow-sm">
            Loading permissions…
          </div>
        ) : availablePermissions.length === 0 ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
            <p className="font-medium text-amber-800">
              No platform permissions are
              available.
            </p>

            <p className="mt-1 text-sm text-amber-700">
              The platform permission catalogue
              must be seeded before an
              administrator can be created.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {groupedPermissions.map(
              ({
                moduleName,
                permissions:
                  modulePermissions,
              }) => {
                const moduleCodes =
                  modulePermissions.map(
                    (permission) =>
                      permission.code
                  );

                const selectedCount =
                  moduleCodes.filter(
                    (code) =>
                      permissions.includes(
                        code
                      )
                  ).length;

                const allSelected =
                  moduleCodes.length > 0 &&
                  selectedCount ===
                    moduleCodes.length;

                return (
                  <section
                    key={moduleName}
                    className="overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm"
                  >
                    <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3">
                      <div>
                        <h3 className="font-semibold capitalize text-gray-900">
                          {moduleName.replace(
                            /_/g,
                            " "
                          )}
                        </h3>

                        <p className="mt-0.5 text-xs text-gray-500">
                          {selectedCount} of{" "}
                          {
                            modulePermissions.length
                          }{" "}
                          selected
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          toggleModule(
                            modulePermissions
                          )
                        }
                        className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
                      >
                        {allSelected
                          ? "Clear module"
                          : "Select module"}
                      </button>
                    </div>

                    <div className="grid gap-3 p-4 md:grid-cols-2">
                      {modulePermissions.map(
                        (permission) => {
                          const checked =
                            permissions.includes(
                              permission.code
                            );

                          return (
                            <label
                              key={
                                permission.id
                              }
                              className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-white p-3 transition hover:bg-gray-50"
                            >
                              <input
                                type="checkbox"
                                checked={
                                  checked
                                }
                                onChange={() =>
                                  togglePermission(
                                    permission.code
                                  )
                                }
                                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />

                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-900">
                                  {
                                    permission.name
                                  }
                                </p>

                                <p className="mt-0.5 break-all font-mono text-xs text-gray-500">
                                  {
                                    permission.code
                                  }
                                </p>

                                {permission.description && (
                                  <p className="mt-1 text-xs leading-5 text-gray-600">
                                    {
                                      permission.description
                                    }
                                  </p>
                                )}
                              </div>
                            </label>
                          );
                        }
                      )}
                    </div>
                  </section>
                );
              }
            )}
          </div>
        )}

        {!isLoadingPermissions &&
          availablePermissions.length > 0 && (
            <p className="text-sm font-medium text-gray-700">
              {permissions.length} permission
              {permissions.length === 1
                ? ""
                : "s"}{" "}
              selected.
            </p>
          )}
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={
          isSubmitting ||
          isLoadingPermissions ||
          availablePermissions.length === 0 ||
          permissions.length === 0
        }
        className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting
          ? "Creating administrator…"
          : "Create administrator"}
      </button>
    </form>
  );
}