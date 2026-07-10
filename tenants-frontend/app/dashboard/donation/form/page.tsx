import Link from "next/link";
import { ArrowLeft, ArrowRight, ChevronDown } from "lucide-react";

const currencies = [
  { label: "$", value: "USD" },
  { label: "£", value: "GBP" },
  { label: "€", value: "EUR" },
  { label: "C$", value: "CAD" },
  { label: "A$", value: "AUD" },
  { label: "¥", value: "JPY" },
];

const Pill = ({ children }: { children: React.ReactNode }) => (
  <button className="h-[20px] rounded-md bg-white px-3 text-left text-[11px] text-black shadow-[inset_0_0_0_1px_#bfddff]">
    {children}
  </button>
);

const SelectBox = ({
  options,
  placeholder,
}: {
  options: string[];
  placeholder: string;
}) => (
  <select
    defaultValue=""
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

const Input = ({ placeholder }: { placeholder: string }) => (
  <input
    placeholder={placeholder}
    className="h-[27px] w-full rounded-md bg-white px-2 text-[13px] text-black placeholder:text-gray-400 outline-none"
  />
);

const CurrencyDropdown = () => (
  <select className="h-[27px] w-[58px] rounded-lg bg-white px-2 text-[12px] text-gray-700 outline-none">
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
}: {
  title: string;
  options: string[];
}) {
  return (
    <div className="rounded-lg bg-gray-100 p-2">
      <div className="mb-2 flex items-center justify-between px-2 text-[12px] text-black">
        <span>{title}</span>
        <ChevronDown size={14} />
      </div>

      <div className="grid grid-cols-2 gap-1">
        {options.map((option) => (
          <Pill key={option}>{option}</Pill>
        ))}
      </div>
    </div>
  );
}

