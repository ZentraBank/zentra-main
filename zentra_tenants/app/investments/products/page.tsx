"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Edit3,
  Loader2,
  Plus,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  X,
} from "lucide-react";
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  investmentService,
} from "@/services/investment.service";

import type {
  CreateInvestmentProductInput,
  TenantInvestmentProduct,
} from "@/services/investment.service";

type ProductFormState = {
  name: string;
  description: string;
  currency: string;
  minimumAmount: string;
  maximumAmount: string;
  annualRate: string;
  durationDays: string;
  payoutType: string;
  riskLevel: string;
  status: "active" | "inactive";
};

const emptyForm: ProductFormState = {
  name: "",
  description: "",
  currency: "USD",
  minimumAmount: "",
  maximumAmount: "",
  annualRate: "",
  durationDays: "",
  payoutType: "at_maturity",
  riskLevel: "low",
  status: "active",
};

export default function InvestmentProductsPage() {
  const [products, setProducts] =
    useState<TenantInvestmentProduct[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [formOpen, setFormOpen] =
    useState(false);

  const [editingProductId, setEditingProductId] =
    useState<string | null>(null);

  const [form, setForm] =
    useState<ProductFormState>(emptyForm);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result =
        await investmentService.listProducts({
          page: 1,
          pageSize: 100,
        });

      setProducts(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load investment products.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const activeProducts =
    useMemo(
      () =>
        products.filter(
          (product) =>
            product.status === "active",
        ).length,
      [products],
    );

  const resetForm = () => {
    setForm(emptyForm);
    setEditingProductId(null);
    setFormOpen(false);
  };

  const openCreate = () => {
    setSuccess("");
    setError("");
    setEditingProductId(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (
    product: TenantInvestmentProduct,
  ) => {
    setSuccess("");
    setError("");

    setEditingProductId(product.id);

    setForm({
      name: product.name,
      description:
        product.description ?? "",
      currency:
        product.currency,
      minimumAmount:
        String(product.minimum_amount),
      maximumAmount:
        product.maximum_amount === null
          ? ""
          : String(product.maximum_amount),
      annualRate:
        String(product.annual_rate),
      durationDays:
        String(product.duration_days),
      payoutType:
        product.payout_type,
      riskLevel:
        product.risk_level,
      status:
        product.status === "inactive"
          ? "inactive"
          : "active",
    });

    setFormOpen(true);
  };

  const handleSubmit =
    async (
      event: FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      setError("");
      setSuccess("");

      const minimumAmount =
        Number(form.minimumAmount);

      const maximumAmount =
        form.maximumAmount.trim()
          ? Number(form.maximumAmount)
          : null;

      const annualRate =
        Number(form.annualRate);

      const durationDays =
        Number(form.durationDays);

      if (!form.name.trim()) {
        setError(
          "Product name is required.",
        );
        return;
      }

      if (
        !Number.isFinite(minimumAmount) ||
        minimumAmount <= 0
      ) {
        setError(
          "Minimum amount must be greater than zero.",
        );
        return;
      }

      if (
        maximumAmount !== null &&
        (
          !Number.isFinite(maximumAmount) ||
          maximumAmount < minimumAmount
        )
      ) {
        setError(
          "Maximum amount must be greater than or equal to the minimum amount.",
        );
        return;
      }

      if (
        !Number.isFinite(annualRate) ||
        annualRate < 0
      ) {
        setError(
          "Annual rate must be zero or greater.",
        );
        return;
      }

      if (
        !Number.isFinite(durationDays) ||
        durationDays <= 0
      ) {
        setError(
          "Duration must be greater than zero.",
        );
        return;
      }

      const payload: CreateInvestmentProductInput = {
        name: form.name.trim(),
        description:
          form.description.trim() ||
          undefined,
        currency:
          form.currency.trim().toUpperCase(),
        minimumAmount,
        maximumAmount,
        annualRate,
        durationDays,
        payoutType:
          form.payoutType,
        riskLevel:
          form.riskLevel,
        status:
          form.status,
      };

      setSaving(true);

      try {
        if (editingProductId) {
          await investmentService.updateProduct(
            editingProductId,
            payload,
          );

          setSuccess(
            "Investment product updated successfully.",
          );
        } else {
          await investmentService.createProduct(
            payload,
          );

          setSuccess(
            "Investment product created successfully.",
          );
        }

        resetForm();
        await load();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to save investment product.",
        );
      } finally {
        setSaving(false);
      }
    };

  return (
    <main className="min-h-screen bg-[#F4F6F8] px-5 pb-14 pt-8 text-[#2A2A2A]">
      <section className="mx-auto w-full max-w-[1180px]">
        <header className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/investments"
              className="grid h-9 w-9 place-items-center rounded-full bg-white text-black/55 shadow-sm"
            >
              <ArrowLeft size={18} />
            </Link>

            <div>
              <h1 className="text-[25px] font-black tracking-[-0.035em]">
                Investment Products
              </h1>

              <p className="mt-1 text-[11px] text-black/40">
                Create and manage the products available to clients.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void load()}
              className="flex h-[42px] items-center gap-2 rounded-[10px] border border-black/10 bg-white px-4 text-[11px] font-bold"
            >
              <RefreshCw size={14} />
              Refresh
            </button>

            <button
              type="button"
              onClick={openCreate}
              className="flex h-[42px] items-center gap-2 rounded-[10px] bg-[#2458E8] px-4 text-[11px] font-bold text-white"
            >
              <Plus size={15} />
              New Product
            </button>
          </div>
        </header>

        {error && (
          <div className="mt-6 rounded-[12px] border border-red-100 bg-red-50 px-4 py-3 text-[11px] text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-6 flex items-center gap-3 rounded-[12px] border border-green-100 bg-green-50 px-4 py-3 text-[11px] text-green-700">
            <CheckCircle2 size={16} />
            {success}
          </div>
        )}

        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          <Summary
            label="Total Products"
            value={String(products.length)}
          />

          <Summary
            label="Active Products"
            value={String(activeProducts)}
            positive
          />

          <Summary
            label="Inactive Products"
            value={String(
              products.length -
                activeProducts,
            )}
          />
        </div>

        {loading ? (
          <div className="mt-7 grid min-h-[340px] place-items-center rounded-[20px] bg-white">
            <Loader2
              size={30}
              className="animate-spin text-[#2458E8]"
            />
          </div>
        ) : products.length === 0 ? (
          <div className="mt-7 grid min-h-[340px] place-items-center rounded-[20px] border border-dashed border-black/10 bg-white">
            <div className="text-center">
              <TrendingUp
                size={35}
                className="mx-auto text-[#2458E8]"
              />

              <p className="mt-4 text-[14px] font-black">
                No investment products yet
              </p>

              <button
                type="button"
                onClick={openCreate}
                className="mt-4 rounded-[9px] bg-[#2458E8] px-4 py-2 text-[10px] font-bold text-white"
              >
                Create First Product
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {products.map(
              (product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onEdit={() =>
                    openEdit(product)
                  }
                />
              ),
            )}
          </div>
        )}

        {formOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-8">
            <form
              onSubmit={handleSubmit}
              className="w-full max-w-[620px] rounded-[22px] bg-white p-5 shadow-2xl md:p-7"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-black/30">
                    {editingProductId
                      ? "Edit Product"
                      : "New Product"}
                  </p>

                  <h2 className="mt-1 text-[21px] font-black">
                    {editingProductId
                      ? "Update Investment Product"
                      : "Create Investment Product"}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={resetForm}
                  className="grid h-9 w-9 place-items-center rounded-full bg-[#F4F6F8]"
                >
                  <X size={17} />
                </button>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <InputField
                  label="Product Name"
                  value={form.name}
                  onChange={(value) =>
                    setForm(
                      (current) => ({
                        ...current,
                        name: value,
                      }),
                    )
                  }
                  placeholder="Fixed Growth Plan"
                />

                <InputField
                  label="Currency"
                  value={form.currency}
                  onChange={(value) =>
                    setForm(
                      (current) => ({
                        ...current,
                        currency:
                          value.toUpperCase(),
                      }),
                    )
                  }
                  placeholder="USD"
                />

                <InputField
                  label="Minimum Amount"
                  type="number"
                  value={form.minimumAmount}
                  onChange={(value) =>
                    setForm(
                      (current) => ({
                        ...current,
                        minimumAmount:
                          value,
                      }),
                    )
                  }
                  placeholder="1000"
                />

                <InputField
                  label="Maximum Amount"
                  type="number"
                  value={form.maximumAmount}
                  onChange={(value) =>
                    setForm(
                      (current) => ({
                        ...current,
                        maximumAmount:
                          value,
                      }),
                    )
                  }
                  placeholder="Optional"
                />

                <InputField
                  label="Annual Rate (%)"
                  type="number"
                  value={form.annualRate}
                  onChange={(value) =>
                    setForm(
                      (current) => ({
                        ...current,
                        annualRate:
                          value,
                      }),
                    )
                  }
                  placeholder="8.5"
                />

                <InputField
                  label="Duration (Days)"
                  type="number"
                  value={form.durationDays}
                  onChange={(value) =>
                    setForm(
                      (current) => ({
                        ...current,
                        durationDays:
                          value,
                      }),
                    )
                  }
                  placeholder="365"
                />

                <SelectField
                  label="Payout Type"
                  value={form.payoutType}
                  onChange={(value) =>
                    setForm(
                      (current) => ({
                        ...current,
                        payoutType:
                          value,
                      }),
                    )
                  }
                  options={[
                    [
                      "at_maturity",
                      "At Maturity",
                    ],
                    [
                      "monthly",
                      "Monthly",
                    ],
                    [
                      "quarterly",
                      "Quarterly",
                    ],
                  ]}
                />

                <SelectField
                  label="Risk Level"
                  value={form.riskLevel}
                  onChange={(value) =>
                    setForm(
                      (current) => ({
                        ...current,
                        riskLevel:
                          value,
                      }),
                    )
                  }
                  options={[
                    ["low", "Low"],
                    [
                      "medium",
                      "Medium",
                    ],
                    ["high", "High"],
                  ]}
                />

                <SelectField
                  label="Status"
                  value={form.status}
                  onChange={(value) =>
                    setForm(
                      (current) => ({
                        ...current,
                        status:
                          value as
                            | "active"
                            | "inactive",
                      }),
                    )
                  }
                  options={[
                    [
                      "active",
                      "Active",
                    ],
                    [
                      "inactive",
                      "Inactive",
                    ],
                  ]}
                />
              </div>

              <div className="mt-4">
                <label className="text-[9px] font-black uppercase tracking-[0.05em] text-black/40">
                  Description
                </label>

                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm(
                      (current) => ({
                        ...current,
                        description:
                          event.target.value,
                      }),
                    )
                  }
                  maxLength={2000}
                  placeholder="Describe the investment product..."
                  className="mt-2 h-[110px] w-full resize-none rounded-[11px] border border-black/10 px-4 py-3 text-[11px] outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="mt-6 flex h-[46px] w-full items-center justify-center gap-2 rounded-[11px] bg-[#2458E8] text-[11px] font-bold text-white disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2
                      size={15}
                      className="animate-spin"
                    />

                    Saving...
                  </>
                ) : editingProductId ? (
                  <>
                    <Edit3 size={15} />
                    Update Product
                  </>
                ) : (
                  <>
                    <Plus size={15} />
                    Create Product
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </section>
    </main>
  );
}

function ProductCard({
  product,
  onEdit,
}: {
  product: TenantInvestmentProduct;
  onEdit: () => void;
}) {
  return (
    <article className="overflow-hidden rounded-[18px] bg-white shadow-sm">
      <div className="bg-gradient-to-br from-[#EAF9F0] to-[#D7F1E2] px-5 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.07em] text-[#16884B]/55">
              Investment Product
            </p>

            <h2 className="mt-1 text-[17px] font-black">
              {product.name}
            </h2>
          </div>

          <StatusBadge
            status={product.status}
          />
        </div>

        {product.description && (
          <p className="mt-3 line-clamp-2 text-[10px] leading-4 text-black/45">
            {product.description}
          </p>
        )}

        <div className="mt-5 grid grid-cols-3 gap-2">
          <SmallMetric
            icon={
              <TrendingUp
                size={13}
              />
            }
            label="Rate"
            value={`${formatNumber(
              product.annual_rate,
            )}%`}
          />

          <SmallMetric
            icon={
              <Clock3 size={13} />
            }
            label="Duration"
            value={formatDuration(
              product.duration_days,
            )}
          />

          <SmallMetric
            icon={
              <ShieldCheck
                size={13}
              />
            }
            label="Risk"
            value={product.risk_level}
          />
        </div>
      </div>

      <div className="px-5 py-4">
        <Detail
          label="Minimum"
          value={formatMoney(
            product.minimum_amount,
            product.currency,
          )}
        />

        <Detail
          label="Maximum"
          value={
            product.maximum_amount
              ? formatMoney(
                  product.maximum_amount,
                  product.currency,
                )
              : "No maximum"
          }
        />

        <Detail
          label="Payout"
          value={product.payout_type.replaceAll(
            "_",
            " ",
          )}
        />

        <button
          type="button"
          onClick={onEdit}
          className="mt-5 flex h-[40px] w-full items-center justify-center gap-2 rounded-[10px] border border-[#2458E8]/15 bg-[#EEF3FF] text-[10px] font-bold text-[#2458E8]"
        >
          <Edit3 size={14} />
          Edit Product
        </button>
      </div>
    </article>
  );
}

function Summary({
  label,
  value,
  positive = false,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-[15px] bg-white px-4 py-4 shadow-sm">
      <p className="text-[9px] font-bold uppercase tracking-[0.05em] text-black/30">
        {label}
      </p>

      <p
        className={`mt-2 text-[20px] font-black ${
          positive
            ? "text-[#16884B]"
            : "text-[#333]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="text-[9px] font-black uppercase tracking-[0.05em] text-black/40">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="mt-2 h-[46px] w-full rounded-[11px] border border-black/10 px-4 text-[11px] outline-none"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly (
    readonly [
      string,
      string,
    ]
  )[];
}) {
  return (
    <div>
      <label className="text-[9px] font-black uppercase tracking-[0.05em] text-black/40">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="mt-2 h-[46px] w-full rounded-[11px] border border-black/10 bg-white px-4 text-[11px] font-semibold outline-none"
      >
        {options.map(
          ([value, label]) => (
            <option
              key={value}
              value={value}
            >
              {label}
            </option>
          ),
        )}
      </select>
    </div>
  );
}

function SmallMetric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[10px] bg-white/70 px-2 py-3">
      <div className="flex items-center gap-1 text-[#16884B]">
        {icon}

        <p className="text-[7px] font-bold uppercase">
          {label}
        </p>
      </div>

      <p className="mt-2 truncate text-[10px] font-black capitalize">
        {value}
      </p>
    </div>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="mt-3 flex items-center justify-between gap-4 first:mt-0">
      <p className="text-[9px] text-black/35">
        {label}
      </p>

      <p className="text-right text-[10px] font-bold capitalize">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[8px] font-black uppercase ${
        status === "active"
          ? "bg-green-50 text-green-700"
          : "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
}

function formatMoney(
  amount:
    | string
    | number,
  currency: string,
) {
  const numeric =
    Number(amount);

  try {
    return new Intl.NumberFormat(
      "en",
      {
        style:
          "currency",
        currency,
        maximumFractionDigits:
          2,
      },
    ).format(
      Number.isFinite(numeric)
        ? numeric
        : 0,
    );
  } catch {
    return `${currency} ${
      Number.isFinite(numeric)
        ? numeric.toLocaleString()
        : "0"
    }`;
  }
}

function formatNumber(
  value:
    | string
    | number,
) {
  const numeric =
    Number(value);

  return Number.isFinite(numeric)
    ? numeric.toFixed(2)
    : "0.00";
}

function formatDuration(
  days: number,
) {
  if (
    days >= 365 &&
    days % 365 === 0
  ) {
    const years =
      days / 365;

    return `${years} ${
      years === 1
        ? "year"
        : "years"
    }`;
  }

  if (
    days >= 30 &&
    days % 30 === 0
  ) {
    const months =
      days / 30;

    return `${months} ${
      months === 1
        ? "month"
        : "months"
    }`;
  }

  return `${days} days`;
}