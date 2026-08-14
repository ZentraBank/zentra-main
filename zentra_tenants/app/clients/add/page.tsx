"use client";

import AppShell from "@/components/layout/AppShell";
import {
  createClient,
  uploadClientAvatar,
} from "@/services/client.service";
import { getApiErrorMessage } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Upload,
  FileText,
  UserPlus,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const adminSections = [
  {
    title: "Security Settings",
    items: [
      ["Username", "button", "Set Username"],
      ["Password", "button", "Set Password"],
      ["2-Factor Authentication", "toggle", "Off"],
      ["Security Questions", "button", "Set"],
      ["Biometric Settings", "toggle", "Off"],
    ],
  },
  {
    title: "Notification Preferences",
    items: [
      ["Email Notifications", "toggle", "On"],
      ["SMS Alerts", "toggle", "On"],
      ["Push Notifications", "toggle", "On"],
      ["Transaction Alerts", "toggle", "On"],
      ["Marketing Preferences", "toggle", "Off"],
    ],
  },
  {
    title: "Linked Accounts & Cards",
    items: [
      ["Debit/Credit Cards", "toggle", "Off"],
      ["Linked Bank Accounts", "toggle", "Off"],
      ["External Wallet", "toggle", "Off"],
    ],
  },
  {
    title: "Transaction & Limits Settings",
    items: [
      ["Transfer Limit", "toggle", "On"],
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
      ["Message Center", "toggle", "On"],
      ["Complaint History", "toggle", "Off"],
    ],
  },
  {
    title: "Next-of-Kin / Beneficiary",
    items: [
      ["Full Name", "input", ""],
      ["Relationship", "input", ""],
      ["Contact Details", "input", ""],
      ["Assigned Benefits", "input", ""],
    ],
  },
];

