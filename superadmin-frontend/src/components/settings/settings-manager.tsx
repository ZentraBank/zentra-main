"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import { ApiError } from "@/src/lib/api-error";
import { platformSettingsService } from "@/src/services/platform-settings.service";
import type {
  PlatformSetting,
} from "@/src/types/platform-operations";

export function SettingsManager() {
  const [settings, setSettings] =
    useState<PlatformSetting[]>([]);
  const [selectedKey, setSelectedKey] =
    useState("");
  const [value, setValue] =
    useState("{}");
  const [description, setDescription] =
    useState("");
  const [reason, setReason] =
    useState("");
  const [isSecret, setIsSecret] =
    useState(false);
  const [error, setError] =
    useState<string | null>(null);
  const [message, setMessage] =
    useState<string | null>(null);

  const load = async () => {
    const response =
      await platformSettingsService.list();

    setSettings(response.data);
  };

  useEffect(() => {
    void load().catch((caught) => {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "Unable to load settings."
      );
    });
  }, []);

  const choose = (setting: PlatformSetting) => {
    setSelectedKey(setting.setting_key);
    setDescription(
      setting.description || ""
    );
    setIsSecret(setting.is_secret);
    setReason("");

    setValue(
      JSON.stringify(
        setting.setting_value,
        null,
        2
      )
    );
  };

  const save = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    try {
      const parsed = JSON.parse(value);

      await platformSettingsService.save(
        selectedKey,
        {
          value: parsed,
          isSecret,
          description,
          reason,
        }
      );

      setMessage("Setting saved.");
      await load();
    } catch (caught) {
      setError(
        caught instanceof SyntaxError
          ? "The value must be valid JSON."
          : caught instanceof ApiError
            ? caught.message
            : "Unable to save setting."
      );
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <aside className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <h2 className="mb-4 font-semibold">
          Platform settings
        </h2>

        <div className="space-y-2">
          {settings.map((setting) => (
            <button
              key={setting.id}
              type="button"
              onClick={() =>
                choose(setting)
              }
              className={`w-full rounded-xl border px-3 py-3 text-left text-sm ${
                selectedKey ===
                setting.setting_key
                  ? "border-white/30 bg-white/10"
                  : "border-white/10"
              }`}
            >
              {setting.setting_key}
            </button>
          ))}
        </div>
      </aside>

      <form
        onSubmit={save}
        className="space-y-5 rounded-2xl border border-white/10 bg-white/5 p-6"
      >
        <input
          value={selectedKey}
          onChange={(event) =>
            setSelectedKey(
              event.target.value
            )
          }
          placeholder="setting.key"
          pattern="^[a-z0-9_.-]+$"
          required
          className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4"
        />

        <textarea
          value={value}
          onChange={(event) =>
            setValue(event.target.value)
          }
          rows={12}
          required
          className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 font-mono text-sm"
        />

        <input
          value={description}
          onChange={(event) =>
            setDescription(
              event.target.value
            )
          }
          placeholder="Description"
          className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4"
        />

        <textarea
          value={reason}
          onChange={(event) =>
            setReason(event.target.value)
          }
          rows={3}
          placeholder="Reason for change"
          className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3"
        />

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={isSecret}
            onChange={(event) =>
              setIsSecret(
                event.target.checked
              )
            }
          />
          <span className="text-sm">
            Secret setting
          </span>
        </label>

        {message && (
          <p className="text-sm text-emerald-300">
            {message}
          </p>
        )}

        {error && (
          <p className="text-sm text-red-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black"
        >
          Save setting
        </button>
      </form>
    </div>
  );
}
