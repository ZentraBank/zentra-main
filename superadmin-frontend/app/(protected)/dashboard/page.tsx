import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Building2,
  FileCheck2,
  Landmark,
  ReceiptText,
  ShieldCheck,
  UserRoundCog,
  Users,
  WalletCards,
} from "lucide-react";

const metrics = [
  { label: "Total tenants", value: "24", icon: Building2, href: "/tenants" },
  { label: "Administrators", value: "38", icon: UserRoundCog, href: "/administrators" },
  { label: "Total users", value: "12,480", icon: Users, href: "/users" },
  { label: "Total accounts", value: "9,842", icon: WalletCards, href: "/accounts" },
  { label: "Platform balance", value: "$84.2M", icon: Landmark, href: "/accounts" },
  { label: "Transactions today", value: "1,284", icon: ReceiptText, href: "/transactions" },
  { label: "Pending proofs", value: "17", icon: FileCheck2, href: "/payment-proofs" },
  { label: "Security alerts", value: "3", icon: ShieldCheck, href: "/security" },
];

const activity = [
  "New tenant created: Northstar Finance",
  "Payment proof approved for Gold subscription",
  "Tenant administrator account suspended",
  "Global transaction limit updated",
];

export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-[1500px]">
      <section className="overflow-hidden rounded-[28px] bg-gradient-to-br from-[#123db8] via-[#2458e8] to-[#183a9e] p-7 text-white shadow-[0_24px_70px_rgba(36,88,232,0.28)] sm:p-10">
        <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold">
              <ShieldCheck size={17} />
              Superadmin control centre
            </div>
            <h1 className="mt-5 max-w-3xl text-3xl font-black tracking-[-0.04em] sm:text-5xl">
              Full platform overview and management
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
              Monitor tenants, users, accounts, transactions, subscriptions,
              security, and system activity from one place.
            </p>
          </div>
          <div className="rounded-2xl bg-white/12 p-5 backdrop-blur lg:min-w-[260px]">
            <p className="text-sm text-blue-100">Platform status</p>
            <p className="mt-2 text-xl font-black">● Operational</p>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Link
              key={metric.label}
              href={metric.href}
              className="group rounded-[24px] bg-white p-5 shadow-[0_14px_35px_rgba(22,54,112,0.08)] transition hover:-translate-y-1"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8efff] text-[#2458e8]">
                  <Icon size={23} />
                </div>
                <ArrowRight size={18} className="text-slate-300 group-hover:text-[#2458e8]" />
              </div>
              <p className="mt-6 text-3xl font-black tracking-[-0.04em]">{metric.value}</p>
              <p className="mt-2 text-sm font-bold">{metric.label}</p>
            </Link>
          );
        })}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-[28px] bg-white p-6 shadow-[0_14px_40px_rgba(22,54,112,0.08)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-[#2458e8]">Performance</p>
              <h2 className="mt-1 text-2xl font-black">Transaction overview</h2>
            </div>
            <Activity className="text-[#2458e8]" />
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              ["Successful", "1,146", "+12.8%"],
              ["Pending", "96", "Review queue"],
              ["Failed", "42", "3.2% rate"],
            ].map(([label, value, note]) => (
              <div key={label} className="rounded-2xl bg-[#f5f8ff] p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
                <p className="mt-3 text-3xl font-black">{value}</p>
                <p className="mt-2 text-xs text-slate-500">{note}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-blue-200 bg-[#f8faff] text-center">
            <div>
              <Activity className="mx-auto text-[#2458e8]" size={32} />
              <p className="mt-3 font-bold">Analytics chart area</p>
              <p className="mt-1 text-sm text-slate-500">Connect your analytics endpoint here.</p>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] bg-white p-6 shadow-[0_14px_40px_rgba(22,54,112,0.08)]">
          <p className="text-sm font-bold text-[#2458e8]">Audit activity</p>
          <h2 className="mt-1 text-2xl font-black">Recent actions</h2>
          <div className="mt-6 divide-y divide-slate-100">
            {activity.map((item, index) => (
              <div key={item} className="py-4 first:pt-0">
                <p className="text-sm font-bold">{item}</p>
                <p className="mt-1 text-xs text-slate-400">{index + 1} hour(s) ago</p>
              </div>
            ))}
          </div>
          <Link href="/audit-logs" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#2458e8]">
            View all logs <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  );
}
