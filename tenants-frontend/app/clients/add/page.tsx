"use client";

import AppShell from "@/components/layout/AppShell";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Share2,
  Save,
  FileText,
  ShieldCheck,
  UserCog,
} from "lucide-react";
import { useState } from "react";

const blue = "#2445B8";

const adminSections = [
  {
    title: "Security Settings",
    items: [
      ["Username", "button", "Change Username"],
      ["Password", "button", "Change Option"],
      ["2-Factor Authentication (2FA)", "button", "View"],
      ["Security Questions", "button", "View"],
      ["Login Activity / Device History", "button", "Set"],
      ["Biometric Settings (Fingerprint)", "button", "Set"],
    ],
  },
  {
    title: "Notification Preferences",
    items: [
      ["Email Notifications (On/Off)", "toggle", "On"],
      ["SMS Alerts (On/Off)", "toggle", "On"],
      ["Push Notifications", "toggle", "On"],
      ["Transaction Alerts", "toggle", "On"],
      ["Marketing Preferences", "toggle", "On"],
    ],
  },
  {
    title: "Linked Accounts & Cards",
    items: [
      ["Debit/Credit Cards", "toggle", "On"],
      ["Linked Bank Accounts", "toggle", "On"],
      ["External Wallet", "toggle", "On"],
    ],
  },
  {
    title: "Transaction & Limits Settings",
    items: [
      ["Transaction & Limits Settings", "toggle", "On"],
      ["Withdrawal Limit", "toggle", "On"],
      ["Spending Limit", "toggle", "On"],
      ["Currency Preferences", "currency", "$"],
    ],
  },
  {
    title: "Support & Communication",
    items: [
      ["Contact Support Option", "toggle", "On"],
      ["Live Chat Access", "toggle", "On"],
      ["Message Center / Inbox", "toggle", "On"],
      ["Complaint History / Tickets", "toggle", "On"],
    ],
  },
  {
    title: "Next-of-Kin / Beneficiary Information",
    items: [
      ["Full Name", "toggle", "On"],
      ["Relationship", "toggle", "On"],
      ["Contact Details", "toggle", "On"],
      ["Assigned Benefits / Instructions", "toggle", "On"],
    ],
  },
  {
    title: "Activity & Audit Logs",
    items: [
      ["Login History", "toggle", "On"],
      ["Recent Account Changes", "toggle", "On"],
      ["Device/IP Tracking", "toggle", "On"],
      ["Security Alerts", "toggle", "On"],
    ],
  },
];