export default function EditTransferPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#020202_0%,#070707_18%,#7b0000_42%,#d00000_68%,#060606_100%)] text-white">
      <div className="mx-auto min-h-screen w-full max-w-[430px] px-2 pb-8 pt-8 md:max-w-[900px] md:px-8 lg:max-w-[1180px]">
        <Link href="/dashboard/donation" className="mb-5 inline-flex text-white">
          <ArrowLeft size={18} />
        </Link>

        <h1 className="mb-4 text-center text-[13px] font-bold md:mb-8 md:text-2xl">
          Edit Transfer
        </h1>

        <div className="grid gap-3 md:grid-cols-2 md:gap-5 lg:grid-cols-3">
          <section className="rounded-lg bg-[#a8a8a8] p-2 md:p-3">
            <OptionGroup
              title="Transaction type"
              options={["IntraBank", "InterBank", "International"]}
            />

            <div className="mt-3">
              <OptionGroup
                title="Current account status"
                options={["Verified!", "Unverified", "Pending verification"]}
              />
            </div>

            <label className="mt-2 block text-[11px] font-semibold text-gray-700">
              Available Balance
            </label>
            <Input placeholder="$XXX, XXX, XX.XX" />
          </section>

          <section className="rounded-lg border-[3px] border-white bg-[#d40000] p-2 shadow-[0_0_0_2px_#ff0000] md:p-3">
            <label className="mb-1 block text-[12px] font-bold">
              Account number
            </label>

            <div className="flex h-[40px] items-center gap-2 rounded-md bg-[#b9c4c7] px-2">
            <input
                type="text"
                placeholder="XXX XXX XXXX"
                className="flex-1 bg-transparent text-[18px] text-black outline-none placeholder:text-black"
            />

            <button
                type="button"
                className="h-7 rounded-full bg-[#48a7ff] px-4 text-[11px] text-white transition hover:bg-[#3797ff]"
            >
                Save client
            </button>
            </div>
          </section>

          <section className="rounded-lg bg-[linear-gradient(150deg,#08a000,#d10000_70%)] p-4 shadow-[0_0_0_2px_#ffffff] md:p-5">
            <p className="mb-2 text-[12px] font-semibold">Bank</p>

            <button className="mx-auto flex h-[55px] w-[160px] items-center justify-center rounded-full bg-[#2148d8] text-[13px] font-bold">
              ZentraBank
              <br />
              Transfer
            </button>
          </section>

          <section className="rounded-lg bg-[#a8a8a8] p-2 md:p-3">
            <label className="mb-1 block text-center text-[12px] font-bold">
              Amount
            </label>

            <div className="flex gap-2">
              <CurrencyDropdown />

              <input
                placeholder="eg. $50,000"
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
              />
            </div>

            <label className="mt-2 block text-[11px] font-semibold text-gray-700">
              Coming from
            </label>
            <Input placeholder="Sender's name" />
          </section>

          <section className="rounded-lg bg-[#a8a8a8] p-2 md:p-3">
            <OptionGroup
              title="Bank type"
              options={["IntraBank", "InterBank", "International"]}
            />

            <div className="mt-3">
              <OptionGroup
                title="Current account status"
                options={["Verified!", "Unverified", "Pending verification"]}
              />
            </div>

            <label className="mt-2 block text-[11px] font-semibold text-gray-700">
              Transaction date
            </label>

            <div className="grid grid-cols-3 gap-1">
              <SelectBox placeholder="Day" options={["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"]} />
                <SelectBox placeholder="Month" options={["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]} />
                <SelectBox placeholder="Year" options={["2024", "2025", "2026"]} />
            </div>

            <label className="mt-2 block text-[11px] font-semibold text-gray-700">
              Available Balance
            </label>
            <Input placeholder="$5,0001,234.56" />
          </section>

          <section className="rounded-lg bg-[#a8a8a8] p-2 md:p-3">
            <label className="mb-1 block text-[11px] font-semibold text-gray-700">
              Set transaction time
            </label>

            <div className="grid grid-cols-3 gap-1">
              <SelectBox placeholder="Hour" options={["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24"]} />
            <SelectBox placeholder="Minute" options={["00", "15", "30", "45"]} />
            <SelectBox placeholder="Seconds" options={["00", "15", "30", "45"]} />
            </div>

            <label className="mt-2 block text-[11px] font-semibold text-gray-700">
              Fee
            </label>
            <Input placeholder="%10" />

            <label className="mt-2 block text-[11px] font-semibold text-gray-700">
              Transaction ID
            </label>
            <Input placeholder="98234723948" />
          </section>

          <section className="rounded-lg bg-[#a8a8a8] p-2 md:p-3">
            <label className="block text-[11px] font-semibold text-gray-700">
              Transaction ID
            </label>
            <Input placeholder="98234723948" />

            <label className="mt-2 block text-[11px] font-semibold text-gray-700">
              Customer Care line
            </label>
            <Input placeholder="98234723948" />

            <label className="mt-2 block text-[11px] font-semibold text-gray-700">
              Customer Care line
            </label>

            <div className="grid grid-cols-[1fr_2fr] gap-1">
              <SelectBox
                placeholder="Choose country"
                options={["United States", "United Kingdom", "Canada"]}
                />
              <Input placeholder="9058535885" />
            </div>
          </section>

          <section className="rounded-lg bg-[#a8a8a8] p-2 md:p-3">
            <OptionGroup
              title="Transaction type"
              options={["Online transfer", "Cryptocurrency", "International"]}
            />

            <label className="mt-2 block text-[11px] font-semibold text-gray-700">
              Transaction date
            </label>

            <div className="grid grid-cols-3 gap-1">
              <SelectBox placeholder="Day" options={["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"]} />
            <SelectBox placeholder="Month" options={["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]} />
            <SelectBox placeholder="Year" options={["2024", "2025", "2026", "2027", "2028", "2029", "2030"]} />
            </div>

            <label className="mt-2 block text-[11px] font-semibold text-gray-700">
              Authorization Code
            </label>
            <Input placeholder="009823" />

            <label className="mt-2 block text-[11px] font-semibold text-gray-700">
              Bank address
            </label>
            <Input placeholder="123 Main St, New York, NY 10001" />
          </section>

          <div className="md:col-span-2 lg:col-span-3">
            <button className="mx-auto mt-8 flex h-[42px] w-[275px] items-center justify-center gap-4 rounded-xl bg-[#2447d8] text-[14px] font-bold">
              Send Donation
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}