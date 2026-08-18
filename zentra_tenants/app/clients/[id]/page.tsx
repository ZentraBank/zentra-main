"use client";

import AppShell from "@/components/layout/AppShell";
import {
  getClient,
  resetClientPassword,
  type ClientAccount,
} from "@/services/client.service";
import { getApiErrorMessage } from "@/lib/api";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowLeft,
  FileText,
  Save,
  Share2,
  UserCog,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useParams,
} from "next/navigation";

const adminSections = [
  {
    title: "Security Settings",
    items: [
      [
        "Username",
        "button",
        "Change Username",
      ],
      [
        "Password",
        "button",
        "Change Option",
      ],
      [
        "2-Factor Authentication (2FA)",
        "button",
        "View",
      ],
      [
        "Security Questions",
        "button",
        "View",
      ],
      [
        "Login Activity / Device History",
        "button",
        "Set",
      ],
      [
        "Biometric Settings (Fingerprint)",
        "button",
        "Set",
      ],
    ],
  },
  {
    title: "Notification Preferences",
    items: [
      [
        "Email Notifications (On/Off)",
        "toggle",
        "On",
      ],
      [
        "SMS Alerts (On/Off)",
        "toggle",
        "On",
      ],
      [
        "Push Notifications",
        "toggle",
        "On",
      ],
      [
        "Transaction Alerts",
        "toggle",
        "On",
      ],
      [
        "Marketing Preferences",
        "toggle",
        "On",
      ],
    ],
  },
  {
    title: "Linked Accounts & Cards",
    items: [
      [
        "Debit/Credit Cards",
        "toggle",
        "On",
      ],
      [
        "Linked Bank Accounts",
        "toggle",
        "On",
      ],
      [
        "External Wallet",
        "toggle",
        "On",
      ],
    ],
  },
  {
    title: "Transaction & Limits Settings",
    items: [
      [
        "Transaction & Limits Settings",
        "toggle",
        "On",
      ],
      [
        "Withdrawal Limit",
        "toggle",
        "On",
      ],
      [
        "Spending Limit",
        "toggle",
        "On",
      ],
      [
        "Currency Preferences",
        "currency",
        "$",
      ],
    ],
  },
  {
    title: "Support & Communication",
    items: [
      [
        "Contact Support Option",
        "toggle",
        "On",
      ],
      [
        "Live Chat Access",
        "toggle",
        "On",
      ],
      [
        "Message Center / Inbox",
        "toggle",
        "On",
      ],
      [
        "Complaint History / Tickets",
        "toggle",
        "On",
      ],
    ],
  },
  {
    title:
      "Next-of-Kin / Beneficiary Information",
    items: [
      [
        "Full Name",
        "toggle",
        "On",
      ],
      [
        "Relationship",
        "toggle",
        "On",
      ],
      [
        "Contact Details",
        "toggle",
        "On",
      ],
      [
        "Assigned Benefits / Instructions",
        "toggle",
        "On",
      ],
    ],
  },
  {
    title: "Activity & Audit Logs",
    items: [
      [
        "Login History",
        "toggle",
        "On",
      ],
      [
        "Recent Account Changes",
        "toggle",
        "On",
      ],
      [
        "Device/IP Tracking",
        "toggle",
        "On",
      ],
      [
        "Security Alerts",
        "toggle",
        "On",
      ],
    ],
  },
];

type ProfileState = {
  name: string;
  description: string;
  gender: string;
  nationality: string;

  email: string;
  phone: string;
  address: string;

  accountNumber: string;
  accountType: string;
  accountStatus: string;
  createdAt: string;

  kyc: string;
  governmentId: string;
  idNumber: string;
  verificationStatus: string;

  avatarUrl: string;
};

const emptyProfile: ProfileState = {
  name: "",
  description: "",
  gender: "",
  nationality: "",

  email: "",
  phone: "",
  address: "",

  accountNumber: "",
  accountType: "Savings",
  accountStatus: "Active",
  createdAt: "",

  kyc: "Passport",
  governmentId: "",
  idNumber: "",
  verificationStatus: "Pending",

  avatarUrl: "",
};

