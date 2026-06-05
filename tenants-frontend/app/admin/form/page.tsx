import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ChevronDown } from "lucide-react";

function OptionButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="h-6 rounded-lg bg-white px-3 text-[12px] text-black shadow-sm lg:h-10 lg:text-sm"
    >
      {children}
    </button>
  );
}

function Field({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div>
      <label className="mb-1 block text-[12px] font-bold text-black/70 lg:mb-2 lg:text-sm lg:text-white/70">
        {label}
      </label>

      <input
        placeholder={placeholder}
        className="h-8 w-full rounded-lg bg-white px-3 text-[13px] text-black outline-none placeholder:text-black/30 lg:h-12 lg:rounded-xl lg:text-sm"
      />
    </div>
  );
}

function SelectRow({
  title,
  options,
}: {
  title: string;
  options: string[];
}) {
  return (
    <section className="rounded-xl bg-[#a6a6a6] p-2 lg:bg-white/10 lg:p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-[12px] font-bold text-black/70 lg:text-sm lg:text-white/70">
          {title}
        </h3>
        <ChevronDown size={15} className="text-black/70 lg:text-white/70" />
      </div>

      <div className="grid grid-cols-2 gap-1 lg:gap-2">
        {options.map((option) => (
          <OptionButton key={option}>{option}</OptionButton>
        ))}
      </div>
    </section>
  );
}