export default function AddClientPage() {
  const router = useRouter();
  const [client, setClient] = useState({
    name: "",
    description: "",
    gender: "",
    nationality: "",
    email: "",
    phone: "",
    address: "",

    password: "",
    generateTemporaryPassword: true,

    accountNumber: "",
    accountType: "Savings",
    accountStatus: "Active",
    createdAt: "",

    kyc: "Passport",
    governmentId: "",
    idNumber: "",
    verificationStatus: "Pending",
  });

  const [profilePhoto, setProfilePhoto] =
    useState<File | null>(null);

  const [documents, setDocuments] =
    useState<File[]>([]);

  const [saving, setSaving] =
    useState(false);

  const [saveError, setSaveError] =
    useState("");

  const [createdCredentials, setCreatedCredentials] =
    useState<{
      email: string;
      temporaryPassword?: string;
      accountNumber?: string;
    } | null>(null);

  const profilePreview = useMemo(() => {
    if (!profilePhoto) {
      return null;
    }

    return URL.createObjectURL(profilePhoto);
  }, [profilePhoto]);

  const update = (
    key: keyof typeof client,
    value: string | boolean,
  ) => {
    setClient((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

const handleSave = async () => {
  const names = client.name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (names.length < 2) {
    setSaveError(
      "Enter the client's first and last name.",
    );
    return;
  }

  if (!client.email.trim()) {
    setSaveError(
      "Enter the client's email address.",
    );
    return;
  }

  if (
    !client.generateTemporaryPassword &&
    client.password.trim().length < 8
  ) {
    setSaveError(
      "Client password must be at least 8 characters.",
    );
    return;
  }

  const firstName = names[0];

  const lastName =
    names[names.length - 1];

  const middleName =
    names.length > 2
      ? names.slice(1, -1).join(" ")
      : undefined;

  setSaving(true);
  setSaveError("");
  setCreatedCredentials(null);

  try {
    const result = await createClient({
      firstName,
      middleName,
      lastName,

      email:
        client.email
          .trim()
          .toLowerCase(),

      phone:
        client.phone.trim() ||
        undefined,

      ...(!client.generateTemporaryPassword
        ? {
            password:
              client.password.trim(),
          }
        : {}),

      description:
        client.description.trim() ||
        undefined,

      gender:
        client.gender ||
        undefined,

      nationality:
        client.nationality.trim() ||
        undefined,

      address:
        client.address.trim() ||
        undefined,

      kycType:
        client.kyc ||
        undefined,

      governmentId:
        client.governmentId.trim() ||
        undefined,

      idNumber:
        client.idNumber.trim() ||
        undefined,

      verificationStatus:
        client.verificationStatus
          .toLowerCase(),

      account: {
        accountName:
          client.name.trim(),

        accountType:
          client.accountType
            .toLowerCase() as
            | "savings"
            | "current"
            | "investment",

        currency: "USD",

        status:
          client.accountStatus
            .toLowerCase() as
            | "active"
            | "dormant"
            | "suspended"
            | "closed",
      },
    });

    /*
     * Upload profile photo if one
     * was selected.
     */
    if (profilePhoto) {
      try {
        await uploadClientAvatar(
          result.client.id,
          profilePhoto,
        );
      } catch (avatarError) {
        /*
         * The client has already been
         * created at this point.
         */
        setSaveError(
          `Client was created, but the profile picture could not be uploaded: ${getApiErrorMessage(
            avatarError,
          )}`,
        );

        /*
         * If a temporary password was
         * generated, still show it.
         */
        if (result.temporaryPassword) {
          setCreatedCredentials({
            email:
              result.client.email,

            temporaryPassword:
              result.temporaryPassword,

            accountNumber:
              result.account
                ?.account_number,
          });
        }

        return;
      }
    }

    if (
      result.account
        ?.account_number
    ) {
      update(
        "accountNumber",
        result.account.account_number,
      );
    }

    /*
     * Generated password:
     * stay on page so admin can copy it.
     */
    if (result.temporaryPassword) {
      setCreatedCredentials({
        email:
          result.client.email,

        temporaryPassword:
          result.temporaryPassword,

        accountNumber:
          result.account
            ?.account_number,
      });

      return;
    }

    /*
     * Admin supplied the password:
     * nothing sensitive needs displaying,
     * so go directly back to clients.
     */
    router.push("/clients");
    router.refresh();
  } catch (error) {
    setSaveError(
      getApiErrorMessage(error),
    );
  } finally {
    setSaving(false);
  }
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
                  Add Client
                </h1>

                <p className="hidden text-xs text-white/50 md:block">
                  Create a new client profile and account settings
                </p>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-full bg-[#2445B8] px-4 py-2 text-xs font-bold shadow-[0_0_20px_rgba(36,69,184,0.7)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={15} />

                <span className="hidden md:inline">
                  {saving
                    ? "Saving..."
                    : "Save Client"}
                </span>
              </button>
            </div>
          </header>

          <div className="mx-auto grid max-w-[430px] gap-4 px-3 py-4 md:max-w-7xl md:grid-cols-[390px_1fr] md:px-8 md:py-8 xl:grid-cols-[430px_1fr]">
            <aside className="space-y-4 md:sticky md:top-24 md:self-start">
              <section className="overflow-hidden rounded-md bg-[#2445B8] p-2 shadow-[0_0_22px_rgba(36,88,232,0.7)] md:rounded-3xl md:p-5">
                <h2 className="mb-2 text-xs font-bold tracking-wide md:mb-4 md:text-sm">
                  Personal Information
                </h2>

                <div className="grid grid-cols-2 gap-2 md:block">
                  <div className="relative flex h-[215px] items-center justify-center overflow-hidden rounded-sm bg-white/10 md:h-[390px] md:rounded-2xl">
                    <Image
                      src={
                        profilePreview ||
                        "/images/anna.png"
                      }
                      alt="Client placeholder"
                      fill
                      unoptimized={
                        Boolean(
                          profilePreview,
                        )
                      }
                      className={`object-cover ${
                        profilePreview
                          ? "opacity-100"
                          : "opacity-30"
                      }`}
                    />

                    <label className="relative z-10 flex cursor-pointer flex-col items-center gap-2 rounded-2xl bg-black/40 px-5 py-4 text-xs font-semibold backdrop-blur">
                      <Upload size={22} />
                      Upload Photo

                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file =
                            e.target
                              .files?.[0];

                          if (!file) {
                            return;
                          }

                          setProfilePhoto(
                            file,
                          );
                        }}
                      />
                    </label>
                  </div>

                  <div className="flex flex-col justify-between py-2 md:mt-4 md:gap-4">
                    <div className="space-y-2 md:space-y-3">
                      <AdminInput
                        value={
                          client.name
                        }
                        placeholder="Full name"
                        onChange={(v) =>
                          update(
                            "name",
                            v,
                          )
                        }
                      />

                      <AdminInput
                        value={
                          client.description
                        }
                        placeholder="Client description"
                        onChange={(v) =>
                          update(
                            "description",
                            v,
                          )
                        }
                      />

                      <AdminSelect
                        value={
                          client.gender
                        }
                        onChange={(v) =>
                          update(
                            "gender",
                            v,
                          )
                        }
                        options={[
                          "",
                          "Male",
                          "Female",
                          "Other",
                        ]}
                      />

                      <AdminInput
                        value={
                          client.nationality
                        }
                        placeholder="Nationality"
                        onChange={(v) =>
                          update(
                            "nationality",
                            v,
                          )
                        }
                      />
                    </div>

                    <button className="mt-5 flex h-[34px] w-full items-center justify-center gap-2 rounded-full bg-white text-[11px] font-bold text-black md:h-11 md:text-sm">
                      <UserPlus
                        size={15}
                      />
                      New Client
                    </button>
                  </div>
                </div>
              </section>

              <section className="hidden rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl md:block">
                <h3 className="font-bold">
                  Client Setup
                </h3>

                <p className="mt-1 text-xs text-white/50">
                  Fill in the client details,
                  account information, and
                  default admin settings.
                </p>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="mt-5 w-full rounded-2xl bg-white py-3 text-sm font-bold text-black disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Creating Client..."
                    : "Create Client Profile"}
                </button>

                {saveError && (
                  <p className="mt-3 rounded-xl bg-red-500/15 px-3 py-2 text-xs text-red-200">
                    {saveError}
                  </p>
                )}

                <button
  type="button"
  onClick={() => {
    router.push("/clients");
    router.refresh();
  }}
  className="mt-3 w-full rounded-lg bg-white px-3 py-2 text-xs font-bold text-black"
>
  Continue to Clients
</button>
              </section>
            </aside>

            <section className="space-y-4">
              <div className="grid gap-4 xl:grid-cols-2">
                <Card title="Contact Information">
                  <AdminInput
                    value={
                      client.email
                    }
                    placeholder="Email address"
                    onChange={(v) =>
                      update(
                        "email",
                        v,
                      )
                    }
                  />

                  <AdminInput
                    value={
                      client.phone
                    }
                    placeholder="Phone number"
                    onChange={(v) =>
                      update(
                        "phone",
                        v,
                      )
                    }
                  />

                  <AdminTextarea
                    value={
                      client.address
                    }
                    placeholder="Residential address"
                    onChange={(v) =>
                      update(
                        "address",
                        v,
                      )
                    }
                  />

                  <label className="flex items-center justify-between gap-3 text-sm">
                    <span>
                      Generate temporary
                      password
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        update(
                          "generateTemporaryPassword",
                          !client.generateTemporaryPassword,
                        )
                      }
                      className={`
                        relative h-7 w-14 rounded-full transition-all duration-300
                        ${
                          client.generateTemporaryPassword
                            ? "bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)]"
                            : "bg-white/20"
                        }
                      `}
                    >
                      <span
                        className={`
                          absolute top-1 h-5 w-5 rounded-full bg-white shadow-lg
                          transition-all duration-300
                          ${
                            client.generateTemporaryPassword
                              ? "left-8"
                              : "left-1"
                          }
                        `}
                      />
                    </button>
                  </label>

                  {!client.generateTemporaryPassword && (
                    <AdminInput
                      value={
                        client.password
                      }
                      placeholder="Set client password"
                      onChange={(v) =>
                        update(
                          "password",
                          v,
                        )
                      }
                    />
                  )}
                </Card>

                <Card title="Account Information">
                  <Row label="Account Number">
                    <AdminInput
                      value={
                        client.accountNumber
                      }
                      placeholder="Generated automatically"
                      onChange={() => {}}
                    />
                  </Row>

                  <Row label="Account Type">
                    <AdminSelect
                      value={
                        client.accountType
                      }
                      onChange={(v) =>
                        update(
                          "accountType",
                          v,
                        )
                      }
                      options={[
                        "Savings",
                        "Current",
                        "Investment",
                      ]}
                    />
                  </Row>

                  <Row label="Account Status">
                    <AdminSelect
                      value={
                        client.accountStatus
                      }
                      onChange={(v) =>
                        update(
                          "accountStatus",
                          v,
                        )
                      }
                      options={[
                        "Active",
                        "Dormant",
                        "Suspended",
                        "Closed",
                      ]}
                    />
                  </Row>

                  <Row label="Date Created">
                    <AdminInput
                      value={
                        client.createdAt
                      }
                      placeholder="Generated automatically"
                      onChange={(v) =>
                        update(
                          "createdAt",
                          v,
                        )
                      }
                    />
                  </Row>

                  <Row label="KYC Type">
                    <AdminSelect
                      value={
                        client.kyc
                      }
                      onChange={(v) =>
                        update(
                          "kyc",
                          v,
                        )
                      }
                      options={[
                        "Passport",
                        "Driver License",
                        "National ID",
                      ]}
                    />
                  </Row>

                  <Row label="Government ID">
                    <AdminInput
                      value={
                        client.governmentId
                      }
                      placeholder="XXX-XXX"
                      onChange={(v) =>
                        update(
                          "governmentId",
                          v,
                        )
                      }
                    />
                  </Row>

                  <Row label="ID Number">
                    <AdminInput
                      value={
                        client.idNumber
                      }
                      placeholder="Enter ID number"
                      onChange={(v) =>
                        update(
                          "idNumber",
                          v,
                        )
                      }
                    />
                  </Row>

                  <div className="flex justify-end">
                    <label className="flex cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-1 text-xs text-gray-800">
                      <FileText
                        size={13}
                      />
                      Upload Documents

                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          const selected =
                            Array.from(
                              e.target
                                .files ||
                                [],
                            );

                          setDocuments(
                            selected,
                          );
                        }}
                      />
                    </label>
                  </div>

                  {documents.length > 0 && (
                    <div className="space-y-1 rounded-md bg-black/20 px-2 py-2 text-xs">
                      {documents.map(
                        (file) => (
                          <p
                            key={`${file.name}-${file.size}`}
                            className="truncate"
                          >
                            {file.name}
                          </p>
                        ),
                      )}
                    </div>
                  )}

                  <Row label="Verification Status">
                    <AdminSelect
                      value={
                        client.verificationStatus
                      }
                      onChange={(v) =>
                        update(
                          "verificationStatus",
                          v,
                        )
                      }
                      options={[
                        "Pending",
                        "Verified",
                        "Rejected",
                      ]}
                    />
                  </Row>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {adminSections.map(
                  (section) => (
                    <Card
                      key={
                        section.title
                      }
                      title={
                        section.title
                      }
                    >
                      {section.items.map(
                        ([
                          label,
                          type,
                          value,
                        ]) => (
                          <SettingRow
                            key={label}
                            label={label}
                          >
                            {type ===
                              "toggle" && (
                              <Toggle
                                defaultValue={
                                  value
                                }
                              />
                            )}

                            {type ===
                              "currency" && (
                              <CurrencySelect />
                            )}

                            {type ===
                              "button" && (
                              <button className="min-w-[126px] rounded-full bg-white px-3 py-0.5 text-xs text-gray-800 shadow-inner md:py-1">
                                {
                                  value
                                }
                              </button>
                            )}

                            {type ===
                              "input" && (
                              <input
                                placeholder="Enter"
                                className="w-[130px] rounded-full bg-white px-3 py-1 text-xs text-gray-800 outline-none"
                              />
                            )}
                          </SettingRow>
                        ),
                      )}
                    </Card>
                  ),
                )}
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

      <div className="space-y-1.5 md:space-y-3">
        {children}
      </div>
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
      <span className="leading-tight">
        {label}
      </span>

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
      <span className="leading-tight">
        {label}
      </span>

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
      onChange={(e) =>
        onChange(e.target.value)
      }
      className="w-full rounded-md bg-transparent px-1 text-sm text-white outline-none placeholder:text-white/45 focus:bg-white/10 md:px-2 md:py-1"
    />
  );
}