export default function ClientProfilePage() {
  const [profile, setProfile] = useState({
    name: "Gregory Winter",
    description: "An upcoming Philanthropist",
    gender: "Male",
    nationality: "American",
    email: "gregorywinter@yahoo.com",
    phone: "+272 4748 8487",
    address: "no. 3 cooker street, melbourne Washington DC, USA",
    accountNumber: "827 938 9889",
    accountType: "Savings",
    accountStatus: "Dormant",
    createdAt: "Mon. 14 May, 2026",
    kyc: "Passport",
    governmentId: "XXX-XXX",
    idNumber: "",
    verificationStatus: "Pending",
  });

  const update = (key: keyof typeof profile, value: string) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <AppShell>
      <main className="-m-6 min-h-screen bg-black text-white">
        <div className="min-h-screen bg-black">
          <header className="sticky top-0 z-40 border-b border-white/10 bg-black/95 px-4 py-4 backdrop-blur md:px-8">
            <div className="mx-auto flex max-w-7xl items-center justify-between">
              <Link
                href="/clients"
                className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10"
              >
                <ArrowLeft size={21} />
              </Link>

              <div className="text-center">
                <h1 className="text-sm font-bold tracking-wide md:text-xl">
                  Client’s Profile
                </h1>
                <p className="hidden text-xs text-white/50 md:block">
                  Admin editable client profile and account control panel
                </p>
              </div>

              <button className="flex items-center gap-2 rounded-full bg-[#2445B8] px-4 py-2 text-xs font-bold shadow-[0_0_20px_rgba(36,69,184,0.7)]">
                <Save size={15} />
                <span className="hidden md:inline">Save</span>
              </button>
            </div>
          </header>

          <div className="mx-auto grid max-w-[430px] gap-4 px-3 py-4 md:max-w-7xl md:grid-cols-[390px_1fr] md:px-8 md:py-8 xl:grid-cols-[430px_1fr]">
            <aside className="space-y-4 md:sticky md:top-24 md:self-start">
              <section className="overflow-hidden rounded-md bg-[#2445B8] p-2 shadow-[0_0_22px_rgba(36,88,232,0.7)] md:rounded-3xl md:p-5">
                <h2 className="mb-1 text-xs font-bold tracking-wide md:mb-4 md:text-sm">
                  Personal Information
                </h2>

                <div className="grid grid-cols-2 gap-2 md:block">
                  <div className="relative h-[215px] overflow-hidden rounded-sm bg-white/10 md:h-[390px] md:rounded-2xl">
                    <Image
                      src="/images/greg-winter.png"
                      alt="Client"
                      fill
                      priority
                      className="object-cover"
                    />

                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 md:p-5">
                      <input
                        value={profile.name}
                        onChange={(e) => update("name", e.target.value)}
                        className="w-full bg-transparent text-2xl font-bold text-white outline-none drop-shadow md:text-4xl"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col justify-between py-2 md:mt-4 md:gap-4">
                    <div className="space-y-2 md:space-y-3">
                      <AdminInput
                        value={profile.description}
                        onChange={(v) => update("description", v)}
                      />

                      <AdminSelect
                        value={profile.gender}
                        onChange={(v) => update("gender", v)}
                        options={["Male", "Female", "Other"]}
                      />

                      <AdminInput
                        value={profile.nationality}
                        onChange={(v) => update("nationality", v)}
                      />
                    </div>

                    <button className="mt-5 flex h-[24px] w-full items-center justify-center gap-2 rounded-full bg-green text-[11px] font-medium text-[#555] shadow-[inset_0_1px_5px_rgba(0,0,0,0.25)] md:h-11 md:text-sm">
                      Share Profile
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-green-100 md:h-6 md:w-6">
                        <Share2 size={13} className="text-green-600 md:size-4" />
                      </span>
                    </button>
                  </div>
                </div>
              </section>

              <section className="hidden rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl md:block">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2445B8]">
                    <UserCog size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold">Admin Control</h3>
                    <p className="text-xs text-white/50">
                      All fields are editable or settable.
                    </p>
                  </div>
                </div>

                <button className="w-full rounded-2xl bg-white py-3 text-sm font-bold text-black">
                  Update Client Profile
                </button>
              </section>
            </aside>

            <section className="space-y-4">
              <div className="grid gap-4 xl:grid-cols-2">
                <Card title="Contact">
                  <AdminInput
                    value={profile.email}
                    onChange={(v) => update("email", v)}
                  />
                  <AdminInput
                    value={profile.phone}
                    onChange={(v) => update("phone", v)}
                  />
                  <AdminTextarea
                    value={profile.address}
                    onChange={(v) => update("address", v)}
                  />
                </Card>

                <Card title="Account Information">
                  <Row label="Account Number">
                    <AdminInput
                      value={profile.accountNumber}
                      onChange={(v) => update("accountNumber", v)}
                    />
                  </Row>

                  <Row label="Account Type">
                    <AdminSelect
                      value={profile.accountType}
                      onChange={(v) => update("accountType", v)}
                      options={["Savings", "Current", "Business"]}
                    />
                  </Row>

                  <Row label="Account Status">
                    <AdminSelect
                      value={profile.accountStatus}
                      onChange={(v) => update("accountStatus", v)}
                      options={["Active", "Dormant", "Suspended", "Closed"]}
                    />
                  </Row>

                  <Row label="Date of Account Creation">
                    <AdminInput
                      value={profile.createdAt}
                      onChange={(v) => update("createdAt", v)}
                    />
                  </Row>

                  <Row label="KYC / Identity Verification">
                    <AdminSelect
                      value={profile.kyc}
                      onChange={(v) => update("kyc", v)}
                      options={["Passport", "Driver License", "National ID"]}
                    />
                  </Row>

                  <Row label="Government-issued ID">
                    <AdminInput
                      value={profile.governmentId}
                      onChange={(v) => update("governmentId", v)}
                    />
                  </Row>

                  <Row label="ID Number">
                    <AdminInput
                      value={profile.idNumber}
                      onChange={(v) => update("idNumber", v)}
                      placeholder="Enter ID"
                    />
                  </Row>

                  <div className="flex justify-end">
                    <button className="flex items-center gap-2 rounded-full bg-white px-4 py-1 text-xs text-gray-800">
                      <FileText size={13} />
                      View Documents
                    </button>
                  </div>

                  <Row label="Verification Status">
                    <AdminSelect
                      value={profile.verificationStatus}
                      onChange={(v) => update("verificationStatus", v)}
                      options={["Pending", "Verified", "Rejected"]}
                    />
                  </Row>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {adminSections.map((section) => (
                  <Card key={section.title} title={section.title}>
                    {section.items.map(([label, type, value]) => (
                      <SettingRow key={label} label={label}>
                        {type === "toggle" && <Toggle defaultValue={value} />}
                        {type === "currency" && <CurrencySelect />}
                        {type === "button" && (
                          <button className="min-w-[126px] rounded-full bg-white px-3 py-0.5 text-xs text-gray-800 shadow-inner md:py-1">
                            {value}
                          </button>
                        )}
                      </SettingRow>
                    ))}
                  </Card>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </AppShell>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-md bg-[#2445B8] p-2 text-white shadow-[0_0_18px_rgba(36,88,232,0.55)] md:rounded-3xl md:p-5 md:shadow-[0_16px_45px_rgba(0,0,0,0.35)]">
      <h2 className="mb-2 text-xs font-bold tracking-wide md:mb-4 md:text-sm">
        {title}
      </h2>
      <div className="space-y-1.5 md:space-y-3">{children}</div>
    </section>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[1fr_1.1fr] items-center gap-2 text-sm">
      <span className="leading-tight">{label}</span>
      {children}
    </div>
  );
}

function SettingRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-2 text-sm">
      <span className="leading-tight">{label}</span>
      {children}
    </div>
  );
}

function AdminInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md bg-transparent px-1 text-sm text-white outline-none placeholder:text-white/40 focus:bg-white/10 md:px-2 md:py-1"
    />
  );
}

function AdminTextarea({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={2}
      className="w-full resize-none rounded-md bg-transparent px-1 text-sm text-white outline-none focus:bg-white/10 md:px-2 md:py-1"
    />
  );
}

function AdminSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md bg-transparent px-1 text-sm text-white outline-none focus:bg-white/10 md:px-2 md:py-1"
    >
      {options.map((option) => (
        <option key={option} className="text-black">
          {option}
        </option>
      ))}
    </select>
  );
}

function Toggle({ defaultValue = "On" }: { defaultValue?: string }) {
  const [enabled, setEnabled] = useState(defaultValue === "On");

  return (
    <button
      onClick={() => setEnabled(!enabled)}
      className="min-w-[44px] rounded-full bg-white px-3 py-0.5 text-xs font-medium text-gray-800 shadow-inner md:py-1"
    >
      {enabled ? "On" : "Off"}
    </button>
  );
}

function CurrencySelect() {
  const [currency, setCurrency] = useState("$");

  return (
    <select
      value={currency}
      onChange={(e) => setCurrency(e.target.value)}
      className="w-[72px] rounded-full bg-white px-3 py-0.5 text-xs text-gray-800 outline-none shadow-inner md:py-1"
    >
      <option>$</option>
      <option>£</option>
      <option>€</option>
      <option>₦</option>
    </select>
  );
}