"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Check,
  ShieldCheck,
  UserRound,
  IdCard,
  Phone,
  Bell,
  BriefcaseBusiness,
} from "lucide-react";
import { useState } from "react";

const tabs = [
  {
    title: "Personal Information",
    icon: UserRound,
  },
  {
    title: "Identification Details",
    icon: IdCard,
  },
  {
    title: "Contact Information",
    icon: Phone,
  },
  {
    title: "Communication Preferences",
    icon: Bell,
  },
  {
    title: "Employment & Financial Information",
    icon: BriefcaseBusiness,
  },
];

const countries = [
  "Nigeria",
  "United Kingdom",
  "United States",
  "Canada",
  "Australia",
  "South Africa",
  "Ghana",
  "Kenya",
];



export default function ProfileSetupPage() {
  const [activeTab, setActiveTab] = useState("Personal Information");

  const [preferences, setPreferences] = useState({
  email: true,
  sms: true,
  push: true,
  marketing: false,
  calls: false,
});

const allChecked = Object.values(preferences).every(Boolean);

const togglePreference = (key: keyof typeof preferences) => {
  setPreferences((prev) => ({
    ...prev,
    [key]: !prev[key],
  }));
};

const checkAll = () => {
  setPreferences({
    email: true,
    sms: true,
    push: true,
    marketing: true,
    calls: true,
  });
};

const saveProfile = () => {
  console.log("Saved preferences:", preferences);
  alert("Profile saved successfully");
};

  return (
    <main
      className="min-h-screen overflow-hidden px-4 pb-10 pt-10 text-white md:px-8 md:py-10"
      style={{
        background:
          "radial-gradient(ellipse 100% 85% at 0% 100%, #d8d8d8 0%, #c91515 42%, #151515 100%)",
      }}
    >
      <div className="mx-auto w-full max-w-[1180px]">
        <div className="relative mb-5 text-center md:mb-8 md:text-left">
          <Link
            href="/dashboard"
            className="absolute left-0 top-0 text-white md:static md:mb-5 md:inline-flex md:items-center md:gap-2"
          >
            <ArrowLeft size={18} />
            <span className="hidden text-sm font-semibold md:inline">
              Back to dashboard
            </span>
          </Link>

          <p className="font-heading text-[13px] font-bold md:mt-6 md:text-2xl">
            Profile settings page
          </p>

          <p className="font-body mt-2 hidden text-sm text-white/75 md:block">
            Complete your profile information to unlock your account features.
          </p>
        </div>

        <section className="grid gap-6 md:grid-cols-[390px_1fr] xl:grid-cols-[420px_1fr]">
          <aside className="rounded-[12px] border-[4px] border-[#d6c51f] bg-black px-4 pb-6 pt-5 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-[110px] w-[110px] shrink-0 items-center justify-center rounded-full bg-[radial-gradient(circle,#f7f7f7_0%,#b9b9b9_45%,#111_78%)] md:h-[120px] md:w-[120px]">
                <Image
                  src="/images/kyc.png"
                  alt="KYC"
                  width={82}
                  height={82}
                  className="object-contain"
                  priority
                />
              </div>

              <div>
                <h1 className="font-heading text-[16px] font-extrabold text-[#6c8cff] md:text-[20px]">
                  Complete Your KYC
                </h1>
                <p className="font-body mt-2 text-[11px] font-semibold leading-[14px] text-white/80 md:text-[12px] md:leading-[17px]">
                  Completing your KYC is the only assured way of enjoying almost
                  all our Banking features.
                </p>
              </div>
            </div>

            <select className="font-body mt-5 h-[38px] w-full rounded-[20px] bg-white px-4 text-[12px] font-semibold text-black outline-none">
              <option>client category?</option>
              <option>Individual Account</option>
              <option>Student Account</option>
              <option>Business Account</option>
              <option>Premium Account</option>
              <option>Corporate Account</option>
            </select>

            <div className="mt-4 h-[84px] overflow-hidden rounded-[4px] bg-[radial-gradient(circle_at_82%_88%,#f0eef1_0%,#dfc5d5_34%,transparent_35%),linear-gradient(90deg,#c70808_0%,#c70808_62%,#d8c1cf_100%)] px-4 py-2">
              <h2 className="font-heading text-[18px] font-extrabold leading-[20px]">
                Glowing
                <br />
                Season
              </h2>
              <p className="font-body mt-1 text-[10px] font-semibold">
                Offers that never fail!
              </p>
            </div>

            <div className="mt-5 space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.title;

                return (
                  <button
                    key={tab.title}
                    type="button"
                    onClick={() => setActiveTab(tab.title)}
                    className={`flex w-full items-center justify-between rounded-[8px] px-2 py-2 text-left transition md:border md:border-white/10 ${
                      isActive
                        ? "bg-[#2458e8] text-white"
                        : "bg-transparent text-white hover:bg-white/10"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Icon size={15} className="hidden md:block" />
                      <span className="font-heading text-[12px] font-bold md:text-[13px]">
                        {tab.title}
                      </span>
                    </span>

                    {isActive ? (
                      <Check size={15} />
                    ) : (
                      <ChevronDown size={15} className="md:-rotate-90" />
                    )}
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="rounded-[18px] border border-white/25 bg-black/60 p-3 shadow-2xl backdrop-blur-md md:p-6">
            <div className="mb-5">
              <p className="font-heading text-[17px] font-extrabold md:text-[24px]">
                {activeTab}
              </p>
              <p className="font-body mt-1 text-[12px] text-white/70 md:text-[14px]">
                Fill in the required details below.
              </p>
            </div>

            {activeTab === "Personal Information" && <PersonalInformation />}
            {activeTab === "Identification Details" && <IdentificationDetails />}
            {activeTab === "Contact Information" && <ContactInformation />}
            {activeTab === "Communication Preferences" && (
              <CommunicationPreferences
                preferences={preferences}
                togglePreference={togglePreference}
                checkAll={checkAll}
                allChecked={allChecked}
              />
            )}
            {activeTab === "Employment & Financial Information" && (
              <EmploymentInformation />
            )}

            <div className="mt-8 flex flex-col gap-3 md:flex-row md:justify-end">
              <button
              type="button"
              onClick={saveProfile}
              className="font-heading h-[42px] rounded-[10px] border border-white/20 px-6 text-[14px] font-bold text-white hover:bg-white/10"
            >
              Save
            </button>

              <Link
                href="/dashboard"
                className="font-heading flex h-[42px] items-center justify-center gap-2 rounded-[10px] bg-[#2458e8] px-8 text-[14px] font-bold text-white shadow-lg transition hover:bg-[#1f4fd3]"
              >
                Go to Dashboard
                <ArrowRight size={16} />
              </Link>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

function PersonalInformation() {
  return (
    <FormGrid>
      <Field label="First Name" placeholder="Ugochukwu" required />
      <Field label="Middle Name" placeholder="Precious" />
      <Field label="Last Name" placeholder="Onah" required />
      <Field label="Date of Birth" placeholder="DD/MM/YYYY" required />
      <SelectField label="Gender" options={["Male", "Female"]} required />
      <SelectField
        label="Marital Status"
        options={["Single", "Married", "Divorced", "Widowed"]}
      />
      <SelectField label="Nationality" options={countries} required />
      <SelectField label="Country of Residence" options={countries} required />
    </FormGrid>
  );
}

function IdentificationDetails() {
  return (
    <FormGrid>
      <SelectField
        label="ID Type"
        options={[
          "Passport",
          "National ID Card",
          "Driver's License",
          "Residence Permit",
        ]}
        required
      />
      <Field label="ID Number" placeholder="Enter ID number" required />
      <Field label="Issue Date" placeholder="DD/MM/YYYY" />
      <Field label="Expiry Date" placeholder="DD/MM/YYYY" required />
      <SelectField label="Issuing Country" options={countries} required />
    </FormGrid>
  );
}

function ContactInformation() {
  return (
    <FormGrid>
      <Field label="Email Address" placeholder="fabulousonah@gmail.com" required />
      <Field label="Phone Number" placeholder="+44 7502 319935" required />
      <Field label="Alternative Phone" placeholder="Optional" />
      <Field label="Address Line 1" placeholder="Enter address" required />
      <Field label="Address Line 2" placeholder="Optional" />
      <Field label="City" placeholder="Manchester" required />
      <Field label="Postcode" placeholder="Enter postcode" required />
      <SelectField label="Country" options={countries} required />
    </FormGrid>
  );
}

function CommunicationPreferences({
  preferences,
  togglePreference,
  checkAll,
  allChecked,
}: {
  preferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
    marketing: boolean;
    calls: boolean;
  };
  togglePreference: (key: keyof typeof preferences) => void;
  checkAll: () => void;
  allChecked: boolean;
}) {
  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={checkAll}
        className={`flex w-full items-center justify-between rounded-[12px] border px-4 py-3 ${
          allChecked
            ? "border-[#2458e8] bg-[#2458e8]"
            : "border-white/15 bg-white/10"
        }`}
      >
        <span className="font-heading text-[13px] font-bold md:text-[14px]">
          Check All
        </span>

        <span
          className={`flex h-[22px] w-[22px] items-center justify-center rounded-full ${
            allChecked ? "bg-white text-[#2458e8]" : "bg-white"
          }`}
        >
          {allChecked ? "✓" : ""}
        </span>
      </button>

      <SwitchRow
        label="Email Notifications"
        enabled={preferences.email}
        onClick={() => togglePreference("email")}
      />

      <SwitchRow
        label="SMS Notifications"
        enabled={preferences.sms}
        onClick={() => togglePreference("sms")}
      />

      <SwitchRow
        label="Push Notifications"
        enabled={preferences.push}
        onClick={() => togglePreference("push")}
      />

      <SwitchRow
        label="Marketing Messages"
        enabled={preferences.marketing}
        onClick={() => togglePreference("marketing")}
      />

      <SwitchRow
        label="Phone Calls"
        enabled={preferences.calls}
        onClick={() => togglePreference("calls")}
      />
    </div>
  );
}

function EmploymentInformation() {
  return (
    <FormGrid>
      <SelectField
        label="Employment Status"
        options={["Employed", "Self-employed", "Student", "Unemployed"]}
        required
      />
      <Field
        label="Occupation"
        placeholder="Operations Performance Analyst"
        required
      />
      <Field label="Employer Name" placeholder="Enter employer name" />
      <SelectField
        label="Annual Income Range"
        options={[
          "Below £25,000",
          "£25,000 - £50,000",
          "£50,000 - £100,000",
          "Above £100,000",
        ]}
        required
      />
      <SelectField
        label="Source of Funds"
        options={[
          "Salary",
          "Business Income",
          "Investments",
          "Savings",
          "Inheritance",
          "Other",
        ]}
        required
      />
    </FormGrid>
  );
}

function FormGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
}

function Field({
  label,
  placeholder,
  required,
}: {
  label: string;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="font-heading text-[12px] font-bold md:text-[13px]">
        {label}
        {required && <span className="text-red-300"> *</span>}
      </label>

      <input
        placeholder={placeholder}
        className="font-body mt-1 h-[38px] w-full rounded-[9px] bg-white/90 px-3 text-[13px] text-black outline-none md:h-[42px] md:text-[14px]"
      />
    </div>
  );
}

function SelectField({
  label,
  options,
  required,
}: {
  label: string;
  options: string[];
  required?: boolean;
}) {
  return (
    <div>
      <label className="font-heading text-[12px] font-bold md:text-[13px]">
        {label}
        {required && <span className="text-red-300"> *</span>}
      </label>

      <select className="font-body mt-1 h-[38px] w-full rounded-[9px] bg-white/90 px-3 text-[13px] text-black outline-none md:h-[42px] md:text-[14px]">
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}

function SwitchRow({
  label,
  enabled,
  onClick,
}: {
  label: string;
  enabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-[12px] border px-4 py-3 transition ${
        enabled
          ? "border-[#2458e8] bg-[#2458e8]/90"
          : "border-white/15 bg-white/10"
      }`}
    >
      <span className="font-heading text-[13px] font-bold md:text-[14px]">
        {label}
      </span>

      <span
        className={`relative h-[26px] w-[48px] rounded-full transition ${
          enabled ? "bg-white" : "bg-white/25"
        }`}
      >
        <span
          className={`absolute top-[3px] h-[20px] w-[20px] rounded-full transition ${
            enabled
              ? "left-[25px] bg-[#2458e8]"
              : "left-[3px] bg-white"
          }`}
        />
      </span>
    </button>
  );
}