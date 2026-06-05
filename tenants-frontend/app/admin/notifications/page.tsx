import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Gift,
  Landmark,
  FileWarning,
  CornerDownRight,
  Search,
  Filter,
} from "lucide-react";

const notifications = [
  {
    icon: Gift,
    color: "text-blue-400",
    bg: "bg-blue-500/15",
    tag: "Donation",
    text: "Creg Mack has just made a new donation request Of $40,000,000",
    title: "New Donation Request!",
  },
  {
    icon: Gift,
    color: "text-indigo-400",
    bg: "bg-indigo-500/15",
    tag: "OTP",
    text: "Creg Mack is requesting for Donated funds redemption OTP to access funds",
    title: "Redemption Request!",
  },
  {
    icon: Gift,
    color: "text-purple-400",
    bg: "bg-purple-500/15",
    tag: "Gifted Funds",
    text: "Creg Mack is requesting for Gifted funds redemption OTP to access funds",
    title: "Redemption Request!",
  },
  {
    icon: Landmark,
    color: "text-emerald-400",
    bg: "bg-emerald-500/15",
    tag: "Virtual Card",
    text: "Creg Mack is chatting you for help with Virtual Card Purchase",
    title: "Virtual Card!",
  },
  {
    icon: FileWarning,
    color: "text-orange-400",
    bg: "bg-orange-500/15",
    tag: "Complaint",
    text: "Creg Mack is chatting you for help their account. Please pay urgent attention",
    title: "Complain",
  },
  {
    icon: CornerDownRight,
    color: "text-red-400",
    bg: "bg-red-500/15",
    tag: "Next of kin",
    text: "Creg Mack is chatting you for help with redeeming next-of-kin funds",
    title: "Next-of-kin",
  },
];

export default function NotificationPage() {
  return (
    <main className="min-h-screen bg-black text-white md:bg-[radial-gradient(circle_at_top,#1f2937_0%,#050505_48%,#000_100%)]">
      <div className="mx-auto min-h-screen max-w-[430px] border-x border-white/10 px-2 pb-10 pt-10 md:max-w-none md:border-0 md:px-8 md:py-8 lg:px-12">
        <header className="mb-4 flex items-center justify-between md:mb-8">
          <Link
            href="/dashboard"
            className="text-white md:flex md:h-11 md:w-11 md:items-center md:justify-center md:rounded-full md:bg-white/10 md:backdrop-blur md:ring-1 md:ring-white/10"
          >
            <ArrowLeft size={18} />
          </Link>

          <div className="text-center md:text-left">
            <h1 className="text-[13px] font-bold md:text-3xl">
              Notification
            </h1>
            <p className="hidden text-sm text-gray-400 md:block">
              Manage client alerts, requests, and automated notifications.
            </p>
          </div>

          <div className="w-[18px] md:w-11" />
        </header>

        <div className="mx-auto grid max-w-[1180px] gap-6 lg:grid-cols-[360px_1fr]">
          <aside className="space-y-4">
            <section className="rounded-md bg-[#a7a7a7] p-2 md:rounded-[28px] md:bg-[#151515] md:p-6 md:ring-1 md:ring-white/10">
              <h2 className="mb-2 text-[12px] font-bold text-black md:mb-4 md:text-lg md:text-white">
                Push notifications to clients
              </h2>

              <button className="flex w-full items-center gap-3 rounded-md bg-[#cce7ff] px-3 py-3 text-left shadow-[0_0_8px_rgba(255,255,255,0.45)] transition hover:scale-[1.01] md:rounded-2xl md:bg-gradient-to-br md:from-blue-600 md:to-indigo-700 md:px-5 md:py-5 md:text-white md:shadow-lg md:shadow-blue-900/20">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/90 text-green-600 md:text-blue-600">
                  <Bell size={22} />
                </span>

                <div className="flex-1">
                  <h3 className="text-[16px] font-black text-[#2447d8] md:text-xl md:text-white">
                    Push a Notification
                  </h3>
                  <p className="text-[11px] leading-tight text-gray-600 md:mt-1 md:text-sm md:text-blue-100">
                    Remind or compel your clients to take action on any service.
                  </p>
                </div>

                <ArrowRight className="text-gray-500 md:text-white" size={20} />
              </button>
            </section>

            <section className="hidden rounded-[28px] bg-[#151515] p-6 ring-1 ring-white/10 md:block">
              <p className="text-sm font-semibold text-gray-400">
                Notification summary
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-3xl font-black text-white">6</p>
                  <p className="text-xs text-gray-400">Default alerts</p>
                </div>

                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-3xl font-black text-white">3</p>
                  <p className="text-xs text-gray-400">High priority</p>
                </div>
              </div>
            </section>
          </aside>

          <section className="rounded-md bg-[#a7a7a7] p-2 md:rounded-[28px] md:bg-[#151515] md:p-6 md:ring-1 md:ring-white/10">
            <div className="mb-2 flex items-center justify-between md:mb-6">
              <h2 className="text-[12px] font-bold text-black md:text-xl md:text-white">
                Default Notifications
              </h2>

              <div className="hidden items-center gap-2 md:flex">
                <button className="flex h-10 items-center gap-2 rounded-full bg-white/10 px-4 text-sm text-gray-300">
                  <Search size={16} />
                  Search
                </button>

                <button className="flex h-10 items-center gap-2 rounded-full bg-blue-600 px-4 text-sm text-white">
                  <Filter size={16} />
                  Filter
                </button>
              </div>
            </div>

            <div className="grid gap-2 md:gap-4 xl:grid-cols-2">
              {notifications.map((item, index) => {
                const Icon = item.icon;

                return (
                  <button
                    key={index}
                    className="group flex min-h-[64px] items-center gap-3 rounded-md bg-white px-3 py-2 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl md:min-h-[132px] md:rounded-3xl md:border md:border-white/10 md:bg-[#202020] md:px-5 md:py-5"
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl md:h-12 md:w-12 ${item.bg}`}
                    >
                      <Icon className={item.color} size={22} />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="hidden md:mb-2 md:flex md:items-center md:justify-between">
                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-gray-300">
                          {item.tag}
                        </span>

                        <ArrowRight
                          size={17}
                          className="text-gray-500 transition group-hover:translate-x-1 group-hover:text-blue-400"
                        />
                      </div>

                      <p className="text-[11px] leading-tight text-gray-500 md:text-sm md:leading-relaxed md:text-gray-400">
                        {item.text}
                      </p>

                      <h3 className="text-[16px] font-black leading-tight text-[#2447d8] md:mt-2 md:text-xl md:text-blue-400">
                        {item.title}
                      </h3>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}