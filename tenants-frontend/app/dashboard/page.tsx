import AppShell from "@/components/layout/AppShell";
import { ArrowDownLeft, ArrowUpRight, Wallet, MessageCircle } from "lucide-react";

const stats = [
  { label: "Available Balance", value: "₦250,000", icon: Wallet },
  { label: "Money In", value: "₦120,000", icon: ArrowDownLeft },
  { label: "Money Out", value: "₦35,000", icon: ArrowUpRight },
  { label: "Open Chats", value: "2", icon: MessageCircle },
];

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Overview of your account activity.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-tenant/10 text-tenant">
                <Icon size={20} />
              </div>

              <p className="text-sm text-gray-500">{stat.label}</p>
              <h2 className="mt-1 text-2xl font-bold">{stat.value}</h2>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="mb-4 font-bold">Recent Transactions</h2>

          <div className="space-y-3">
            {["Account credited", "Transfer sent", "Account debited"].map((item, index) => (
              <div key={item} className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <p className="text-sm font-medium">{item}</p>
                  <p className="text-xs text-gray-500">Today</p>
                </div>
                <p className={index === 1 ? "text-sm font-bold text-red-600" : "text-sm font-bold text-green-600"}>
                  {index === 1 ? "-₦5,000" : "+₦50,000"}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-bold">Notifications</h2>

          <div className="space-y-3 text-sm text-gray-600">
            <p>Your account was credited.</p>
            <p>New message from support.</p>
            <p>Profile setup pending.</p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}