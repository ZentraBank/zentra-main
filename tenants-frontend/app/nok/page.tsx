import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

const documents = [
  {
    label: "View Client’s Death Certificate",
    href: "/nok/death-certificate",
  },
  {
    label: "View Client’s Valid ID",
    href: "/nok/valid-id",
  },
  {
    label: "View Client’s POD Form",
    href: "/nok/pod-form",
  },
];

export default function NextOfKinManagementPage() {
  return (
    <main className="relative min-h-[100svh] overflow-hidden bg-black text-white">
      <Image
        src="/images/Background_1.png"
        alt="Next-of-kin management background"
        fill
        priority
        className="object-cover object-center"
      />

      <div className="absolute inset-0 bg-black/10" />

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[430px] flex-col px-5 pb-4 pt-8 md:max-w-[520px] md:px-8 md:pt-10">
        <header className="relative flex items-center justify-center">
          <Link
            href="/dashboard"
            aria-label="Go back"
            className="absolute left-0 flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/10"
          >
            <ArrowLeft size={18} strokeWidth={2} />
          </Link>

          <p className="text-[11px] font-semibold tracking-[0.8px] md:text-xs">
            Next-of-kin Management
          </p>
        </header>

        <section className="mt-6">
          <h1 className="mx-auto max-w-[350px] pt-6 text-center font-sf text-[45px] leading-[1.05] tracking-[-0.7px] md:text-[38px]">
            Next-of-kin
            <br />
            Account Manager
          </h1>

          <p className="mx-auto mt-3 max-w-[370px] text-center font-lato text-[14px] font-medium leading-[1.25] text-white md:text-sm">
            Control and act as a next-of-kin funds account manager for your
            clients, McGregory Thylaren. Give them exactly what they want to see
            and get your massive cashout in a couple of days!
          </p>

          <div className="mt-3 space-y-3">
            {documents.map((document) => (
              <Link
                key={document.label}
                href={document.href}
                className="group mx-auto flex min-h-[44px] w-full max-w-[329px] items-center justify-between rounded-[10px] bg-white px-3.5 py-3 font-roboto text-[14px] font-medium text-[#555] shadow-[0_3px_10px_rgba(0,0,0,0.18)] transition hover:scale-[1.01] hover:bg-gray-50 active:scale-[0.99] md:min-h-[50px]"
              >
                <span>{document.label}</span>

                <ArrowRight
                  size={17}
                  className="text-[#999] transition-transform group-hover:translate-x-1"
                />
              </Link>
            ))}
          </div>
        </section>

        <div className="mt-auto flex justify-center pb-1 pt-10">
          <Link
            href="/dashboard"
            className="flex h-[38px] w-[260px] items-center justify-center rounded-[8px] bg-[#1E40AF] font-roboto text-[16px] text-white shadow-lg transition hover:bg-[#1e3fc2] active:scale-95 md:h-11 md:w-[210px] md:text-sm"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}