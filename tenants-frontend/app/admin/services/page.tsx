import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Video,
  Send,
  Smartphone,
  Wifi,
  CreditCard,
  DollarSign,
  Receipt,
  Gift,
  HeartHandshake,
  Settings,
  Wallet,
  Users,
  Bell,
  MessageCircle,
  ArrowRightLeft,
  BellRing,
} from "lucide-react";

const services = [
  {
    title: "Transfer",
    icon: Send,
    href: "/services/transfer",
  },
  {
    title: "Airtime",
    icon: Smartphone,
    href: "/services/airtime",
  },
  {
    title: "Data",
    icon: Wifi,
    href: "/services/data",
  },
  {
    title: "Card lock",
    icon: CreditCard,
    href: "/services/card-lock",
  },
  {
    title: "Send money",
    icon: DollarSign,
    href: "/services/send-money",
  },
  {
    title: "Pay Bill",
    icon: Receipt,
    href: "/services/pay-bill",
  },
  {
    title: "Gift",
    icon: Gift,
    href: "/services/gift",
  },
  {
    title: "Donations",
    icon: HeartHandshake,
    href: "/services/donations",
  },
  {
    title: "Admin services",
    icon: Settings,
    href: "/services/admin-services",
  },
  {
    title: "Investment",
    icon: Wallet,
    href: "/services/investment",
  },
  {
    title: "Cards",
    icon: CreditCard,
    href: "/services/cards",
  },
  {
    title: "Bill pay",
    icon: Receipt,
    href: "/services/bill-pay",
  },
  {
    title: "Subscription",
    icon: Bell,
    href: "/services/subscription",
  },
  {
    title: "Card setting",
    icon: Settings,
    href: "/services/card-setting",
  },
  {
    title: "Next-of-kin funds",
    icon: Users,
    href: "/services/next-of-kin-funds",
  },
  {
  title: "Chat this client",
  icon: MessageCircle,
  href: "/chat",
},
{
  title: "Trans. History",
  icon: ArrowRightLeft,
  href: "/services/transaction-history",
},
{
  title: "Send notifications",
  icon: BellRing,
  href: "/services/send-notifications",
},
];

export default function ServicesPage() {
  return (
    <main className="relative min-h-[100svh] overflow-hidden bg-black text-white">
      <Image
        src="/images/Background.png"
        alt="Background"
        fill
        priority
        className="object-cover opacity-70"
      />

      <div className="relative z-10 mx-auto max-w-[430px] px-5 pb-10 pt-10 lg:max-w-6xl lg:px-10 lg:pt-16">
        <Link href="/dashboard" className="absolute left-4 top-10 text-white">
          <ArrowLeft size={18} />
        </Link>

        <div className="flex justify-end">
          <Link
            href="/help"
            className="flex items-center gap-1 rounded-full bg-white/25 px-3 py-1 text-[11px] font-semibold text-white"
          >
            How to use this website
            <Video size={13} />
          </Link>
        </div>

        <section className="mt-6 lg:grid lg:grid-cols-[1fr_1.2fr] lg:items-center lg:gap-12">
          <div>
            <h1 className="font-heading text-[38px] font-bold leading-[39px] tracking-[-0.6px] text-blue-700 [text-shadow:_0px_1px_0px_rgb(255_255_255_/_1)] lg:text-[70px] lg:leading-[76px]">
              Change what your client will see on their own account
            </h1>

            <p className="mt-4 text-[12px] font-medium leading-[15px] text-white lg:max-w-[520px] lg:text-[18px] lg:leading-[29px]">
              Select a service you want to configure and manage what appears on
              the client dashboard.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 lg:mt-0 lg:grid-cols-6 lg:gap-5">
            {services.map(({ title, icon: Icon, href }) => (
            <Link
                key={title}
                href={href}
                className="flex h-[64px] flex-col items-center justify-center rounded-md bg-[linear-gradient(180deg,#e42626,#9d0505)] p-2 shadow-[0_8px_18px_rgba(0,0,0,0.35)] transition hover:scale-[1.03] lg:h-[130px] lg:rounded-2xl"
            >
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white text-emerald-600 lg:h-14 lg:w-14 lg:rounded-xl">
                <Icon size={22} className="lg:h-8 lg:w-8" />
                </div>

                <span className="mt-1 text-center text-[10px] font-semibold leading-[11px] text-white lg:mt-3 lg:text-[14px]">
                {title}
                </span>
            </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}