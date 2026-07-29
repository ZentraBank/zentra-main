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
  planId: "",
  ownerFirstName: "",
  ownerLastName: "",
  ownerEmail: "",
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
          ...form,
          code: form.code
            .trim()
            .toUpperCase(),
          logoUrl:
            form.logoUrl.trim() || undefined,
        });

      router.push(
        `/tenants/${response.data.tenantId}`
      );
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "Unable to create tenant."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const fields: Array<{
    key: keyof typeof form;
    label: string;
    type?: string;
    placeholder?: string;
  }> = [
    {
      key: "code",
      label: "Tenant code",
      placeholder: "ZENTRA_UK",
    },
    {
      key: "name",
      label: "Legal or organisation name",
      placeholder: "ZentraBank UK Limited",
    },
    {
      key: "appName",
      label: "Application name",
      placeholder: "Zentra UK",
    },
    {
      key: "logoUrl",
      label: "Logo URL",
      type: "url",
      placeholder:
        "https://cdn.example.com/logo.svg",
    },
    {
      key: "planId",
      label: "Subscription plan ID",
      placeholder: "Plan UUID",
    },
    {
      key: "ownerFirstName",
      label: "Owner first name",
    },
    {
      key: "ownerLastName",
      label: "Owner last name",
    },
    {
      key: "ownerEmail",
      label: "Owner email",
      type: "email",
    },
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div className="grid gap-5 md:grid-cols-2">
        {fields.map((field) => (
          <div key={field.key}>
            <label
              htmlFor={field.key}
              className="mb-2 block text-sm font-medium"
            >
              {field.label}
            </label>

            <input
              id={field.key}
              type={field.type || "text"}
              value={form[field.key]}
              placeholder={field.placeholder}
              onChange={(event) =>
                updateField(
                  field.key,
                  event.target.value
                )
              }
              required={field.key !== "logoUrl"}
              className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm outline-none focus:border-white/30"
            />
          </div>
        ))}

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
