import AppShell from "@/components/layout/AppShell";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ClientSuccessPage() {
  return (
    <AppShell>
      <main className="-m-6 min-h-screen bg-black text-white">
        <div className="mx-auto flex min-h-screen max-w-[430px] flex-col bg-black">
          <header className="px-4 py-5">
            <Link href="/clients/add" className="inline-flex text-white">
              <ArrowLeft size={22} />
            </Link>
          </header>

          <section className="flex flex-1 items-center justify-center px-5 pb-24">
            <div className="w-full rounded-[10px] border-[5px] border-white bg-[#2445B8] px-2 py-5 shadow-[0_0_24px_rgba(36,69,184,0.45)]">
              <div className="mb-5 flex items-center gap-5 px-1">
                <Link href="/clients/add">
                  <ArrowLeft size={17} />
                </Link>

                <h1 className="text-[19px] font-bold tracking-wide">
                  Client Added Successfully
                </h1>
              </div>

              <p className="mx-auto max-w-[275px] text-center text-[12.5px] leading-[16px] text-white/90">
                Now that you have added this client successfully, you can now
                proceed to bomb this client...
              </p>

              <div className="mx-auto mt-5 h-px w-[85%] bg-white/40" />

              <div className="mt-3 rounded-[8px] bg-white p-3 text-black">
                <div className="grid grid-cols-[1fr_64px] gap-3">
                  <div>
                    <p className="text-[11px] font-bold">Account number:</p>

                    <div className="mt-1 rounded-[5px] bg-black px-2 py-1 text-[16px] text-white">
                      827 938 9889
                    </div>

                    <p className="mt-3 text-[11px] font-bold">
                      Account name:
                    </p>

                    <div className="mt-1 rounded-[5px] bg-black px-2 py-1 text-[16px] text-white">
                      Gregory Winter
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-between">
                    <div className="relative h-[58px] w-[58px] overflow-hidden rounded-full bg-gray-200">
                      <Image
                        src="/images/greg-winter.png"
                        alt="Gregory Winter"
                        fill
                        priority
                        className="object-cover"
                      />
                    </div>

                  <Link
                    href="/clients/gregory-winter"
                    className="mt-4 flex h-[24px] min-w-[88px] items-center justify-center whitespace-nowrap rounded-full bg-white px-4 text-[11px] font-semibold !text-[#555555] shadow-[0_1px_5px_rgba(0,0,0,0.18)]"
                  >
                    See Profile
                  </Link>
                  </div>
                </div>
              </div>

              <Link
                href="/clients/gregory-winter"
                className="mx-auto mt-7 flex h-[34px] w-[84%] items-center justify-center rounded-[9px] bg-[#7890DC] text-sm font-medium text-black"
              >
                Manage client
              </Link>
            </div>
          </section>
        </div>
      </main>
    </AppShell>
  );
}