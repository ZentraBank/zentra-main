"use client";

import {
  FormEvent,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { ApiError } from "@/src/lib/api-error";
import { platformSubscriptionsService } from "@/src/services/platform-subscriptions.service";
import type {
  BillingInterval,
  SubscriptionPlanStatus,
} from "@/src/types/subscription";

export function CreatePlanForm() {
  const router = useRouter();

  const [form, setForm] = useState({
    code: "",
    name: "",
    description: "",
    billingInterval:
      "monthly" as BillingInterval,
    price: "0",
    currency: "USD",
    status:
      "draft" as SubscriptionPlanStatus,
    isPublic: false,
  });

  const [features, setFeatures] = useState<
    Array<{
      featureCode: string;
      isEnabled: boolean;
      usageLimit: string;
    }>
  >([]);

  const [error, setError] =
    useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const addFeature = () => {
    setFeatures((current) => [
      ...current,
      {
        featureCode: "",
        isEnabled: true,
        usageLimit: "",
      },
    ]);
  };

  const submit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response =
        await platformSubscriptionsService.createPlan({
          ...form,
          code: form.code
            .trim()
            .toUpperCase(),
          price: Number(form.price),
          features: features
            .filter(
              (feature) =>
                feature.featureCode.trim()
            )
            .map((feature) => ({
              featureCode:
                feature.featureCode.trim(),
              isEnabled:
                feature.isEnabled,
              usageLimit:
                feature.usageLimit === ""
                  ? null
                  : Number(
                      feature.usageLimit
                    ),
            })),
        });

      router.push(
        `/subscriptions/plans/${response.data.id}`
      );
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "Unable to create plan."
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
          value={form.code}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              code: event.target.value,
            }))
          }
          placeholder="PLAN_CODE"
          required
          className="h-12 rounded-xl border border-white/10 bg-white/5 px-4"
        />

        <input
          value={form.name}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              name: event.target.value,
            }))
          }
          placeholder="Plan name"
          required
          className="h-12 rounded-xl border border-white/10 bg-white/5 px-4"
        />

        <select
          value={form.billingInterval}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              billingInterval:
                event.target.value as BillingInterval,
            }))
          }
          className="h-12 rounded-xl border border-white/10 bg-neutral-900 px-4"
        >
          <option value="monthly">
            Monthly
          </option>
          <option value="quarterly">
            Quarterly
          </option>
          <option value="annually">
            Annually
          </option>
          <option value="custom">
            Custom
          </option>
        </select>

        <input
          type="number"
          min="0"
          step="0.01"
          value={form.price}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              price: event.target.value,
            }))
          }
          placeholder="Price"
          required
          className="h-12 rounded-xl border border-white/10 bg-white/5 px-4"
        />

        <input
          value={form.currency}
          maxLength={3}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              currency:
                event.target.value.toUpperCase(),
            }))
          }
          placeholder="USD"
          required
          className="h-12 rounded-xl border border-white/10 bg-white/5 px-4"
        />

        <select
          value={form.status}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              status:
                event.target.value as SubscriptionPlanStatus,
            }))
          }
          className="h-12 rounded-xl border border-white/10 bg-neutral-900 px-4"
        >
          <option value="draft">
            Draft
          </option>
          <option value="active">
            Active
          </option>
          <option value="inactive">
            Inactive
          </option>
          <option value="retired">
            Retired
          </option>
        </select>
      </div>

      <textarea
        value={form.description}
        onChange={(event) =>
          setForm((current) => ({
            ...current,
            description:
              event.target.value,
          }))
        }
        placeholder="Plan description"
        rows={4}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3"
      />

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={form.isPublic}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              isPublic:
                event.target.checked,
            }))
          }
        />
        <span className="text-sm">
          Publicly visible plan
        </span>
      </label>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Features
          </h2>

          <button
            type="button"
            onClick={addFeature}
            className="rounded-lg border border-white/10 px-3 py-2 text-sm"
          >
            Add feature
          </button>
        </div>

        {features.map((feature, index) => (
          <div
            key={index}
            className="grid gap-3 rounded-xl border border-white/10 p-4 md:grid-cols-[1fr_160px_100px]"
          >
            <input
              value={feature.featureCode}
              onChange={(event) =>
                setFeatures((current) =>
                  current.map(
                    (item, itemIndex) =>
                      itemIndex === index
                        ? {
                            ...item,
                            featureCode:
                              event.target.value,
                          }
                        : item
                  )
                )
              }
              placeholder="feature_code"
              className="h-11 rounded-lg border border-white/10 bg-white/5 px-3"
            />

            <input
              type="number"
              min="0"
              value={feature.usageLimit}
              onChange={(event) =>
                setFeatures((current) =>
                  current.map(
                    (item, itemIndex) =>
                      itemIndex === index
                        ? {
                            ...item,
                            usageLimit:
                              event.target.value,
                          }
                        : item
                  )
                )
              }
              placeholder="Usage limit"
              className="h-11 rounded-lg border border-white/10 bg-white/5 px-3"
            />

            <label className="flex items-center justify-center gap-2">
              <input
                type="checkbox"
                checked={feature.isEnabled}
                onChange={(event) =>
                  setFeatures((current) =>
                    current.map(
                      (
                        item,
                        itemIndex
                      ) =>
                        itemIndex === index
                          ? {
                              ...item,
                              isEnabled:
                                event.target
                                  .checked,
                            }
                          : item
                    )
                  )
                }
              />
              Enabled
            </label>
          </div>
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-300">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-xl bg-white px-6 py-3 font-semibold text-black disabled:opacity-60"
      >
        {isSubmitting
          ? "Creating plan…"
          : "Create plan"}
      </button>
    </form>
  );
}
