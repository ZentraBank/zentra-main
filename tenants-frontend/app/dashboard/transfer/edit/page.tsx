"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ChevronDown } from "lucide-react";

const currencies = [
  { label: "$", value: "USD" },
  { label: "£", value: "GBP" },
  { label: "€", value: "EUR" },
  { label: "C$", value: "CAD" },
  { label: "A$", value: "AUD" },
  { label: "¥", value: "JPY" },
];

export const EDITED_TRANSACTION_KEY = "zentra_edited_transaction";

type FormState = {
  transactionType: string;
  accountStatus: string;
  availableBalance: string;
  accountNumber: string;
  bank: string;
  currency: string;
  amount: string;
  transactionStatus: string;
  contactLabel: string; // "Coming from" or "Sending to"
  contactName: string;
  bankType: string;
  accountStatus2: string;
  dateDay: string;
  dateMonth: string;
  dateYear: string;
  availableBalance2: string;
  timeHour: string;
  timeMinute: string;
  timeSecond: string;
  fee: string;
  transactionId: string;
  transactionId2: string;
  customerCareLine: string;
  customerCareCountry: string;
  customerCarePhone: string;
  transactionType2: string;
  date2Day: string;
  date2Month: string;
  date2Year: string;
  authorizationCode: string;
  bankAddress: string;
};

const Pill = ({
  children,
  selected,
  onClick,
}: {
  children: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`h-[32px] rounded-xl px-3 text-[11px] font-medium transition-all duration-300
      ${
        selected
          ? "!bg-[#2447d8] !text-white shadow-[0_0_12px_rgba(36,71,216,0.5)]"
          : "!bg-white !text-black hover:bg-[#eef4ff]"
      }`}
  >
    {children}
  </button>
);

const SelectBox = ({
  options,
  placeholder,
  value,
  onChange,
}: {
  options: string[];
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="h-[27px] w-full rounded-lg bg-white px-3 text-[12px] text-gray-500 outline-none"
  >
    <option value="" disabled>
      {placeholder}
    </option>

    {options.map((option) => (
      <option key={option} value={option}>
        {option}
      </option>
    ))}
  </select>
);

const Input = ({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) => (
  <input
    placeholder={placeholder}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="h-[27px] w-full rounded-md bg-white px-2 text-[13px] text-black placeholder:text-gray-400 outline-none"
  />
);

const CurrencyDropdown = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => (
  <select title="Currency Dropdown"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="h-[27px] w-[58px] rounded-lg bg-white px-2 text-[12px] text-gray-700 outline-none"
  >
    {currencies.map((currency) => (
      <option key={currency.value} value={currency.value}>
        {currency.label}
      </option>
    ))}
  </select>
);

function OptionGroup({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="rounded-2xl bg-[#f1f1f1] p-3">
      <div className="mb-3 flex items-center justify-between text-[12px] font-medium text-black">
        <span>{title}</span>
        <ChevronDown size={14} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => (
          <Pill
            key={option}
            selected={value === option}
            onClick={() => onChange(option)}
          >
            {option}
          </Pill>
        ))}
      </div>
    </div>
  );
}

function buildInitialForm(searchParams: URLSearchParams): FormState {
  const title = searchParams.get("title") ?? "";
  const bank = searchParams.get("bank") ?? "ZentraBank";
  const rawAmount = searchParams.get("amount") ?? "";
  const type = (searchParams.get("type") as "in" | "out" | null) ?? "in";

  const senderNameMatch = title.match(/^Transfer (?:from|to)\s+(.+)$/i);
  const contactName = senderNameMatch ? senderNameMatch[1] : title;

  const amountMatch = rawAmount.match(/([$£€¥]|C\$|A\$)?\s*([\d,]+)/);
  const currencySymbol = amountMatch?.[1] ?? "$";
  const numericAmount = amountMatch?.[2] ?? "";

  const matchedCurrency =
    currencies.find((c) => c.label === currencySymbol)?.value ?? "USD";

  return {
    transactionType: "IntraBank",
    accountStatus: "Verified!",
    availableBalance: "",
    accountNumber: "",
    bank,
    currency: matchedCurrency,
    amount: numericAmount,
    transactionStatus: "Successful",
    contactLabel: type === "in" ? "Coming from" : "Sending to",
    contactName,
    bankType: "IntraBank",
    accountStatus2: "Verified!",
    dateDay: "",
    dateMonth: "",
    dateYear: "",
    availableBalance2: "",
    timeHour: "",
    timeMinute: "",
    timeSecond: "",
    fee: "",
    transactionId: "",
    transactionId2: "",
    customerCareLine: "",
    customerCareCountry: "",
    customerCarePhone: "",
    transactionType2: "",
    date2Day: "",
    date2Month: "",
    date2Year: "",
    authorizationCode: "",
    bankAddress: "",
  };
}

function EditTransferForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() =>
    buildInitialForm(searchParams)
  );

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    const type: "in" | "out" =
      form.contactLabel === "Coming from" ? "in" : "out";

    const title =
      type === "in"
        ? `Transfer from ${form.contactName}`
        : `Transfer to ${form.contactName}`;

    const payload = {
      id: searchParams.get("id") ?? "",
      ...form,
      type,
      title,
      amountDisplay: `${
        currencies.find((c) => c.value === form.currency)?.label ?? "$"
      }${form.amount}`,
    };

    sessionStorage.setItem(EDITED_TRANSACTION_KEY, JSON.stringify(payload));
    router.push("/dashboard/transfer/transaction");
  };

  return (
    <main
      className="min-h-screen"
      style={{
        backgroundImage: "url('/images/Background_1.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="mx-auto min-h-screen w-full max-w-[430px] px-2 pb-8 pt-8 md:max-w-[900px] md:px-8 lg:max-w-[1180px]">
        <Link href="/dashboard/transfer" className="mb-5 inline-flex text-white">
          <ArrowLeft size={18} />
        </Link>

        <h1 className="mb-4 text-center text-[13px] font-bold md:mb-8 md:text-2xl text-white">
          Edit Transfer
        </h1>

        <div className="grid gap-3 md:grid-cols-2 md:gap-5 lg:grid-cols-3">
          <section className="rounded-lg bg-[#a8a8a8] p-2 md:p-3">
            <OptionGroup
              title="Transaction type"
              options={["IntraBank", "InterBank", "International"]}
              value={form.transactionType}
              onChange={(v) => set("transactionType", v)}
            />

            <div className="mt-3">
              <OptionGroup
                title="Current account status"
                options={["Verified!", "Unverified", "Pending verification"]}
                value={form.accountStatus}
                onChange={(v) => set("accountStatus", v)}
              />
            </div>

            <label className="mt-2 block text-[11px] font-semibold text-gray-700">
              Available Balance
            </label>
            <Input
              placeholder="$XXX, XXX, XX.XX"
              value={form.availableBalance}
              onChange={(v) => set("availableBalance", v)}
            />
          </section>

          <section className="rounded-lg border-[3px] border-white bg-[#d40000] p-2 shadow-[0_0_0_2px_#ff0000] md:p-3">
            <label className="mb-1 block text-[12px] font-bold">
              Account number
            </label>

            <div className="flex h-[40px] items-center gap-2 rounded-md bg-[#b9c4c7] px-2">
              <input
                type="text"
                placeholder="XXX XXX XXXX"
                value={form.accountNumber}
                onChange={(e) => set("accountNumber", e.target.value)}
                className="flex-1 bg-transparent text-[18px] text-black outline-none placeholder:text-black"
              />

              <button
                type="button"
                className="h-5 w-25 rounded-full !bg-[#60A5FA] px-4 text-[11px] text-white transition hover:bg-[#1E40AF]"
              >
                Save client
              </button>
            </div>
          </section>

          <section className="relative overflow-hidden rounded-xl border-2 border-white bg-[linear-gradient(145deg,#157000_0%,#8a4a00_35%,#e00000_70%,#0f6b00_100%)] p-3 md:p-4">
            <p className="text-[12px] font-bold text-white">{form.bank}</p>

            <div className="mt-4 flex justify-center">
              <Image
                src="/images/zentra.png"
                alt="ZentraBank Transfer"
                width={340}
                height={110}
                className="h-auto w-[170px] md:w-[220px] object-contain"
                priority
              />
            </div>
          </section>

          <section className="rounded-lg bg-[#a8a8a8] p-2 md:p-3">
            <label className="mb-1 block text-center text-[12px] font-bold">
              Amount
            </label>

            <div className="flex gap-2">
              <CurrencyDropdown
                value={form.currency}
                onChange={(v) => set("currency", v)}
              />

              <input
                placeholder="eg. 50,000"
                value={form.amount}
                onChange={(e) => set("amount", e.target.value)}
                className="h-[27px] flex-1 rounded-md bg-white px-2 text-[13px] text-black placeholder:text-gray-400 outline-none"
              />
            </div>

            <p className="mt-1 text-right text-[10px] text-white">
              balance: &nbsp;&nbsp; $50, 000, 000
            </p>

            <div className="mt-3">
              <OptionGroup
                title="Transaction status"
                options={["pending", "Successful", "reversed"]}
                value={form.transactionStatus}
                onChange={(v) => set("transactionStatus", v)}
              />
            </div>

            <label className="mt-2 block text-[11px] font-semibold text-gray-700">
              {form.contactLabel}
            </label>
            <Input
              placeholder="Sender's name"
              value={form.contactName}
              onChange={(v) => set("contactName", v)}
            />
          </section>

          <section className="rounded-lg bg-[#a8a8a8] p-2 md:p-3">
            <OptionGroup
              title="Bank type"
              options={["IntraBank", "InterBank", "International"]}
              value={form.bankType}
              onChange={(v) => set("bankType", v)}
            />

            <div className="mt-3">
              <OptionGroup
                title="Current account status"
                options={["Verified!", "Unverified", "Pending verification"]}
                value={form.accountStatus2}
                onChange={(v) => set("accountStatus2", v)}
              />
            </div>

            <label className="mt-2 block text-[11px] font-semibold text-gray-700">
              Transaction date
            </label>

            <div className="grid grid-cols-3 gap-1">
              <SelectBox
                placeholder="Day"
                options={Array.from({ length: 31 }, (_, i) => String(i + 1))}
                value={form.dateDay}
                onChange={(v) => set("dateDay", v)}
              />
              <SelectBox
                placeholder="Month"
                options={[
                  "Jan","Feb","Mar","Apr","May","Jun",
                  "Jul","Aug","Sep","Oct","Nov","Dec",
                ]}
                value={form.dateMonth}
                onChange={(v) => set("dateMonth", v)}
              />
              <SelectBox
                placeholder="Year"
                options={["2024", "2025", "2026"]}
                value={form.dateYear}
                onChange={(v) => set("dateYear", v)}
              />
            </div>

            <label className="mt-2 block text-[11px] font-semibold text-gray-700">
              Available Balance
            </label>
            <Input
              placeholder="$5,0001,234.56"
              value={form.availableBalance2}
              onChange={(v) => set("availableBalance2", v)}
            />
          </section>

          <section className="rounded-lg bg-[#a8a8a8] p-2 md:p-3">
            <label className="mb-1 block text-[11px] font-semibold text-gray-700">
              Set transaction time
            </label>

            <div className="grid grid-cols-3 gap-1">
              <SelectBox
                placeholder="Hour"
                options={Array.from({ length: 25 }, (_, i) =>
                  String(i).padStart(2, "0")
                )}
                value={form.timeHour}
                onChange={(v) => set("timeHour", v)}
              />
              <SelectBox
                placeholder="Minute"
                options={["00", "15", "30", "45"]}
                value={form.timeMinute}
                onChange={(v) => set("timeMinute", v)}
              />
              <SelectBox
                placeholder="Seconds"
                options={["00", "15", "30", "45"]}
                value={form.timeSecond}
                onChange={(v) => set("timeSecond", v)}
              />
            </div>

            <label className="mt-2 block text-[11px] font-semibold text-gray-700">
              Fee
            </label>
            <Input
              placeholder="%10"
              value={form.fee}
              onChange={(v) => set("fee", v)}
            />

            <label className="mt-2 block text-[11px] font-semibold text-gray-700">
              Transaction ID
            </label>
            <Input
              placeholder="98234723948"
              value={form.transactionId}
              onChange={(v) => set("transactionId", v)}
            />
          </section>

          <section className="rounded-lg bg-[#a8a8a8] p-2 md:p-3">
            <label className="block text-[11px] font-semibold text-gray-700">
              Transaction ID
            </label>
            <Input
              placeholder="98234723948"
              value={form.transactionId2}
              onChange={(v) => set("transactionId2", v)}
            />

            <label className="mt-2 block text-[11px] font-semibold text-gray-700">
              Customer Care line
            </label>
            <Input
              placeholder="98234723948"
              value={form.customerCareLine}
              onChange={(v) => set("customerCareLine", v)}
            />

            <label className="mt-2 block text-[11px] font-semibold text-gray-700">
              Customer Care line
            </label>

            <div className="grid grid-cols-[1fr_2fr] gap-1">
              <SelectBox
                placeholder="Choose country"
                options={["United States", "United Kingdom", "Canada"]}
                value={form.customerCareCountry}
                onChange={(v) => set("customerCareCountry", v)}
              />
              <Input
                placeholder="9058535885"
                value={form.customerCarePhone}
                onChange={(v) => set("customerCarePhone", v)}
              />
            </div>
          </section>

          <section className="rounded-lg bg-[#a8a8a8] p-2 md:p-3">
            <OptionGroup
              title="Transaction type"
              options={["Online transfer", "Cryptocurrency", "International"]}
              value={form.transactionType2}
              onChange={(v) => set("transactionType2", v)}
            />

            <label className="mt-2 block text-[11px] font-semibold text-gray-700">
              Transaction date
            </label>

            <div className="grid grid-cols-3 gap-1">
              <SelectBox
                placeholder="Day"
                options={Array.from({ length: 31 }, (_, i) => String(i + 1))}
                value={form.date2Day}
                onChange={(v) => set("date2Day", v)}
              />
              <SelectBox
                placeholder="Month"
                options={[
                  "Jan","Feb","Mar","Apr","May","Jun",
                  "Jul","Aug","Sep","Oct","Nov","Dec",
                ]}
                value={form.date2Month}
                onChange={(v) => set("date2Month", v)}
              />
              <SelectBox
                placeholder="Year"
                options={["2024", "2025", "2026", "2027", "2028", "2029", "2030"]}
                value={form.date2Year}
                onChange={(v) => set("date2Year", v)}
              />
            </div>

            <label className="mt-2 block text-[11px] font-semibold text-gray-700">
              Authorization Code
            </label>
            <Input
              placeholder="009823"
              value={form.authorizationCode}
              onChange={(v) => set("authorizationCode", v)}
            />

            <label className="mt-2 block text-[11px] font-semibold text-gray-700">
              Bank address
            </label>
            <Input
              placeholder="123 Main St, New York, NY 10001"
              value={form.bankAddress}
              onChange={(v) => set("bankAddress", v)}
            />
          </section>

          <div className="flex justify-center md:col-span-2 lg:col-span-3">
            <button
              type="button"
              onClick={handleSave}
              className="
                mt-12
                inline-flex
                h-[48px]
                w-[280px]
                items-center
                justify-center
                gap-3
                rounded-[12px]
                bg-[#1E40AF]
                text-[15px]
                font-medium
                !text-white
                transition
                hover:bg-blue-700
                active:scale-[0.98]
              "
            >
              <span className="!text-white">Save</span>
              <ArrowRight size={17} className="!text-white" />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

// useSearchParams() requires a Suspense boundary in the App Router.
export default function EditTransferPage() {
  return (
    <Suspense fallback={null}>
      <EditTransferForm />
    </Suspense>
  );
}