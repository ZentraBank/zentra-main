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
      className="space-y-6"
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
          className="h-12 rounded-xl border border-white/10 bg-white/5 px-4"
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
          className="h-12 rounded-xl border border-white/10 bg-white/5 px-4"
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
          className="h-12 rounded-xl border border-white/10 bg-white/5 px-4"
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
          className="h-12 rounded-xl border border-white/10 bg-white/5 px-4"
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
          className="h-12 rounded-xl border border-white/10 bg-neutral-900 px-4"
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
            <h2 className="text-lg font-semibold">
              Permissions
            </h2>

            <p className="mt-1 text-sm text-white/50">
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
                  className="rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-white/70 transition hover:bg-white/5 hover:text-white"
                >
                  Select all
                </button>

                <button
                  type="button"
                  onClick={clearAllPermissions}
                  className="rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-white/70 transition hover:bg-white/5 hover:text-white"
                >
                  Clear all
                </button>
              </div>
            )}
        </div>

        {isLoadingPermissions ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-sm text-white/60">
            Loading permissions…
          </div>
        ) : availablePermissions.length === 0 ? (
          <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-5">
            <p className="font-medium text-amber-200">
              No platform permissions are
              available.
            </p>

            <p className="mt-1 text-sm text-amber-100/60">
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
                    className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]"
                  >
                    <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                      <div>
                        <h3 className="font-medium capitalize">
                          {moduleName.replace(
                            /_/g,
                            " "
                          )}
                        </h3>

                        <p className="mt-0.5 text-xs text-white/40">
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
                        className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-white/70 transition hover:bg-white/5 hover:text-white"
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
                              className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3 transition hover:bg-white/[0.08]"
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
                                className="mt-1"
                              />

                              <div className="min-w-0">
                                <p className="text-sm font-medium">
                                  {
                                    permission.name
                                  }
                                </p>

                                <p className="mt-0.5 break-all text-xs text-white/45">
                                  {
                                    permission.code
                                  }
                                </p>

                                {permission.description && (
                                  <p className="mt-1 text-xs leading-5 text-white/50">
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
            <p className="text-sm text-white/50">
              {permissions.length} permission
              {permissions.length === 1
                ? ""
                : "s"}{" "}
              selected.
            </p>
          )}
      </div>

      {error && (
        <p className="text-sm text-red-300">
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
        className="rounded-xl bg-white px-6 py-3 font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting
          ? "Creating administrator…"
          : "Create administrator"}
      </button>
    </form>
  );
}