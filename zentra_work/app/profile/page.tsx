"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { kycService } from "@/services/kyc.service";
import type { KycProfile } from "@/types/kyc";
import { notificationService } from "@/services/notification.service";import {
  useClientOverview,
} from "@/hooks/use-client-overview";
import {
  Bell,
  Check,
  Copy,
  Edit3,
  Gift,
  Settings,
  ShieldCheck,
  ChevronRight,
  X,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", src: "/images/profile-dashboard.png" },
  { href: "/cards", src: "/images/profile-profile.png" },
  { href: "/profile", src: "/images/profile-transactions.png", active: true },
  { href: "/wallet", src: "/images/profile-investment.png" },
  { href: "/transactions", src: "/images/profile-more.png" },
];

export default function ProfilePage() {
  const [copied, setCopied] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [redeemOpen, setRedeemOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const {
  unreadNotificationCount,
} = useClientOverview();

  const user = useAuthStore((state) => state.user);
  const [kyc, setKyc] = useState<KycProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "Not provided",
    address: "Complete your KYC to add an address",
    donationCode: "Not available",
  });

  useEffect(() => {
    setProfile((current) => ({
      ...current,
      name: user?.full_name || "ZentraBank Client",
      email: user?.email || "",
      phone: user?.phone || "Not provided",
    }));

    let active = true;
    kycService.getMine()
      .then((result) => {
        if (!active) return;
        setKyc(result);
        if (result) {
          setProfile((current) => ({
            ...current,
            name: [result.first_name, result.middle_name, result.last_name].filter(Boolean).join(" "),
            phone: result.phone_number,
            address: [result.residential_address, result.city, result.state_region, result.country].filter(Boolean).join(", "),
          }));
        }
      })
      .finally(() => active && setProfileLoading(false));

    return () => { active = false; };
  }, [user]);

  const [prefs, setPrefs] = useState({
    email: true,
    sms: true,
    push: true,
  });

  useEffect(() => {
  let active = true;

  const loadUnreadNotifications = async () => {
    try {
      const notifications =
        await notificationService.list();

      if (!active) return;

      const unreadCount =
        notifications.filter(
          (notification) =>
            !Boolean(notification.is_read),
        ).length;

      setUnreadNotifications(unreadCount);
    } catch (error) {
      console.error(
        "Unable to load unread notifications:",
        error,
      );
    }
  };

  void loadUnreadNotifications();

  return () => {
    active = false;
  };
}, []);
  const copyDonationCode = async () => {
    if (profile.donationCode === "Not available") return;
    await navigator.clipboard.writeText(profile.donationCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <main className="min-h-screen bg-[#E7EBF0] pb-24 text-[#3f3f3f] lg:pb-10">
      {/* <DesktopFloatingNav /> */}

      <section className="mx-auto max-w-[430px] overflow-hidden lg:max-w-[1180px] lg:px-8 lg:py-10">
        <div className="h-8 bg-[#E7EBF0] lg:hidden" />

        <div className="px-5 pt-3 lg:rounded-[28px] lg:bg-white lg:p-6 lg:shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/images/profile-avatar.png"
                alt={profile.name}
                width={58}
                height={58}
                className="rounded-full object-cover lg:h-[72px] lg:w-[72px]"
              />

              <div>
                <h1 className="font-lato text-[12px] font-bold text-[#1f1f1f]/80 lg:text-[22px]">
                  {profile.name}
                </h1>

                <p className="mt-1 text-[12px] font-semibold text-[#27AE60] lg:text-[14px]">
                  {profileLoading ? "Checking verification…" : kycStatusLabel(kyc?.status)}
                </p>
              </div>
            </div>

            <div className="mt-1 flex items-center gap-2 text-[#2E8B57]">
             <Link
  href="/notifications"
  aria-label="Notifications"
  className="relative grid h-9 w-9 place-items-center rounded-full bg-white shadow-sm lg:bg-[#E7EBF0]"
>
  <Bell size={18} />

  {unreadNotificationCount > 0 && (
    <span className="absolute -right-1 -top-1 grid min-h-[16px] min-w-[16px] place-items-center rounded-full bg-red-500 px-1 text-[9px] font-bold leading-none text-white">
      {unreadNotificationCount > 99
        ? "99+"
        : unreadNotificationCount}
    </span>
  )}
</Link>

              <Link
                href="/settings"
                className="grid h-9 w-9 place-items-center rounded-full bg-white shadow-sm lg:bg-[#E7EBF0]"
              >
                <Settings size={20} />
              </Link>

              <Link
                href="/legal-and-compliance"
                className="grid h-9 w-9 place-items-center rounded-full bg-white shadow-sm lg:bg-[#E7EBF0]"
              >
                <ShieldCheck size={20} className="text-[#1c62ff]" />
              </Link>
            </div>
          </div>
        </div>

        <div className="lg:mt-6 lg:grid lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-span-7 lg:space-y-6">
            <section className="px-5 pt-5 lg:rounded-[28px] lg:bg-white lg:p-6 lg:shadow-sm">
              <h2 className="text-[14px] font-bold lg:text-[18px]">
                Contact details:
              </h2>

              <div className="mt-2 grid grid-cols-[1fr_120px] gap-3 lg:grid-cols-[1fr_180px] lg:gap-6">
                <div className="rounded-[4px] bg-[#2E8B57] px-3 py-3 text-white shadow-md lg:rounded-[20px] lg:p-5">
                  <div className="flex justify-between gap-2">
                    <div className="space-y-2 font-lato text-[11px] font-medium leading-tight lg:text-[14px] lg:leading-6">
                      <p>{profile.email}</p>
                      <p>{profile.phone}</p>
                      <p>{profile.address}</p>
                    </div>

                    <button onClick={() => setEditOpen(true)}>
                      <Edit3 size={17} />
                    </button>
                  </div>

                  <Link
                    href="/profile/kyc"
                    className="ml-auto mt-3 flex h-[28px] w-fit items-center rounded-full border border-amber-200 bg-white px-5 text-[11px] font-semibold text-[#1f1f1f]/80 lg:h-[36px] lg:text-[13px]"
                  >
                    {kyc?.status === "approved" ? "KYC Approved" : kyc?.status === "submitted" || kyc?.status === "under_review" ? "KYC In Review" : kyc?.status === "rejected" ? "Review KYC" : "Complete KYC"}
                  </Link>
                </div>

                <div className="relative h-[141px] lg:h-[190px]">
                  <Image
                    src="/images/profile-setting.png"
                    alt="Profile illustration"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            </section>

            <section className="mt-4 bg-gradient-to-b from-[#A7C7E7] to-white px-5 py-3 lg:mt-0 lg:rounded-[28px] lg:p-6 lg:shadow-sm">
              <h2 className="text-[14px] font-bold text-[#1f1f1f]/80 lg:text-[18px]">
                Frequently Asked Questions
              </h2>

              <div className="mt-3 grid grid-cols-[120px_1fr] items-center gap-2 lg:grid-cols-[180px_1fr] lg:gap-6">
                <button
                  onClick={copyDonationCode}
                  className="flex items-center gap-3 text-[12px] font-semibold text-[#1f1f1f]/80 lg:text-[18px]"
                >
                  <span>{profile.donationCode}</span>
                  {copied ? (
                    <Check size={16} className="text-green-600" />
                  ) : (
                    <Copy size={16} className="text-[#38a474]" />
                  )}
                </button>

                <div>
                  <p className="text-center font-lato text-[12px] leading-[12px] text-[#1f1f1f]/80 lg:text-[14px] lg:leading-5">
                    You can request for or redeem financial donations. Tap the
                    button to redeem....
                  </p>

                  <div className="flex justify-end">
                    <button
                      onClick={() => setRedeemOpen(true)}
                      className="mt-2 flex h-[24px] w-[162px] items-center justify-center gap-2 rounded-full bg-[#2563EB] font-lato text-[12px] font-semibold text-white lg:h-[38px] lg:w-[210px] lg:text-[14px]"
                    >
                      Redeem donations
                      <Gift size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className="px-5 pt-4 lg:rounded-[28px] lg:bg-white lg:p-6 lg:shadow-sm">
              <h2 className="font-sf-condensed text-[14px] font-bold text-[#1f1f1f]/80 lg:text-[18px]">
                Communication preference:
              </h2>

              <div className="mt-2 rounded-[4px] bg-[#2563EB] p-1 font-lato text-white shadow-md lg:rounded-[18px] lg:p-3">
                <div className="grid grid-cols-2 gap-1 rounded-[10px]">
                  <Preference
                    label="email"
                    checked={prefs.email}
                    onClick={() =>
                      setPrefs({ ...prefs, email: !prefs.email })
                    }
                  />

                  <Preference
                    label="sms"
                    checked={prefs.sms}
                    onClick={() => setPrefs({ ...prefs, sms: !prefs.sms })}
                  />
                </div>

                <div className="mt-1 rounded-[10px]">
                  <Preference
                    label="push notifications"
                    checked={prefs.push}
                    onClick={() => setPrefs({ ...prefs, push: !prefs.push })}
                    wide
                  />
                </div>
              </div>
            </section>
          </div>

          <aside className="lg:col-span-5 lg:space-y-6">
            <section className="mt-4 flex h-[92px] overflow-hidden bg-white lg:mt-0 lg:h-[190px] lg:rounded-[28px] lg:shadow-sm">
              <div className="w-[47%] px-5 py-3 lg:flex lg:flex-col lg:justify-center lg:px-8">
                <h2 className="font-heading text-[24px] font-black leading-[26px] text-[#1f1f1f]/80 lg:text-[42px] lg:leading-[44px]">
                  Glowing
                  <br />
                  <span className="pl-10">Season</span>
                </h2>

                <p className="mt-2 text-[11px] font-semibold text-[#1f1f1f]/60 lg:text-[14px]">
                  Offers that never fail!
                </p>
              </div>

              <div className="relative flex-1 rounded-tl-full">
                <Image
                  src="/images/glowing-season.png"
                  alt="Promo illustration"
                  fill
                  className="object-contain"
                />
              </div>
            </section>

            <section className="space-y-2 px-5 pt-7 font-roboto text-[14px] text-[#1f1f1f]/80 lg:rounded-[28px] lg:bg-white lg:p-6 lg:shadow-sm">
              <MenuItem title="Settings & Support" href="/settings" />
              <MenuItem title="Profile & Preferences" href="/profile-setup" />
              <MenuItem
                title="Security & Privacy"
                href="/legal-and-compliance"
              />
              <MenuItem
                title="Messages & Notifications"
                href="/notifications"
              />

              <Link
                href="/dashboard"
                className="mt-6 flex h-[48px] w-full items-center justify-center rounded-[12px] bg-[#2E8B57] text-[15px] font-bold text-white shadow-lg transition hover:bg-[#27794b]"
              >
                Go to Dashboard
              </Link>
            </section>
          </aside>
        </div>
      </section>

      <div className="lg:hidden">
        <nav className="fixed bottom-0 left-1/2 z-50 flex w-full max-w-[430px] -translate-x-1/2 items-center justify-between bg-white/90 px-4 py-2 shadow-[0_-8px_25px_rgba(0,0,0,0.12)] backdrop-blur">
          <BottomItem href="/dashboard" src="/images/profile-dashboard.png" />
          <BottomItem href="/cards" src="/images/profile-profile.png" />
          <BottomItem
            href="/profile"
            src="/images/profile-transactions.png"
            active
          />
          <BottomItem href="/wallet" src="/images/profile-investment.png" />
          <BottomItem href="/transactions" src="/images/profile-more.png" />
        </nav>
      </div>

      {editOpen && (
        <EditProfileModal
          profile={profile}
          setProfile={setProfile}
          onClose={() => setEditOpen(false)}
        />
      )}

      {redeemOpen && (
        <Popup title="Redeem Donations" onClose={() => setRedeemOpen(false)}>
          <p className="text-sm text-[#555]">
            Donation redemption will be connected to your backend later.
          </p>

          <button
            onClick={() => setRedeemOpen(false)}
            className="mt-5 h-[42px] w-full rounded-xl bg-[#2563eb] text-sm font-bold text-white"
          >
            Continue
          </button>
        </Popup>
      )}

      {copied && (
        <div className="fixed left-1/2 top-6 z-[100] -translate-x-1/2 rounded-full bg-black px-5 py-2 text-xs font-semibold text-white">
          Copied successfully
        </div>
      )}
    </main>
  );
}

