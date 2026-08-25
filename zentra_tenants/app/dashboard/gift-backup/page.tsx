"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Loader2,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

const currencies = [
  { label: "$", value: "USD" },
  { label: "£", value: "GBP" },
  { label: "€", value: "EUR" },
  { label: "C$", value: "CAD" },
  { label: "A$", value: "AUD" },
  { label: "¥", value: "JPY" },
];

const days = Array.from({ length: 31 }, (_, index) => String(index + 1));
const months = [
  { label: "Jan", value: "01" },
  { label: "Feb", value: "02" },
  { label: "Mar", value: "03" },
  { label: "Apr", value: "04" },
  { label: "May", value: "05" },
  { label: "Jun", value: "06" },
  { label: "Jul", value: "07" },
  { label: "Aug", value: "08" },
  { label: "Sep", value: "09" },
  { label: "Oct", value: "10" },
  { label: "Nov", value: "11" },
  { label: "Dec", value: "12" },
];
const years = Array.from({ length: 11 }, (_, index) => String(2024 + index));
const hours = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, "0"));
const minutesAndSeconds = ["00", "15", "30", "45"];

const initialForm = {
  transactionType: "",
  accountStatus: "",
  availableBalance: "",
  accountNumber: "",
  currency: "USD",
  amount: "",
  transactionStatus: "",
  senderName: "",
  bankType: "",
  bankAccountStatus: "",
  dateDay: "",
  dateMonth: "",
  dateYear: "",
  secondaryAvailableBalance: "",
  timeHour: "",
  timeMinute: "",
  timeSecond: "",
  fee: "",
  transactionId: "",
  customerCarePrimary: "",
  customerCareCountry: "",
  customerCareSecondary: "",
  paymentMethod: "",
  paymentDateDay: "",
  paymentDateMonth: "",
  paymentDateYear: "",
  authorizationCode: "",
  bankAddress: "",
};

type GiftForm = typeof initialForm;
type FieldName = keyof GiftForm;

type SelectOption = string | { label: string; value: string };

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1 mt-2 block text-[11px] font-semibold text-gray-700">
      {children}
    </label>
  );
}

function TextInput({
  name,
  value,
  placeholder,
  onChange,
  type = "text",
  required = false,
}: {
  name: FieldName;
  value: string;
  placeholder: string;
  onChange: (name: FieldName, value: string) => void;
  type?: "text" | "number" | "tel";
  required?: boolean;
}) {
  return (
    <input
      name={name}
      value={value}
      type={type}
      required={required}
      placeholder={placeholder}
      onChange={(event) => onChange(name, event.target.value)}
      className="h-[31px] w-full rounded-md bg-white px-2 text-[13px] text-black outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-[#2447d8]/40"
    />
  );
}

function SelectBox({
  name,
  value,
  options,
  placeholder,
  onChange,
  required = false,
}: {
  name: FieldName;
  value: string;
  options: SelectOption[];
  placeholder: string;
  onChange: (name: FieldName, value: string) => void;
  required?: boolean;
}) {
  return (
    <select
      name={name}
      value={value}
      required={required}
      onChange={(event) => onChange(name, event.target.value)}
      className="h-[31px] w-full rounded-lg bg-white px-2 text-[12px] text-gray-700 outline-none focus:ring-2 focus:ring-[#2447d8]/40"
    >
      <option value="">{placeholder}</option>
      {options.map((option) => {
        const label = typeof option === "string" ? option : option.label;
        const optionValue = typeof option === "string" ? option : option.value;
        return (
          <option key={optionValue} value={optionValue}>
            {label}
          </option>
        );
      })}
    </select>
  );
}

