"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import PageHeader from "@/components/shared/PageHeader";
import { ApiError } from "@/src/lib/api-error";
import { platformSettingsService } from "@/src/services/platform-settings.service";
import type { PlatformSetting } from "@/src/types/platform-operations";

type SettingsSection = {
  id: string;
  title: string;
  description: string;
  settingKey: string;
  defaultValue: Record<string, unknown>;
};

const sections: SettingsSection[] = [
  {
    id: "general",
    title: "General settings",
    description:
      "Configure the platform name, support details, default currency, timezone and general behaviour.",
    settingKey: "platform.general",
    defaultValue: {
      platformName: "ZentraBank",
      supportEmail: "",
      defaultCurrency: "USD",
      timezone: "UTC",
    },
  },
  {
    id: "authentication",
    title: "Authentication",
    description:
      "Control passwords, login attempts, sessions and multi-factor authentication.",
    settingKey: "platform.authentication",
    defaultValue: {
      minimumPasswordLength: 12,
      maximumLoginAttempts: 5,
      accessTokenMinutes: 15,
      refreshTokenDays: 7,
      requireMfa: false,
    },
  },
  {
    id: "transaction-limits",
    title: "Transaction limits",
    description:
      "Configure default transfer limits and transaction restrictions.",
    settingKey: "platform.transaction_limits",
    defaultValue: {
      dailyTransferLimit: 10000,
      singleTransferLimit: 5000,
      monthlyTransferLimit: 50000,
      currency: "USD",
    },
  },
  {
    id: "notifications",
    title: "Notifications",
    description:
      "Control platform email, SMS, push and administrative alerts.",
    settingKey: "platform.notifications",
    defaultValue: {
      emailEnabled: true,
      smsEnabled: false,
      pushEnabled: true,
      notifySuperadminsOnFailure: true,
    },
  },
  {
    id: "uploads-storage",
    title: "Uploads and storage",
    description:
      "Configure file upload restrictions, supported formats and storage limits.",
    settingKey: "platform.uploads_storage",
    defaultValue: {
      maximumUploadSizeMb: 10,
      allowedFileTypes: [
        "image/jpeg",
        "image/png",
        "application/pdf",
      ],
      storageProvider: "local",
    },
  },
  {
    id: "maintenance",
    title: "Maintenance mode",
    description:
      "Temporarily restrict platform access while maintenance is being performed.",
    settingKey: "platform.maintenance",
    defaultValue: {
      enabled: false,
      message:
        "ZentraBank is temporarily unavailable while scheduled maintenance is performed.",
      allowSuperadminAccess: true,
    },
  },
  {
  id: "domains",
  title: "Domain settings",
  description:
    "Configure tenant domain purchasing, support information and custom-domain behaviour.",
  settingKey: "platform.domains",
  defaultValue: {
    purchaseUrl:
      "https://www.namecheap.com/domains/",
    purchaseLabel:
      "Buy a domain",
    supportEmail:
      "domains@zentrabank.com",
  },
},
];

export default function SystemSettingsPage() {
  const [selectedId, setSelectedId] =
    useState<string | null>(null);

  const [settings, setSettings] =
    useState<PlatformSetting[]>([]);

  const [value, setValue] = useState("{}");
  const [reason, setReason] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [message, setMessage] =
    useState<string | null>(null);

  const selectedSection = useMemo(
    () =>
      sections.find(
        (section) => section.id === selectedId
      ) ?? null,
    [selectedId]
  );

  const loadSettings = async () => {
    setLoading(true);
    setError(null);

    try {
      const response =
        await platformSettingsService.list();

      setSettings(response.data ?? []);
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "Unable to load platform settings."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSettings();
  }, []);

  const openSection = (section: SettingsSection) => {
    setError(null);
    setMessage(null);
    setReason("");

    if (selectedId === section.id) {
      setSelectedId(null);
      return;
    }

    setSelectedId(section.id);

    const existingSetting = settings.find(
      (setting) =>
        setting.setting_key === section.settingKey
    );

    setValue(
      JSON.stringify(
        existingSetting?.setting_value ??
          section.defaultValue,
        null,
        2
      )
    );
  };

  const saveSection = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!selectedSection) {
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const parsedValue = JSON.parse(value);

      await platformSettingsService.save(
        selectedSection.settingKey,
        {
          value: parsedValue,
          isSecret: false,
          description:
            selectedSection.description,
          reason:
            reason.trim() ||
            `Updated ${selectedSection.title}`,
        }
      );

      setMessage(
        `${selectedSection.title} saved successfully.`
      );

      await loadSettings();
    } catch (caught) {
      setError(
        caught instanceof SyntaxError
          ? "The setting value must be valid JSON."
          : caught instanceof ApiError
            ? caught.message
            : "Unable to save this setting."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="mx-auto max-w-5xl">
      <PageHeader
        eyebrow="Platform control"
        title="System settings"
        description="Manage global authentication, transaction, subscription, and notification settings."
      />

      {error && (
        <div className="mt-6 rounded-2xl border border-red-300 bg-red-50 px-5 py-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {message && (
        <div className="mt-6 rounded-2xl border border-green-300 bg-green-50 px-5 py-4 text-sm text-green-700">
          {message}
        </div>
      )}

      {loading ? (
        <div className="mt-6 rounded-[20px] bg-white p-6">
          Loading settings...
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {sections.map((section) => {
            const isOpen =
              selectedId === section.id;

            return (
              <section
                key={section.id}
                className="overflow-hidden rounded-[20px] bg-white shadow-[0_10px_30px_rgba(22,54,112,0.07)]"
              >
                <button
                  type="button"
                  onClick={() =>
                    openSection(section)
                  }
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between p-5 text-left"
                >
                  <div>
                    <h2 className="text-[18px] font-medium text-[#061b49]">
                      {section.title}
                    </h2>

                    {isOpen && (
                      <p className="mt-1 text-sm font-normal text-slate-500">
                        {section.description}
                      </p>
                    )}
                  </div>

                  <span
                    className={`text-xl transition-transform ${
                      isOpen
                        ? "rotate-90"
                        : ""
                    }`}
                  >
                    →
                  </span>
                </button>

                {isOpen && (
                  <form
                    onSubmit={saveSection}
                    className="border-t border-slate-100 p-5"
                  >
                    <label className="mb-2 block text-sm font-semibold text-[#061b49]">
                      Configuration
                    </label>

                    <textarea
                      value={value}
                      onChange={(event) =>
                        setValue(event.target.value)
                      }
                      rows={12}
                      spellCheck={false}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 font-mono text-sm text-slate-800 outline-none focus:border-blue-500"
                    />

                    <label className="mb-2 mt-5 block text-sm font-semibold text-[#061b49]">
                      Reason for change
                    </label>

                    <textarea
                      value={reason}
                      onChange={(event) =>
                        setReason(
                          event.target.value
                        )
                      }
                      rows={3}
                      placeholder="Explain why this setting is being changed"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500"
                    />

                    <div className="mt-5 flex justify-end">
                      <button
                        type="submit"
                        disabled={saving}
                        className="rounded-xl bg-[#2447d8] px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {saving
                          ? "Saving..."
                          : `Save ${section.title}`}
                      </button>
                    </div>
                  </form>
                )}
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}