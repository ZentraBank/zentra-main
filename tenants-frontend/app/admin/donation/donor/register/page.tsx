import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ChevronDown } from "lucide-react";

const Pill = ({ children }: { children: React.ReactNode }) => (
  <button className="h-[24px] rounded-md bg-white px-3 text-left text-[12px] text-black shadow-[inset_0_0_0_1px_#bfddff]">
    {children}
  </button>
);

const SelectBox = ({
  placeholder,
  options,
}: {
  placeholder: string;
  options: string[];
}) => (
  <select title={placeholder}
    defaultValue=""
    className="h-[31px] w-full rounded-lg bg-white px-3 text-[12px] text-gray-400 outline-none"
  >
    <option value="" disabled>
      {placeholder}
    </option>

    {options.map((option) => (
      <option key={option}>{option}</option>
    ))}
  </select>
);

function OptionGroup() {
  return (
    <div className="rounded-lg bg-gray-100 p-2">
      <div className="mb-2 flex items-center justify-between px-2 text-[12px] text-black">
        <span>Preferred means of funding</span>
        <ChevronDown size={14} />
      </div>

      <div className="grid grid-cols-2 gap-1">
        <Pill>Cryptocurrency</Pill>
        <Pill>Gift card</Pill>
        <div className="col-span-2">
          <Pill>Direct bank transfer</Pill>
        </div>
      </div>
    </div>
  );
}

export default function FundsDonorRegistrationPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <Image
        src="/images/Background.png"
        alt="Background"
        fill
        priority
        className="object-cover"
      />

      <div className="relative z-10 mx-auto min-h-screen max-w-[430px] px-2 pb-10 pt-10 md:max-w-[1180px] md:px-10 md:py-10">
        <Link href="/dashboard" className="mb-4 inline-flex text-white">
          <ArrowLeft size={18} />
        </Link>

        <p className="mb-4 text-center text-[12px] font-bold md:text-base">
          Funds Donor Registration
        </p>

        <h1 className="text-center text-[35px] font-black leading-[0.92] tracking-[-1px] md:text-[68px]">
          Register to become a
          <br />
          <span className="underline underline-offset-4">Funds Donator</span>
        </h1>

        <section className="mx-auto mt-5 grid max-w-[980px] gap-4 md:mt-10 md:grid-cols-[360px_1fr] md:items-start">
          <div className="rounded-lg bg-white p-2 text-black md:rounded-2xl md:p-4">
            <h2 className="mb-2 text-[12px] font-bold">
              Personal Information
            </h2>

            <div className="grid grid-cols-[90px_1fr] gap-2 md:grid-cols-1">
              <Image
                src="/images/David.png"
                alt="Profile"
                width={110}
                height={110}
                className="h-[90px] w-[90px] rounded-sm object-cover md:h-[230px] md:w-full md:rounded-xl"
              />

              <div className="rounded-sm border border-blue-400 p-1 md:mt-3 md:rounded-xl md:p-3">
                <h3 className="text-[20px] font-bold leading-tight md:text-3xl">
                  David Christopher
                </h3>

                <div className="mt-1 rounded-sm bg-black p-2 text-white md:mt-3 md:rounded-lg md:p-4">
                  <p className="text-[13px] md:text-base">Nigerian</p>
                  <p className="text-[12px] md:text-sm">Celebrity Bomber</p>
                  <p className="text-[12px] md:text-sm">Male</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-2 text-black md:rounded-2xl md:p-5">
            <section className="rounded-lg bg-[#a7a7a7] p-2 md:p-4">
              <h2 className="mb-2 text-[12px] font-bold">
                Fill-in Your Funds Donator Information
              </h2>

              <OptionGroup />

              <label className="mt-3 block text-[12px] font-bold text-gray-700">
                Transaction date
              </label>

              <div className="grid grid-cols-3 gap-1">
                <SelectBox placeholder="Day" options={["01", "02", "03"]} />
                <SelectBox placeholder="Month" options={["Jan", "Feb", "Mar"]} />
                <SelectBox placeholder="Year" options={["2025", "2026"]} />
              </div>

              <label className="mt-3 block text-[12px] font-bold text-gray-700">
                Your major
              </label>

              <textarea
                placeholder="Tell our website users(your potential clients) who you are? Make sure you write something legit."
                className="min-h-[130px] w-full resize-none rounded-md bg-white p-2 text-[13px] text-black placeholder:text-gray-400 outline-none md:min-h-[190px] md:text-base"
              />
            </section>

            <button className="mx-auto mt-8 flex h-[38px] w-[300px] max-w-full items-center justify-center gap-3 rounded-lg bg-[#2447d8] text-[14px] font-bold text-white md:h-12 md:w-[360px] md:text-base">
              List me
              <ArrowRight size={17} />
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}