function Preference({
  label,
  checked,
  onClick,
  wide = false,
}: {
  label: string;
  checked: boolean;
  onClick: () => void;
  wide?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex h-[25px] items-center justify-between rounded-[3px] bg-[#3977f5] px-2 text-[12px] font-medium text-white lg:h-[42px] lg:rounded-[12px] lg:px-4 lg:text-[14px] ${
        wide ? "w-full" : ""
      }`}
    >
      <span>{label}</span>

      <span
        className={`relative h-[13px] w-[25px] rounded-full transition lg:h-[18px] lg:w-[36px] ${
          checked ? "bg-white" : "bg-white/40"
        }`}
      >
        <span
          className={`absolute top-[2px] h-[9px] w-[9px] rounded-full bg-[#3977f5] transition lg:h-[14px] lg:w-[14px] ${
            checked ? "right-[2px]" : "left-[2px]"
          }`}
        />
      </span>
    </button>
  );
}

function EditProfileModal({
  profile,
  setProfile,
  onClose,
}: {
  profile: any;
  setProfile: (profile: any) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState(profile);

  const saveChanges = () => {
    setProfile(form);
    onClose();
  };

  return (
    <Popup title="Edit Contact Details" onClose={onClose}>
      <div className="space-y-3">
        <Input
          value={form.email}
          onChange={(value) => setForm({ ...form, email: value })}
          placeholder="Email"
        />

        <Input
          value={form.phone}
          onChange={(value) => setForm({ ...form, phone: value })}
          placeholder="Phone"
        />

        <textarea
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          placeholder="Address"
          className="min-h-[80px] w-full rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none"
        />

        <button
          onClick={saveChanges}
          className="h-[42px] w-full rounded-xl bg-[#2563eb] text-sm font-bold text-white"
        >
          Save Changes
        </button>
      </div>
    </Popup>
  );
}

function Popup({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 px-5">
      <div className="w-full max-w-[360px] rounded-2xl bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-[#333]">{title}</h3>

          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-[42px] w-full rounded-xl border border-gray-200 px-3 text-sm outline-none"
    />
  );
}

function MenuItem({ title, href }: { title: string; href: string }) {
  return (
    <Link
      href={href}
      className="flex h-[45px] items-center justify-between rounded-[10px] bg-white px-4 text-[13px] font-semibold shadow-md transition hover:bg-[#F3FFF8] lg:h-[54px] lg:bg-[#F7FAFC] lg:text-[14px]"
    >
      {title}
      <ChevronRight size={18} className="text-[#168654]" />
    </Link>
  );
}

function BottomItem({
  href,
  src,
  active = false,
}: {
  href: string;
  src: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex h-[42px] w-[58px] items-center justify-center rounded-[15px] border-2 border-[#15834f] bg-white ${
        active ? "shadow-md" : ""
      }`}
    >
      <Image src={src} alt="Navigation icon" width={32} height={32} />
    </Link>
  );
}

