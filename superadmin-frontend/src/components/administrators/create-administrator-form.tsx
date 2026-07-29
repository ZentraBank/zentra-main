"use client";

import {
  FormEvent,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { ApiError } from "@/src/lib/api-error";
import { platformAdminsService } from "@/src/services/platform-admins.service";
import type {
  PlatformAdministratorRole,
} from "@/src/types/platform-admin";

const permissionOptions = [
  "platform.dashboard.read",
  "platform.tenants.read",
  "platform.tenants.create",
  "platform.tenants.update",
  "platform.tenants.features.manage",
  "platform.administrators.read",
  "platform.administrators.create",
  "platform.administrators.update",
  "platform.administrators.suspend",
  "platform.administrators.permissions.manage",
  "platform.subscriptions.read",
  "platform.subscriptions.create",
  "platform.subscriptions.update",
  "platform.subscriptions.cancel",
  "platform.users.read",
  "platform.accounts.read",
  "platform.transactions.read",
  "platform.notifications.read",
  "platform.notifications.create",
  "platform.audit_logs.read",
  "platform.settings.read",
  "platform.settings.manage",
];

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

  const [permissions, setPermissions] =
    useState<string[]>([
      "platform.dashboard.read",
    ]);

  const [error, setError] =
    useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const togglePermission = (
    permission: string
  ) => {
    setPermissions((current) =>
      current.includes(permission)
        ? current.filter(
            (value) => value !== permission
          )
        : [...current, permission]
    );
  };

  const submit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError(null);
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
              firstName: event.target.value,
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
              lastName: event.target.value,
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
              email: event.target.value,
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
                event.target.value as PlatformAdministratorRole,
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

      <div>
        <h2 className="mb-3 text-lg font-semibold">
          Permissions
        </h2>

        <div className="grid gap-3 md:grid-cols-2">
          {permissionOptions.map(
            (permission) => (
              <label
                key={permission}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
              >
                <input
                  type="checkbox"
                  checked={permissions.includes(
                    permission
                  )}
                  onChange={() =>
                    togglePermission(permission)
                  }
                />

                <span className="text-sm">
                  {permission}
                </span>
              </label>
            )
          )}
        </div>
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
          permissions.length === 0
        }
        className="rounded-xl bg-white px-6 py-3 font-semibold text-black disabled:opacity-60"
      >
        {isSubmitting
          ? "Creating administrator…"
          : "Create administrator"}
      </button>
    </form>
  );
}