function AdminTextarea({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      placeholder={placeholder}
      onChange={(e) =>
        onChange(e.target.value)
      }
      rows={2}
      className="w-full resize-none rounded-md bg-transparent px-1 text-sm text-white outline-none placeholder:text-white/45 focus:bg-white/10 md:px-2 md:py-1"
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
      onChange={(e) =>
        onChange(e.target.value)
      }
      className="w-full rounded-md bg-transparent px-1 text-sm text-white outline-none focus:bg-white/10 md:px-2 md:py-1"
    >
      {options.map((option) => (
        <option
          key={
            option || "empty"
          }
          value={option}
          className="text-black"
        >
          {option ||
            "Select option"}
        </option>
      ))}
    </select>
  );
}

function Toggle({
  defaultValue = "On",
}: {
  defaultValue?: string;
}) {
  const [enabled, setEnabled] =
    useState(
      defaultValue === "On",
    );

  return (
    <button
      type="button"
      onClick={() =>
        setEnabled(!enabled)
      }
      className={`
        relative h-7 w-14 rounded-full transition-all duration-300
        ${
          enabled
            ? "bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)]"
            : "bg-white/20"
        }
      `}
    >
      <span
        className={`
          absolute top-1 h-5 w-5 rounded-full bg-white shadow-lg
          transition-all duration-300
          ${
            enabled
              ? "left-8"
              : "left-1"
          }
        `}
      />
    </button>
  );
}

function CurrencySelect() {
  const [currency, setCurrency] =
    useState("$");

  return (
    <select
      title="currency"
      value={currency}
      onChange={(e) =>
        setCurrency(
          e.target.value,
        )
      }
      className="w-[72px] rounded-full bg-white px-3 py-0.5 text-xs text-gray-800 outline-none shadow-inner md:py-1"
    >
      <option>$</option>
      <option>£</option>
      <option>€</option>
      <option>₦</option>
    </select>
  );
}