export default function ClientProfilePage() {
  const params = useParams<{
    id: string;
  }>();

  const clientId =
    params?.id;

  const [profile, setProfile] =
    useState<ProfileState>(
      emptyProfile,
    );

  const [accounts, setAccounts] =
    useState<ClientAccount[]>([]);

  const [selectedAccountId, setSelectedAccountId] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [loadError, setLoadError] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [
    resettingPassword,
    setResettingPassword,
  ] = useState(false);

  const [
    passwordMessage,
    setPasswordMessage,
  ] = useState("");

  const [
    passwordError,
    setPasswordError,
  ] = useState("");

  const update = (
    key: keyof ProfileState,
    value: string,
  ) => {
    setProfile((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const selectedAccount =
    useMemo(() => {
      if (!accounts.length) {
        return null;
      }

      return (
        accounts.find(
          (account) =>
            account.id ===
            selectedAccountId,
        ) || accounts[0]
      );
    }, [
      accounts,
      selectedAccountId,
    ]);

  useEffect(() => {
    if (!clientId) {
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setLoadError("");

      try {
        const data =
          await getClient(
            clientId,
          );

        if (cancelled) {
          return;
        }

        const clientAccounts =
          data.accounts || [];

        setAccounts(
          clientAccounts,
        );

        const firstAccount =
          clientAccounts[0];

        if (firstAccount) {
          setSelectedAccountId(
            firstAccount.id,
          );
        }

        setProfile({
          name:
            data.full_name ||
            [
              data.first_name,
              data.middle_name,
              data.last_name,
            ]
              .filter(Boolean)
              .join(" "),

          description: "",

          gender: "",

          nationality: "",

          email:
            data.email || "",

          phone:
            data.phone || "",

          address: "",

          accountNumber:
            firstAccount
              ?.account_number ||
            "",

          accountType:
            formatAccountType(
              firstAccount
                ?.account_type,
            ),

          accountStatus:
            formatStatus(
              firstAccount
                ?.status,
            ),

          createdAt:
            formatDate(
              firstAccount
                ?.created_at ||
                data.created_at,
            ),

          kyc:
            "Passport",

          governmentId: "",

          idNumber: "",

          verificationStatus:
            "Pending",

          avatarUrl:
            data.avatar_url ||
            "",
        });
      } catch (error) {
        if (
          !cancelled
        ) {
          setLoadError(
            getApiErrorMessage(
              error,
            ),
          );
        }
      } finally {
        if (
          !cancelled
        ) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [clientId]);

  useEffect(() => {
    if (!selectedAccount) {
      return;
    }

    setProfile((prev) => ({
      ...prev,

      accountNumber:
        selectedAccount
          .account_number ||
        "",

      accountType:
        formatAccountType(
          selectedAccount
            .account_type,
        ),

      accountStatus:
        formatStatus(
          selectedAccount
            .status,
        ),

      createdAt:
        formatDate(
          selectedAccount
            .created_at,
        ),
    }));
  }, [selectedAccount]);

  const handleResetPassword =
    async () => {
      if (!clientId) {
        return;
      }

      setPasswordMessage("");
      setPasswordError("");

      const password =
        window.prompt(
          "Enter a new password for this client.\n\nMinimum 8 characters and include at least one letter and one number.",
        );

      if (!password) {
        return;
      }

      if (
        password.length < 8
      ) {
        setPasswordError(
          "Password must be at least 8 characters.",
        );

        return;
      }

      if (
        !/[A-Za-z]/.test(
          password,
        ) ||
        !/[0-9]/.test(
          password,
        )
      ) {
        setPasswordError(
          "Password must contain at least one letter and one number.",
        );

        return;
      }

      const confirmed =
        window.confirm(
          `Reset the login password for ${profile.email}?`,
        );

      if (!confirmed) {
        return;
      }

      setResettingPassword(
        true,
      );

      try {
        await resetClientPassword(
          clientId,
          password,
        );

        setPasswordMessage(
          "Client password reset successfully.",
        );
      } catch (error) {
        setPasswordError(
          getApiErrorMessage(
            error,
          ),
        );
      } finally {
        setResettingPassword(
          false,
        );
      }
    };

  const handleSave =
    async () => {
      /*
       * General profile editing has not
       * yet been connected to a backend
       * update endpoint.
       *
       * Keep the existing Save button,
       * but do not fake persistence.
       */
      setSaving(true);

      try {
        setPasswordMessage(
          "Client profile editing will be connected to the backend separately.",
        );
      } finally {
        setSaving(false);
      }
    };

  if (loading) {
    return (
      <AppShell>
        <main className="-m-6 flex min-h-screen items-center justify-center bg-black text-white">
          <p className="text-sm text-white/60">
            Loading client...
          </p>
        </main>
      </AppShell>
    );
  }

  if (loadError) {
    return (
      <AppShell>
        <main className="-m-6 min-h-screen bg-black px-4 py-10 text-white">
          <div className="mx-auto max-w-xl rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
            <p className="font-semibold text-red-200">
              Unable to load client
            </p>

            <p className="mt-2 text-sm text-red-100/70">
              {loadError}
            </p>

            <Link
              href="/clients"
              className="mt-5 inline-flex rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black"
            >
              Back to Clients
            </Link>
          </div>
        </main>
      </AppShell>
    );
  }

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
                <ArrowLeft
                  size={21}
                />
              </Link>

              <div className="text-center">
                <h1 className="text-sm font-bold tracking-wide md:text-xl">
                  Client’s Profile
                </h1>

                <p className="hidden text-xs text-white/50 md:block">
                  Admin editable client
                  profile and account
                  control panel
                </p>
              </div>

              <button
                type="button"
                onClick={
                  handleSave
                }
                disabled={saving}
                className="flex items-center gap-2 rounded-full bg-[#2445B8] px-4 py-2 text-xs font-bold shadow-[0_0_20px_rgba(36,69,184,0.7)] disabled:opacity-50"
              >
                <Save
                  size={15}
                />

                <span className="hidden md:inline">
                  {saving
                    ? "Saving..."
                    : "Save"}
                </span>
              </button>
            </div>
          </header>

          {(passwordMessage ||
            passwordError) && (
            <div className="mx-auto max-w-7xl px-3 pt-4 md:px-8">
              {passwordMessage && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                  {
                    passwordMessage
                  }
                </div>
              )}

              {passwordError && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {
                    passwordError
                  }
                </div>
              )}
            </div>
          )}

          <div className="mx-auto grid max-w-[430px] gap-4 px-3 py-4 md:max-w-7xl md:grid-cols-[390px_1fr] md:px-8 md:py-8 xl:grid-cols-[430px_1fr]">
            <aside className="space-y-4 md:sticky md:top-24 md:self-start">
              <section className="overflow-hidden rounded-md bg-[#2445B8] p-2 shadow-[0_0_22px_rgba(36,88,232,0.7)] md:rounded-3xl md:p-5">
                <h2 className="mb-1 text-xs font-bold tracking-wide md:mb-4 md:text-sm">
                  Personal Information
                </h2>

                <div className="grid grid-cols-2 gap-2 md:block">
                  <div className="relative h-[215px] overflow-hidden rounded-sm bg-white/10 md:h-[390px] md:rounded-2xl">
                    {profile.avatarUrl ? (
                      <Image
                        src={
                          profile.avatarUrl
                        }
                        alt={
                          profile.name ||
                          "Client"
                        }
                        fill
                        priority
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-white/10">
                        <UserCog
                          size={48}
                          className="text-white/30"
                        />
                      </div>
                    )}

                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 md:p-5">
                      <input
                        value={
                          profile.name
                        }
                        onChange={(e) =>
                          update(
                            "name",
                            e.target.value,
                          )
                        }
                        className="w-full bg-transparent text-2xl font-bold text-white outline-none drop-shadow md:text-4xl"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col justify-between py-2 md:mt-4 md:gap-4">
                    <div className="space-y-2 md:space-y-3">
                      <AdminInput
                        value={
                          profile.description
                        }
                        onChange={(v) =>
                          update(
                            "description",
                            v,
                          )
                        }
                        placeholder="Client description"
                      />

                      <AdminSelect
                        value={
                          profile.gender
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
                          profile.nationality
                        }
                        onChange={(v) =>
                          update(
                            "nationality",
                            v,
                          )
                        }
                        placeholder="Nationality"
                      />
                    </div>

                    <button
                      type="button"
                      className="mt-5 flex h-[24px] w-full items-center justify-center gap-2 rounded-full bg-green text-[11px] font-medium text-[#555] shadow-[inset_0_1px_5px_rgba(0,0,0,0.25)] md:h-11 md:text-sm"
                    >
                      Share Profile

                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-green-100 md:h-6 md:w-6">
                        <Share2
                          size={13}
                          className="text-green-600 md:size-4"
                        />
                      </span>
                    </button>
                  </div>
                </div>
              </section>

              <section className="hidden rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl md:block">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2445B8]">
                    <UserCog
                      size={22}
                    />
                  </div>

                  <div>
                    <h3 className="font-bold">
                      Admin Control
                    </h3>

                    <p className="text-xs text-white/50">
                      Manage this client
                      and their account.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={
                    handleSave
                  }
                  disabled={saving}
                  className="w-full rounded-2xl bg-white py-3 text-sm font-bold text-black disabled:opacity-50"
                >
                  {saving
                    ? "Updating..."
                    : "Update Client Profile"}
                </button>
              </section>
            </aside>

            <section className="space-y-4">
              <div className="grid gap-4 xl:grid-cols-2">
                <Card title="Contact">
                  <AdminInput
                    value={
                      profile.email
                    }
                    onChange={(v) =>
                      update(
                        "email",
                        v,
                      )
                    }
                  />

                  <AdminInput
                    value={
                      profile.phone
                    }
                    onChange={(v) =>
                      update(
                        "phone",
                        v,
                      )
                    }
                    placeholder="Phone number"
                  />

                  <AdminTextarea
                    value={
                      profile.address
                    }
                    onChange={(v) =>
                      update(
                        "address",
                        v,
                      )
                    }
                    placeholder="Residential address"
                  />
                </Card>

                <Card title="Account Information">
                  {accounts.length >
                    1 && (
                    <Row label="Select Account">
                      <select
                        value={
                          selectedAccountId
                        }
                        onChange={(e) =>
                          setSelectedAccountId(
                            e.target.value,
                          )
                        }
                        className="w-full rounded-md bg-transparent px-1 text-sm text-white outline-none focus:bg-white/10 md:px-2 md:py-1"
                      >
                        {accounts.map(
                          (
                            account,
                          ) => (
                            <option
                              key={
                                account.id
                              }
                              value={
                                account.id
                              }
                              className="text-black"
                            >
                              {
                                account.account_number
                              }{" "}
                              -{" "}
                              {
                                account.account_type
                              }
                            </option>
                          ),
                        )}
                      </select>
                    </Row>
                  )}

                  <Row label="Account Number">
                    <AdminInput
                      value={
                        profile.accountNumber
                      }
                      onChange={() => {}}
                    />
                  </Row>

                  <Row label="Account Type">
                    <AdminSelect
                      value={
                        profile.accountType
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
                        "Wallet",
                      ]}
                    />
                  </Row>

                  <Row label="Account Status">
                    <AdminSelect
                      value={
                        profile.accountStatus
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

                  <Row label="Date of Account Creation">
                    <AdminInput
                      value={
                        profile.createdAt
                      }
                      onChange={() => {}}
                    />
                  </Row>

                  <Row label="KYC / Identity Verification">
                    <AdminSelect
                      value={
                        profile.kyc
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

                  <Row label="Government-issued ID">
                    <AdminInput
                      value={
                        profile.governmentId
                      }
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
                        profile.idNumber
                      }
                      onChange={(v) =>
                        update(
                          "idNumber",
                          v,
                        )
                      }
                      placeholder="Enter ID"
                    />
                  </Row>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="flex items-center gap-2 rounded-full bg-white px-4 py-1 text-xs text-gray-800"
                    >
                      <FileText
                        size={13}
                      />
                      View Documents
                    </button>
                  </div>

                  <Row label="Verification Status">
                    <AdminSelect
                      value={
                        profile.verificationStatus
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
                            key={
                              label
                            }
                            label={
                              label
                            }
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
                              <button
                                type="button"
                                disabled={
                                  label ===
                                    "Password" &&
                                  resettingPassword
                                }
                                onClick={
                                  label ===
                                  "Password"
                                    ? handleResetPassword
                                    : undefined
                                }
                                className="min-w-[126px] rounded-full bg-white px-3 py-0.5 text-xs text-gray-800 shadow-inner disabled:cursor-not-allowed disabled:opacity-50 md:py-1"
                              >
                                {label ===
                                  "Password" &&
                                resettingPassword
                                  ? "Updating..."
                                  : value}
                              </button>
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
  onChange: (
    value: string,
  ) => void;
  placeholder?: string;
}) {
  return (
    <input
      value={value}
      placeholder={
        placeholder
      }
      onChange={(e) =>
        onChange(
          e.target.value,
        )
      }
      className="w-full rounded-md bg-transparent px-1 text-sm text-white outline-none placeholder:text-white/40 focus:bg-white/10 md:px-2 md:py-1"
    />
  );
}

function AdminTextarea({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (
    value: string,
  ) => void;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      placeholder={
        placeholder
      }
      onChange={(e) =>
        onChange(
          e.target.value,
        )
      }
      rows={2}
      className="w-full resize-none rounded-md bg-transparent px-1 text-sm text-white outline-none placeholder:text-white/40 focus:bg-white/10 md:px-2 md:py-1"
    />
  );
}

function AdminSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (
    value: string,
  ) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) =>
        onChange(
          e.target.value,
        )
      }
      className="w-full rounded-md bg-transparent px-1 text-sm text-white outline-none focus:bg-white/10 md:px-2 md:py-1"
    >
      {options.map(
        (option) => (
          <option
            key={
              option ||
              "empty"
            }
            value={
              option
            }
            className="text-black"
          >
            {option ||
              "Select option"}
          </option>
        ),
      )}
    </select>
  );
}

function Toggle({
  defaultValue = "On",
}: {
  defaultValue?: string;
}) {
  const [
    enabled,
    setEnabled,
  ] = useState(
    defaultValue === "On",
  );

  return (
    <button
      type="button"
      onClick={() =>
        setEnabled(
          !enabled,
        )
      }
      className="min-w-[44px] rounded-full bg-white px-3 py-0.5 text-xs font-medium text-gray-800 shadow-inner md:py-1"
    >
      {enabled
        ? "On"
        : "Off"}
    </button>
  );
}

function CurrencySelect() {
  const [
    currency,
    setCurrency,
  ] = useState("$");

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

function formatAccountType(
  value?: string | null,
) {
  if (!value) {
    return "Savings";
  }

  return (
    value
      .charAt(0)
      .toUpperCase() +
    value.slice(1)
  );
}

function formatStatus(
  value?: string | null,
) {
  if (!value) {
    return "Active";
  }

  return (
    value
      .charAt(0)
      .toUpperCase() +
    value.slice(1)
  );
}

function formatDate(
  value?: string | null,
) {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );
}