function OptionGroup({
  title,
  name,
  value,
  options,
  onChange,
}: {
  title: string;
  name: FieldName;
  value: string;
  options: string[];
  onChange: (name: FieldName, value: string) => void;
}) {
  return (
    <div className="rounded-2xl bg-[#f1f1f1] p-3">
      <div className="mb-3 flex items-center justify-between text-[12px] font-medium text-black">
        <span>{title}</span>
        <ChevronDown size={14} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => {
          const selected = value === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(name, option)}
              className={`min-h-[32px] rounded-xl px-3 text-[11px] font-medium transition-all duration-200 ${
                selected
                  ? "!bg-[#2447d8] !text-white shadow-[0_0_12px_rgba(36,71,216,0.35)]"
                  : "!bg-white !text-black hover:!bg-[#eef4ff]"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function GiftPage() {
  const [form, setForm] = useState<GiftForm>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingClient, setIsSavingClient] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const updateField = (name: FieldName, value: string) => {
    setForm((current) => ({ ...current, [name]: value }));
    setMessage("");
    setError("");
  };

  const saveClient = async () => {
    if (form.accountNumber.trim().length < 6) {
      setError("Enter a valid account number before saving the client.");
      return;
    }

    setIsSavingClient(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/api/clients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountNumber: form.accountNumber.trim() }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.message ?? "Unable to save client.");
      }

      setMessage("Client saved successfully.");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "Unable to save client.",
      );
    } finally {
      setIsSavingClient(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!form.transactionType || !form.accountStatus || !form.transactionStatus) {
      setError("Select the required transaction options.");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      ...form,
      amount: Number(form.amount.replace(/,/g, "")),
      fee: form.fee ? Number(form.fee.replace("%", "")) : 0,
      transactionDate:
        form.dateYear && form.dateMonth && form.dateDay
          ? `${form.dateYear}-${form.dateMonth}-${form.dateDay.padStart(2, "0")}`
          : null,
      transactionTime:
        form.timeHour && form.timeMinute && form.timeSecond
          ? `${form.timeHour}:${form.timeMinute}:${form.timeSecond}`
          : null,
      paymentDate:
        form.paymentDateYear && form.paymentDateMonth && form.paymentDateDay
          ? `${form.paymentDateYear}-${form.paymentDateMonth}-${form.paymentDateDay.padStart(2, "0")}`
          : null,
    };

    try {
      const response = await fetch(`${API_URL}/api/gifts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.message ?? "Unable to create gift transaction.");
      }

      setMessage(result.message ?? "Gift transaction created successfully.");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to create gift transaction.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main
      className="min-h-screen bg-cover bg-center bg-no-repeat text-white"
      style={{ backgroundImage: "url('/images/Background_1.png')" }}
    >
      <div className="mx-auto min-h-screen w-full max-w-[430px] px-3 pb-10 pt-8 md:max-w-[900px] md:px-8 lg:max-w-[1180px]">
        <Link href="/dashboard" className="mb-5 inline-flex text-white">
          <ArrowLeft size={18} />
        </Link>

        <h1 className="mb-8 text-center text-[18px] font-bold md:text-2xl">
          Send Gift
        </h1>

        <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2 md:gap-5 lg:grid-cols-3">
          <section className="rounded-lg bg-[#a8a8a8] p-3">
            <OptionGroup
              title="Transaction type"
              name="transactionType"
              value={form.transactionType}
              options={["IntraBank", "InterBank", "International"]}
              onChange={updateField}
            />

            <div className="mt-3">
              <OptionGroup
                title="Current account status"
                name="accountStatus"
                value={form.accountStatus}
                options={["Verified!", "Unverified", "Pending verification"]}
                onChange={updateField}
              />
            </div>

            <FieldLabel>Available Balance</FieldLabel>
            <TextInput
              name="availableBalance"
              value={form.availableBalance}
              placeholder="$XXX,XXX.XX"
              onChange={updateField}
            />
          </section>

          <section className="rounded-lg border-[3px] border-white bg-[#d40000] p-3 shadow-[0_0_0_2px_#ff0000]">
            <label className="mb-2 block text-[12px] font-bold">Account number</label>
            <div className="flex min-h-[44px] items-center gap-2 rounded-md bg-[#b9c4c7] px-2">
              <input
                value={form.accountNumber}
                onChange={(event) => updateField("accountNumber", event.target.value)}
                inputMode="numeric"
                placeholder="XXX XXX XXXX"
                className="min-w-0 flex-1 bg-transparent text-[17px] text-black outline-none placeholder:text-black/70"
              />
              <button
                type="button"
                onClick={saveClient}
                disabled={isSavingClient}
                className="inline-flex h-8 shrink-0 items-center justify-center rounded-full !bg-[#60A5FA] px-4 text-[11px] text-white transition hover:!bg-[#1E40AF] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSavingClient ? <Loader2 size={14} className="animate-spin" /> : "Save client"}
              </button>
            </div>
          </section>

          <section className="relative overflow-hidden rounded-xl border-2 border-white bg-[linear-gradient(145deg,#157000_0%,#8a4a00_35%,#e00000_70%,#0f6b00_100%)] p-4">
            <p className="text-[12px] font-bold">Bank</p>
            <div className="mt-4 flex justify-center">
              <Image
                src="/images/zentra.png"
                alt="ZentraBank Transfer"
                width={340}
                height={110}
                className="h-auto w-[170px] object-contain md:w-[220px]"
                priority
              />
            </div>
          </section>

          <section className="rounded-lg bg-[#a8a8a8] p-3">
            <label className="mb-2 block text-center text-[12px] font-bold">Amount</label>
            <div className="flex gap-2">
              <select
                value={form.currency}
                onChange={(event) => updateField("currency", event.target.value)}
                className="h-[31px] w-[64px] rounded-lg bg-white px-2 text-[12px] text-gray-700 outline-none"
              >
                {currencies.map((currency) => (
                  <option key={currency.value} value={currency.value}>
                    {currency.label}
                  </option>
                ))}
              </select>
              <TextInput
                name="amount"
                value={form.amount}
                type="number"
                required
                placeholder="e.g. 50000"
                onChange={updateField}
              />
            </div>

            <p className="mt-1 text-right text-[10px] text-white">
              Balance: {form.availableBalance || "$50,000,000"}
            </p>

            <div className="mt-3">
              <OptionGroup
                title="Transaction status"
                name="transactionStatus"
                value={form.transactionStatus}
                options={["Pending", "Successful", "Reversed"]}
                onChange={updateField}
              />
            </div>

            <FieldLabel>Coming from</FieldLabel>
            <TextInput
              name="senderName"
              value={form.senderName}
              required
              placeholder="Sender's name"
              onChange={updateField}
            />
          </section>

          <section className="rounded-lg bg-[#a8a8a8] p-3">
            <OptionGroup
              title="Bank type"
              name="bankType"
              value={form.bankType}
              options={["IntraBank", "InterBank", "International"]}
              onChange={updateField}
            />

            <div className="mt-3">
              <OptionGroup
                title="Current account status"
                name="bankAccountStatus"
                value={form.bankAccountStatus}
                options={["Verified!", "Unverified", "Pending verification"]}
                onChange={updateField}
              />
            </div>

            <FieldLabel>Transaction date</FieldLabel>
            <div className="grid grid-cols-3 gap-1">
              <SelectBox name="dateDay" value={form.dateDay} options={days} placeholder="Day" onChange={updateField} />
              <SelectBox name="dateMonth" value={form.dateMonth} options={months} placeholder="Month" onChange={updateField} />
              <SelectBox name="dateYear" value={form.dateYear} options={years} placeholder="Year" onChange={updateField} />
            </div>

            <FieldLabel>Available Balance</FieldLabel>
            <TextInput
              name="secondaryAvailableBalance"
              value={form.secondaryAvailableBalance}
              placeholder="$5,001,234.56"
              onChange={updateField}
            />
          </section>

          <section className="rounded-lg bg-[#a8a8a8] p-3">
            <FieldLabel>Set transaction time</FieldLabel>
            <div className="grid grid-cols-3 gap-1">
              <SelectBox name="timeHour" value={form.timeHour} options={hours} placeholder="Hour" onChange={updateField} />
              <SelectBox name="timeMinute" value={form.timeMinute} options={minutesAndSeconds} placeholder="Minute" onChange={updateField} />
              <SelectBox name="timeSecond" value={form.timeSecond} options={minutesAndSeconds} placeholder="Seconds" onChange={updateField} />
            </div>

            <FieldLabel>Fee (%)</FieldLabel>
            <TextInput name="fee" value={form.fee} type="number" placeholder="10" onChange={updateField} />

            <FieldLabel>Transaction ID</FieldLabel>
            <TextInput
              name="transactionId"
              value={form.transactionId}
              required
              placeholder="98234723948"
              onChange={updateField}
            />
          </section>

          <section className="rounded-lg bg-[#a8a8a8] p-3">
            <FieldLabel>Customer care line</FieldLabel>
            <TextInput
              name="customerCarePrimary"
              value={form.customerCarePrimary}
              type="tel"
              placeholder="+1 800 000 0000"
              onChange={updateField}
            />

            <FieldLabel>Alternative customer care line</FieldLabel>
            <div className="grid grid-cols-[1fr_1.6fr] gap-1">
              <SelectBox
                name="customerCareCountry"
                value={form.customerCareCountry}
                placeholder="Country"
                options={["United States", "United Kingdom", "Canada"]}
                onChange={updateField}
              />
              <TextInput
                name="customerCareSecondary"
                value={form.customerCareSecondary}
                type="tel"
                placeholder="9058535885"
                onChange={updateField}
              />
            </div>
          </section>

          <section className="rounded-lg bg-[#a8a8a8] p-3">
            <OptionGroup
              title="Payment method"
              name="paymentMethod"
              value={form.paymentMethod}
              options={["Online transfer", "Cryptocurrency", "International"]}
              onChange={updateField}
            />

            <FieldLabel>Payment date</FieldLabel>
            <div className="grid grid-cols-3 gap-1">
              <SelectBox name="paymentDateDay" value={form.paymentDateDay} options={days} placeholder="Day" onChange={updateField} />
              <SelectBox name="paymentDateMonth" value={form.paymentDateMonth} options={months} placeholder="Month" onChange={updateField} />
              <SelectBox name="paymentDateYear" value={form.paymentDateYear} options={years} placeholder="Year" onChange={updateField} />
            </div>

            <FieldLabel>Authorization Code</FieldLabel>
            <TextInput
              name="authorizationCode"
              value={form.authorizationCode}
              placeholder="009823"
              onChange={updateField}
            />

            <FieldLabel>Bank address</FieldLabel>
            <TextInput
              name="bankAddress"
              value={form.bankAddress}
              placeholder="123 Main St, New York, NY 10001"
              onChange={updateField}
            />
          </section>

          {(error || message) && (
            <div className="md:col-span-2 lg:col-span-3">
              {error && (
                <p className="rounded-lg bg-red-950/80 px-4 py-3 text-center text-sm text-red-100">
                  {error}
                </p>
              )}
              {message && (
                <p className="flex items-center justify-center gap-2 rounded-lg bg-green-900/80 px-4 py-3 text-center text-sm text-green-100">
                  <CheckCircle2 size={16} />
                  {message}
                </p>
              )}
            </div>
          )}

          <div className="flex justify-center md:col-span-2 lg:col-span-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-8 inline-flex h-[48px] w-[280px] items-center justify-center gap-3 rounded-[12px] !bg-[#1E40AF] text-[15px] font-medium !text-white transition hover:!bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Create gift
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