export default function EditTransferPage() {
  return (
    <main className="relative min-h-[100svh] overflow-hidden bg-black text-white">
      <Image
        src="/images/Background.png"
        alt="Background"
        fill
        priority
        className="object-cover"
      />

      <div className="relative z-10 mx-auto max-w-[430px] px-3 pb-8 pt-10 lg:max-w-7xl lg:px-10 lg:pt-16">
        {/* Back */}
        <Link
          href="/services/transfer"
          className="absolute left-4 top-10 text-white lg:left-10 lg:top-10"
        >
          <ArrowLeft size={18} />
        </Link>

        {/* MOBILE VERSION */}
        <div className="lg:hidden">
          <h1 className="text-center text-[13px] font-bold">Edit Transfer</h1>

          <form className="mt-6 space-y-4">
            <section className="rounded-xl bg-[#a6a6a6] p-2">
              <SelectRow
                title="Transaction type"
                options={["IntraBank", "InterBank", "International"]}
              />

              <div className="mt-3">
                <SelectRow
                  title="Current account status"
                  options={["Verified!", "Unverified", "Pending verification"]}
                />
              </div>

              <div className="mt-3">
                <Field
                  label="Available Balance"
                  placeholder="$XXX, XXX, XX.XX"
                />
              </div>
            </section>

            <section className="rounded-xl border-2 border-white bg-red-700 p-2">
              <Field label="Account number" placeholder="XXX XXX XXXX" />

              <button
                type="button"
                className="mt-2 ml-auto block rounded-full bg-sky-400 px-4 py-1 text-[10px] font-semibold text-white"
              >
                Save client
              </button>
            </section>

            <section className="rounded-xl border border-orange-400 bg-[linear-gradient(135deg,#168a25,#f00000,#168a25)] p-3 text-center">
              <p className="text-[12px] font-bold">Bank</p>

              <div className="mx-auto mt-2 flex h-14 w-[160px] items-center justify-center rounded-full bg-blue-700 text-white">
                <span className="text-[13px] font-bold">
                  ZentraBank Transfer
                </span>
              </div>
            </section>

            <section className="rounded-xl bg-[#a6a6a6] p-2">
              <Field label="Amount" placeholder="eg. $50,000" />

              <p className="mt-1 text-right text-[10px] text-white">
                balance: $50,000,000
              </p>

              <div className="mt-3">
                <SelectRow
                  title="Transaction status"
                  options={["pending", "Successful", "reversed"]}
                />
              </div>

              <div className="mt-3">
                <Field label="Coming from" placeholder="Sender’s name" />
              </div>
            </section>

            <section className="rounded-xl bg-[#a6a6a6] p-2">
              <SelectRow
                title="Bank type"
                options={["IntraBank", "InterBank", "International"]}
              />

              <div className="mt-3">
                <SelectRow
                  title="Current account status"
                  options={["Verified!", "Unverified", "Pending verification"]}
                />
              </div>

              <div className="mt-3">
                <label className="mb-1 block text-[12px] font-bold text-black/70">
                  Transaction date
                </label>

                <div className="grid grid-cols-3 gap-1">
                  {["Day", "Month", "Year"].map((item) => (
                    <button
                      key={item}
                      type="button"
                      className="h-8 rounded-lg bg-white text-[12px] text-black/40"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-3">
                <Field
                  label="Available Balance"
                  placeholder="$5,0001,234.56"
                />
              </div>
            </section>

            <section className="rounded-xl bg-[#a6a6a6] p-2">
              <label className="mb-1 block text-[12px] font-bold text-black/70">
                Set transaction time
              </label>

              <div className="grid grid-cols-3 gap-1">
                {["Hour", "Minute", "Seconds"].map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="h-8 rounded-lg bg-white text-[12px] text-black/40"
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="mt-3 space-y-3">
                <Field label="Fee" placeholder="%10" />
                <Field label="Transaction ID" placeholder="98234723948" />
                <Field label="Customer Care line" placeholder="98234723948" />
                <Field label="Authorization Code" placeholder="009823" />
                <Field
                  label="Bank address"
                  placeholder="123 Main St, New York, NY 10001"
                />
              </div>
            </section>

            <div className="flex justify-center pt-3">
              <button
                type="button"
                className="flex w-[245px] items-center justify-center gap-3 rounded-xl bg-blue-700 px-4 py-3 text-[14px] font-bold text-white"
              >
                Transfer
                <ArrowRight size={18} />
              </button>
            </div>
          </form>
        </div>

        {/* DESKTOP VERSION */}
        <div className="hidden lg:block">
          <div className="mb-10 text-center">
            <h1 className="text-[42px] font-extrabold text-white">
              Edit Transfer
            </h1>
            <p className="mt-2 text-white/60">
              Manage transaction details, status, balance, and customer
              information.
            </p>
          </div>

          <form className="grid grid-cols-[1fr_380px] gap-8">
            {/* LEFT FORM */}
            <section className="space-y-6 rounded-[30px] border border-white/10 bg-white/[0.08] p-8 backdrop-blur-xl">
              <div className="grid grid-cols-2 gap-5">
                <SelectRow
                  title="Transaction type"
                  options={["IntraBank", "InterBank", "International"]}
                />

                <SelectRow
                  title="Current account status"
                  options={[
                    "Verified!",
                    "Unverified",
                    "Pending verification",
                  ]}
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <Field
                  label="Available Balance"
                  placeholder="$XXX, XXX, XX.XX"
                />
                <Field label="Account number" placeholder="XXX XXX XXXX" />
              </div>

              <div className="rounded-2xl border border-orange-400 bg-[linear-gradient(135deg,#168a25,#f00000,#168a25)] p-5 text-center">
                <p className="text-sm font-bold text-white">Bank</p>

                <div className="mx-auto mt-3 flex h-16 w-[220px] items-center justify-center rounded-full bg-blue-700 text-white shadow-xl">
                  <span className="text-base font-bold">
                    ZentraBank Transfer
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <Field label="Amount" placeholder="eg. $50,000" />
                <Field label="Coming from" placeholder="Sender’s name" />
              </div>

              <SelectRow
                title="Transaction status"
                options={["pending", "Successful", "reversed"]}
              />

              <div className="grid grid-cols-2 gap-5">
                <SelectRow
                  title="Bank type"
                  options={["IntraBank", "InterBank", "International"]}
                />

                <SelectRow
                  title="Current account status"
                  options={[
                    "Verified!",
                    "Unverified",
                    "Pending verification",
                  ]}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-white/70">
                  Transaction date
                </label>

                <div className="grid grid-cols-3 gap-3">
                  {["Day", "Month", "Year"].map((item) => (
                    <button
                      key={item}
                      type="button"
                      className="h-12 rounded-xl bg-white text-sm font-medium text-black/50"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-white/70">
                  Set transaction time
                </label>

                <div className="grid grid-cols-3 gap-3">
                  {["Hour", "Minute", "Seconds"].map((item) => (
                    <button
                      key={item}
                      type="button"
                      className="h-12 rounded-xl bg-white text-sm font-medium text-black/50"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* RIGHT SUMMARY */}
            <aside className="sticky top-8 h-fit rounded-[30px] border border-white/10 bg-white/[0.08] p-6 backdrop-blur-xl">
              <h2 className="text-2xl font-extrabold text-white">
                Transfer Summary
              </h2>

              <div className="mt-6 space-y-4">
                <Field label="Fee" placeholder="%10" />
                <Field label="Transaction ID" placeholder="98234723948" />
                <Field label="Customer Care line" placeholder="98234723948" />
                <Field label="Authorization Code" placeholder="009823" />
                <Field
                  label="Bank address"
                  placeholder="123 Main St, New York, NY 10001"
                />
              </div>

              <div className="mt-6 rounded-2xl bg-black/30 p-4">
                <div className="flex items-center justify-between text-sm text-white/60">
                  <span>Balance</span>
                  <span>$50,000,000</span>
                </div>

                <div className="mt-3 flex items-center justify-between text-sm text-white/60">
                  <span>Status</span>
                  <span className="font-bold text-emerald-400">Pending</span>
                </div>
              </div>

              <button
                type="button"
                className="mt-8 flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-blue-700 text-[16px] font-bold text-white shadow-[0_14px_35px_rgba(0,0,0,0.35)] transition hover:bg-blue-800"
              >
                Transfer
                <ArrowRight size={20} />
              </button>
            </aside>
          </form>
        </div>
      </div>
    </main>
  );
}