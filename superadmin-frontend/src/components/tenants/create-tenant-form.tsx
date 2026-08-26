"use client";

import {
  FormEvent,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { ApiError } from "@/src/lib/api-error";
import { platformTenantsService } from "@/src/services/platform-tenants.service";

const initialForm = {
  code: "",
  name: "",
  appName: "",
  logoUrl: "",
  primaryColor: "#2447D8",
  planCode: "bronze",
  ownerFirstName: "",
  ownerLastName: "",
  ownerEmail: "",
  ownerPassword: "",
};

export function CreateTenantForm() {
  const router = useRouter();

  const [form, setForm] =
    useState(initialForm);

  const [error, setError] =
    useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const updateField = (
    key: keyof typeof form,
    value: string
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError(null);
    setIsSubmitting(true);

    try {
      const response =
        await platformTenantsService.create({
          code: form.code
            .trim()
            .toUpperCase(),

          name: form.name.trim(),

          appName:
            form.appName.trim(),

          logoUrl:
            form.logoUrl.trim() ||
            undefined,

          primaryColor:
            form.primaryColor,

          planCode:
            form.planCode as
              | "bronze"
              | "gold"
              | "diamond",

          ownerFirstName:
            form.ownerFirstName.trim(),

          ownerLastName:
            form.ownerLastName.trim(),

          ownerEmail:
            form.ownerEmail
              .trim()
              .toLowerCase(),

          ownerPassword:
            form.ownerPassword,
        });

      router.push(
        `/tenants/${response.data.tenantId}`
      );
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : caught instanceof Error
            ? caught.message
            : "Unable to create tenant."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label
            htmlFor="code"
            className="mb-2 block text-sm font-medium"
          >
            Tenant code
          </label>

          <input
            id="code"
            type="text"
            value={form.code}
            placeholder="ZENTRA_UK"
            onChange={(event) =>
              updateField(
                "code",
                event.target.value
              )
            }
            required
            className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm outline-none focus:border-white/30"
          />
        </div>

        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-medium"
          >
            Legal or organisation name
          </label>

          <input
            id="name"
            type="text"
            value={form.name}
            placeholder="ZentraBank UK Limited"
            onChange={(event) =>
              updateField(
                "name",
                event.target.value
              )
            }
            required
            className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm outline-none focus:border-white/30"
          />
        </div>

        <div>
          <label
            htmlFor="appName"
            className="mb-2 block text-sm font-medium"
          >
            Application name
          </label>

          <input
            id="appName"
            type="text"
            value={form.appName}
            placeholder="Zentra UK"
            onChange={(event) =>
              updateField(
                "appName",
                event.target.value
              )
            }
            required
            className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm outline-none focus:border-white/30"
          />
        </div>

        <div>
          <label
            htmlFor="logoUrl"
            className="mb-2 block text-sm font-medium"
          >
            Logo URL
          </label>

          <input
            id="logoUrl"
            type="url"
            value={form.logoUrl}
            placeholder="https://cdn.example.com/logo.svg"
            onChange={(event) =>
              updateField(
                "logoUrl",
                event.target.value
              )
            }
            className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm outline-none focus:border-white/30"
          />
        </div>

        <div>
          <label
            htmlFor="planCode"
            className="mb-2 block text-sm font-medium"
          >
            Subscription plan
          </label>

          <select
            id="planCode"
            value={form.planCode}
            onChange={(event) =>
              updateField(
                "planCode",
                event.target.value
              )
            }
            required
            className="h-12 w-full rounded-xl border border-white/10 bg-black px-4 text-sm outline-none focus:border-white/30"
          >
            <option value="bronze">
              Bronze
            </option>

            <option value="gold">
              Gold
            </option>

            <option value="diamond">
              Diamond
            </option>
          </select>
        </div>

        <div>
          <label
            htmlFor="primaryColor"
            className="mb-2 block text-sm font-medium"
          >
            Primary colour
          </label>

          <div className="flex h-12 items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3">
            <input
              id="primaryColor"
              type="color"
              value={form.primaryColor}
              onChange={(event) =>
                updateField(
                  "primaryColor",
                  event.target.value
                )
              }
              className="h-8 w-10 cursor-pointer border-0 bg-transparent"
            />

            <input
              value={form.primaryColor}
              onChange={(event) =>
                updateField(
                  "primaryColor",
                  event.target.value
                )
              }
              pattern="^#[0-9A-Fa-f]{6}$"
              required
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="ownerFirstName"
            className="mb-2 block text-sm font-medium"
          >
            Owner first name
          </label>

          <input
            id="ownerFirstName"
            type="text"
            value={form.ownerFirstName}
            onChange={(event) =>
              updateField(
                "ownerFirstName",
                event.target.value
              )
            }
            required
            className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm outline-none focus:border-white/30"
          />
        </div>

        <div>
          <label
            htmlFor="ownerLastName"
            className="mb-2 block text-sm font-medium"
          >
            Owner last name
          </label>

          <input
            id="ownerLastName"
            type="text"
            value={form.ownerLastName}
            onChange={(event) =>
              updateField(
                "ownerLastName",
                event.target.value
              )
            }
            required
            className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm outline-none focus:border-white/30"
          />
        </div>

        <div>
          <label
            htmlFor="ownerEmail"
            className="mb-2 block text-sm font-medium"
          >
            Owner email
          </label>

          <input
            id="ownerEmail"
            type="email"
            autoComplete="email"
            value={form.ownerEmail}
            onChange={(event) =>
              updateField(
                "ownerEmail",
                event.target.value
              )
            }
            required
            className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm outline-none focus:border-white/30"
          />
        </div>

        <div>
          <label
            htmlFor="ownerPassword"
            className="mb-2 block text-sm font-medium"
          >
            Initial owner password
          </label>

          <input
            id="ownerPassword"
            type="password"
            autoComplete="new-password"
            minLength={12}
            maxLength={128}
            value={form.ownerPassword}
            onChange={(event) =>
              updateField(
                "ownerPassword",
                event.target.value
              )
            }
            required
            className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm outline-none focus:border-white/30"
          />

          <p className="mt-2 text-xs text-neutral-500">
            Minimum 12 characters.
          </p>
        </div>
      </div>

      {error && (
        <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="h-12 rounded-xl bg-white px-6 font-semibold text-black disabled:opacity-60"
        >
          {isSubmitting
            ? "Creating tenant…"
            : "Create tenant"}
        </button>
      </div>
    </form>
  );
}