// function DesktopFloatingNav() {
//   return (
//     <aside className="fixed left-8 top-1/2 z-50 hidden -translate-y-1/2 lg:block">
//       <div className="flex flex-col gap-4 rounded-[24px] border border-[#16884F]/20 bg-white/80 p-3 shadow-2xl backdrop-blur-md">
//         {navItems.map((item) => (
//           <Link
//             key={item.href}
//             href={item.href}
//             className={`flex h-[58px] w-[58px] items-center justify-center rounded-[18px] border-2 border-[#16884F] transition hover:scale-105 ${
//               item.active
//                 ? "bg-[#16884F] shadow-lg"
//                 : "bg-white hover:bg-[#F3FFF8]"
//             }`}
//           >
//             <Image
//               src={item.src}
//               alt="Navigation icon"
//               width={32}
//               height={32}
//               className={item.active ? "brightness-0 invert" : ""}
//             />
//           </Link>
//         ))}
//       </div>
//     </aside>
//   );
// }

function kycStatusLabel(status?: string) {
  switch (status) {
    case "approved": return <>Tier 3 <span className="text-[#2563EB]">Verified!</span></>;
    case "submitted": return "KYC Submitted";
    case "under_review": return "KYC Under Review";
    case "rejected": return "KYC Needs Attention";
    default: return "KYC Not Started";
  }
}
