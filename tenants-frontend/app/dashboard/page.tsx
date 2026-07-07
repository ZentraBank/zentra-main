import Link from "next/link";
import {
  ArrowLeft,
  Video,
  Send,
  Smartphone,
  Globe2,
  CreditCard,
  Receipt,
  Gift,
  HeartHandshake,
  Settings,
  Wallet,
  Bell,
  ArrowRightLeft,
  UsersRound,
  UserCog,
  BadgeDollarSign,
  CircleDollarSign,
} from "lucide-react";

const mainServices = [
  { title: "Send money", icon: Send, href: "/dashboard/transfer" },
  { title: "Airtime", icon: Smartphone, href: "#" },
  { title: "Data", icon: Globe2, href: "#" },
  { title: "Cards", icon: CreditCard, href: "/dashboard/card-lock" },
  { title: "Next-of-kin", icon: Receipt, href: "/nok" },
  { title: "Subscription", icon: CircleDollarSign, href: "/subscribe" },
  { title: "Investment", icon: Wallet, href: "#" },
  { title: "Donations", icon: HeartHandshake, href: "/dashboard/donation" },
  { title: "Pay Bill", icon: BadgeDollarSign, href: "#" },
  { title: "Gift", icon: Gift, href: "/dashboard/gift" },
  { title: "Card setting", icon: Settings, href: "#" },
  { title: "Notifications", icon: Bell, href: "/admin/notifications" },
];

const accountServices = [
  { title: "My Clients", icon: UsersRound, href: "/clients" },
  { title: "Me as Agent", icon: UserCog, href: "/admin/chat" },
  { title: "Account info.", icon: ArrowRightLeft, href: "/admin/accounts" },
];

function ServiceCard({
  title,
  icon: Icon,
  href,
}: {
  title: string;
  icon: React.ElementType;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="
        flex
        h-[84px]
        flex-col
        items-center
        justify-center
        rounded-[6px]
        border
        border-red-500/40
        bg-[linear-gradient(180deg,#d71919_0%,#9b0505_100%)]
        px-2
        shadow-[0_8px_18px_rgba(0,0,0,0.48),inset_0_1px_2px_rgba(255,255,255,0.25)]
        transition
        active:scale-[0.97]
        md:h-[130px]
        md:rounded-[14px]
      "
    >
      <div
        className="
          flex
          h-[45px]
          w-[45px]
          items-center
          justify-center
          rounded-[7px]
          bg-white
          text-emerald-700
          shadow-[0_4px_10px_rgba(0,0,0,0.25)]
          md:h-[62px]
          md:w-[62px]
          md:rounded-[12px]
        "
      >
        <Icon size={22} strokeWidth={2.2} className="md:h-8 md:w-8" />
      </div>

      <span className="mt-2 text-center text-[11px] font-medium leading-[12px] text-white md:text-[15px] md:font-semibold">
        {title}
      </span>
    </Link>
  );
}

export default function ServicesPage() {
  return (
    <main className="relative min-h-[100svh] overflow-x-hidden bg-black text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_18%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.13),transparent_16%)]" />

      <div className="relative z-10 mx-auto min-h-[100svh] max-w-[430px] px-5 pb-8 pt-5 md:max-w-[920px] md:px-8 lg:max-w-6xl">
        <header className="relative flex items-center justify-between">
          <Link href="/dashboard" className="text-white">
            <ArrowLeft size={22} />
          </Link>

          <Link
            href="/help"
            className="flex h-[26px] items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 text-[11px] font-semibold text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)] backdrop-blur md:h-[34px] md:text-[14px]"
          >
            How to use this website
            <Video size={13} />
          </Link>
        </header>

        <section className="mt-6 text-center md:mx-auto md:max-w-[760px]">
          <h1 className="font-heading text-[37px] font-black leading-[36px] tracking-[-0.8px] text-blue-700 [text-shadow:_0px_1px_0px_rgb(255_255_255_/_1)] md:text-[64px] md:leading-[66px]">
            Control what your client sees on their own account
          </h1>

          <p className="mx-auto mt-4 max-w-[340px] text-[13px] font-medium leading-[17px] text-white md:max-w-[620px] md:text-[18px] md:leading-[28px]">
            Here, you can select the particular service that you want to
            manipulate for your client and go straight to edit whatever you want
            your client to see on their own end.
          </p>
        </section>

        <section className="mt-6 grid grid-cols-3 gap-x-2 gap-y-4 md:mt-10 md:grid-cols-4 md:gap-5 lg:grid-cols-6">
          {mainServices.map((service) => (
            <ServiceCard key={service.title} {...service} />
          ))}
        </section>

        <section className="mt-7 text-center md:mt-12">
          <div className="flex items-center justify-center gap-4">
            <span className="hidden h-[1px] w-20 bg-red-500 md:block" />

            <h2 className="font-heading text-[23px] font-black tracking-[0.6px] text-blue-700 [text-shadow:_0px_1px_0px_rgb(255_255_255_/_1)] md:text-[42px]">
              Control my account
            </h2>

            <span className="hidden h-[1px] w-20 bg-red-500 md:block" />
          </div>

          <p className="mx-auto mt-3 max-w-[310px] text-[13px] font-medium leading-[17px] text-white md:max-w-[560px] md:text-[17px] md:leading-[26px]">
            You can control your very own account here. Just dive in to see for
            yourself.
          </p>
        </section>

        <section className="mt-4 grid grid-cols-3 gap-x-2 gap-y-4 md:mt-7 md:grid-cols-3 md:gap-5 md:px-20 lg:px-52">
          {accountServices.map((service) => (
            <ServiceCard key={service.title} {...service} />
          ))}
        </section>
      </div>
    </main>
  );
}