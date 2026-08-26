"use client";

import Link from "next/link";

import {
  ArrowLeft,
  Bell,
  Check,
  CheckCircle2,
  ChevronDown,
  Loader2,
  Search,
  Send,
  Users,
} from "lucide-react";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  notificationService,
} from "@/services/notification.service";

import {
  bankingService,
} from "@/services/banking.service";

import type {
  NotificationPriority,
  NotificationTemplate,
} from "@/services/notification.service";

import type {
  BankAccount,
} from "@/types/banking.types";

type AudienceType =
  | "user"
  | "users"
  | "all_clients";

type ClientOption = {
  userId: string;

  name: string;

  email:
    | string
    | null;

  phone:
    | string
    | null;
};

export default function TenantNotificationsPage() {
  const [
    templates,
    setTemplates,
  ] =
    useState<
      NotificationTemplate[]
    >([]);

  const [
    accounts,
    setAccounts,
  ] =
    useState<
      BankAccount[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(
      true,
    );

  const [
    sending,
    setSending,
  ] =
    useState(
      false,
    );

  const [
    error,
    setError,
  ] =
    useState(
      "",
    );

  const [
    success,
    setSuccess,
  ] =
    useState(
      "",
    );

  const [
    audienceType,
    setAudienceType,
  ] =
    useState<AudienceType>(
      "user",
    );

  const [
    selectedClientIds,
    setSelectedClientIds,
  ] =
    useState<
      string[]
    >([]);

  const [
    templateId,
    setTemplateId,
  ] =
    useState(
      "",
    );

  const [
    title,
    setTitle,
  ] =
    useState(
      "",
    );

  const [
    message,
    setMessage,
  ] =
    useState(
      "",
    );

  const [
    priority,
    setPriority,
  ] =
    useState<NotificationPriority>(
      "normal",
    );

  const [
    actionUrl,
    setActionUrl,
  ] =
    useState(
      "",
    );

  const [
    search,
    setSearch,
  ] =
    useState(
      "",
    );

  /*
  |--------------------------------------------------------------------------
  | Load
  |--------------------------------------------------------------------------
  */

  const load =
    useCallback(
      async () => {
        setLoading(
          true,
        );

        setError(
          "",
        );

        try {
          const [
            templateResult,
            accountResult,
          ] =
            await Promise.all([
              notificationService.listTemplates({
                status:
                  "active",
              }),

              bankingService.getTenantAccounts(),
            ]);

          setTemplates(
            templateResult,
          );

          setAccounts(
            accountResult,
          );
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load notification data.",
          );
        } finally {
          setLoading(
            false,
          );
        }
      },
      [],
    );

  useEffect(() => {
    void load();
  }, [load]);

  /*
  |--------------------------------------------------------------------------
  | Clients
  |--------------------------------------------------------------------------
  */

  const clients =
    useMemo<
      ClientOption[]
    >(() => {
      const map =
        new Map<
          string,
          ClientOption
        >();

      for (
        const account
        of accounts
      ) {
        if (
          !account.user_id
        ) {
          continue;
        }

        if (
          map.has(
            account.user_id,
          )
        ) {
          continue;
        }

        map.set(
          account.user_id,
          {
            userId:
              account.user_id,

            name:
              account.client_name ||
              account.account_name ||
              "Client",

            email:
              account.client_email ??
              null,

            phone:
              account.client_phone ??
              null,
          },
        );
      }

      return Array.from(
        map.values(),
      ).sort(
        (
          a,
          b,
        ) =>
          a.name.localeCompare(
            b.name,
          ),
      );
    }, [accounts]);

  const filteredClients =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return clients;
      }

      return clients.filter(
        (
          client,
        ) =>
          client.name
            .toLowerCase()
            .includes(
              query,
            ) ||
          (
            client.email ??
            ""
          )
            .toLowerCase()
            .includes(
              query,
            ) ||
          (
            client.phone ??
            ""
          )
            .toLowerCase()
            .includes(
              query,
            ),
      );
    }, [
      clients,
      search,
    ]);

  /*
  |--------------------------------------------------------------------------
  | Template
  |--------------------------------------------------------------------------
  */

  const selectedTemplate =
    useMemo(
      () =>
        templates.find(
          (
            template,
          ) =>
            template.id ===
            templateId,
        ) ??
        null,
      [
        templates,
        templateId,
      ],
    );

  const handleTemplateChange =
    (
      value: string,
    ) => {
      setTemplateId(
        value,
      );

      const selected =
        templates.find(
          (
            template,
          ) =>
            template.id ===
            value,
        );

      if (!selected) {
        return;
      }

      setTitle(
        selected.title,
      );

      setMessage(
        selected.message,
      );

      setPriority(
        selected.priority,
      );

      setActionUrl(
        selected.action_url ??
          "",
      );
    };

  /*
  |--------------------------------------------------------------------------
  | Selection
  |--------------------------------------------------------------------------
  */

  const toggleClient =
    (
      userId: string,
    ) => {
      setSelectedClientIds(
        (current) =>
          current.includes(
            userId,
          )
            ? current.filter(
                (
                  id,
                ) =>
                  id !==
                  userId,
              )
            : [
                ...current,
                userId,
              ],
      );
    };

  useEffect(() => {
    /*
     * Keep the selection valid
     * when changing audience mode.
     */
    if (
      audienceType ===
      "all_clients"
    ) {
      setSelectedClientIds(
        [],
      );

      return;
    }

    if (
      audienceType ===
        "user" &&
      selectedClientIds.length >
        1
    ) {
      setSelectedClientIds(
        (
          current,
        ) =>
          current.length
            ? [
                current[0],
              ]
            : [],
      );
    }
  }, [
    audienceType,
    selectedClientIds.length,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Preview
  |--------------------------------------------------------------------------
  */

  const previewClient =
    useMemo(() => {
      if (
        selectedClientIds.length
      ) {
        return (
          clients.find(
            (
              client,
            ) =>
              client.userId ===
              selectedClientIds[0],
          ) ??
          null
        );
      }

      return (
        clients[0] ??
        null
      );
    }, [
      clients,
      selectedClientIds,
    ]);

  const previewTitle =
    replacePreviewVariables(
      title,
      previewClient,
    );

  const previewMessage =
    replacePreviewVariables(
      message,
      previewClient,
    );

  /*
  |--------------------------------------------------------------------------
  | Submit
  |--------------------------------------------------------------------------
  */

  const handleSubmit =
    async (
      event:
        FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      setError(
        "",
      );

      setSuccess(
        "",
      );

      if (
        !title.trim()
      ) {
        setError(
          "Notification title is required.",
        );

        return;
      }

      if (
        !message.trim()
      ) {
        setError(
          "Notification message is required.",
        );

        return;
      }

      if (
        audienceType ===
          "user" &&
        selectedClientIds.length !==
          1
      ) {
        setError(
          "Select one client.",
        );

        return;
      }

      if (
        audienceType ===
          "users" &&
        selectedClientIds.length ===
          0
      ) {
        setError(
          "Select at least one client.",
        );

        return;
      }

      if (
        audienceType ===
          "all_clients" &&
        clients.length ===
          0
      ) {
        setError(
          "There are no clients to notify.",
        );

        return;
      }

      setSending(
        true,
      );

      try {
        let audience;

        if (
          audienceType ===
          "user"
        ) {
          audience = {
            audienceType:
              "user" as const,

            userId:
              selectedClientIds[0],
          };
        } else if (
          audienceType ===
          "users"
        ) {
          audience = {
            audienceType:
              "users" as const,

            userIds:
              selectedClientIds,
          };
        } else {
          audience = {
            audienceType:
              "all_clients" as const,
          };
        }

        const result =
          await notificationService.sendToClients({
            ...audience,

            templateId:
              selectedTemplate
                ?.id,

            /*
             * We deliberately send
             * the form values as well
             * so the tenant can modify
             * a template before sending
             * without changing the
             * saved template itself.
             */
            title:
              title.trim(),

            message:
              message.trim(),

            priority,

            actionUrl:
              actionUrl.trim() ||
              null,
          });

        setSuccess(
          `${result.sentCount} notification${
            result.sentCount ===
            1
              ? ""
              : "s"
          } sent successfully.`,
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to send notification.",
        );
      } finally {
        setSending(
          false,
        );
      }
    };

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#F4F6F8]">
        <Loader2
          size={30}
          className="animate-spin text-[#2458E8]"
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F4F6F8] px-5 pb-14 pt-8 text-[#292929]">
      <section className="mx-auto w-full max-w-[1180px]">
        {/* Header */}

        <header className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/communications"
              className="grid h-9 w-9 place-items-center rounded-full bg-white text-black/55 shadow-sm"
            >
              <ArrowLeft
                size={18}
              />
            </Link>

            <div>
              <h1 className="text-[25px] font-black tracking-[-0.035em]">
                Push Notifications
              </h1>

              <p className="mt-1 text-[11px] text-black/40">
                Send targeted notifications to your clients.
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/communications/notifications/templates"
            className="flex h-[42px] items-center justify-center rounded-[10px] border border-black/10 bg-white px-4 text-[10px] font-bold"
          >
            Manage Templates
          </Link>
        </header>

        {error && (
          <div className="mt-6 rounded-[12px] border border-red-100 bg-red-50 px-4 py-3 text-[11px] font-semibold text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-6 flex items-center gap-3 rounded-[12px] border border-green-100 bg-green-50 px-4 py-3 text-[11px] font-semibold text-green-700">
            <CheckCircle2
              size={16}
            />

            {success}
          </div>
        )}

        <form
          onSubmit={
            handleSubmit
          }
          className="mt-7 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]"
        >
          {/* Composer */}

          <section className="rounded-[22px] bg-white p-5 shadow-sm md:p-7">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-[13px] bg-[#EEF3FF] text-[#2458E8]">
                <Bell
                  size={19}
                />
              </div>

              <div>
                <h2 className="text-[17px] font-black">
                  Compose Notification
                </h2>

                <p className="mt-1 text-[9px] text-black/40">
                  Choose recipients and prepare the message.
                </p>
              </div>
            </div>

            {/* Audience */}

            <Field
              label="Recipients"
            >
              <div className="grid grid-cols-3 gap-2">
                <AudienceButton
                  active={
                    audienceType ===
                    "user"
                  }
                  label="One Client"
                  onClick={() =>
                    setAudienceType(
                      "user",
                    )
                  }
                />

                <AudienceButton
                  active={
                    audienceType ===
                    "users"
                  }
                  label="Selected"
                  onClick={() =>
                    setAudienceType(
                      "users",
                    )
                  }
                />

                <AudienceButton
                  active={
                    audienceType ===
                    "all_clients"
                  }
                  label="All Clients"
                  onClick={() =>
                    setAudienceType(
                      "all_clients",
                    )
                  }
                />
              </div>
            </Field>

            {audienceType !==
              "all_clients" && (
              <div className="mt-4 overflow-hidden rounded-[14px] border border-black/10">
                <div className="relative border-b border-black/5">
                  <Search
                    size={14}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30"
                  />

                  <input
                    value={
                      search
                    }
                    onChange={(
                      event,
                    ) =>
                      setSearch(
                        event.target.value,
                      )
                    }
                    placeholder="Search client"
                    className="h-[44px] w-full pl-10 pr-4 text-[10px] outline-none"
                  />
                </div>

                <div className="max-h-[220px] overflow-y-auto">
                  {filteredClients.map(
                    (
                      client,
                    ) => {
                      const selected =
                        selectedClientIds.includes(
                          client.userId,
                        );

                      return (
                        <button
                          key={
                            client.userId
                          }
                          type="button"
                          onClick={() => {
                            if (
                              audienceType ===
                              "user"
                            ) {
                              setSelectedClientIds(
                                [
                                  client.userId,
                                ],
                              );

                              return;
                            }

                            toggleClient(
                              client.userId,
                            );
                          }}
                          className="flex w-full items-center gap-3 border-b border-black/5 px-4 py-3 text-left last:border-b-0 hover:bg-[#F8F9FA]"
                        >
                          <div
                            className={`grid h-7 w-7 place-items-center rounded-full border ${
                              selected
                                ? "border-[#2458E8] bg-[#2458E8] text-white"
                                : "border-black/10 text-transparent"
                            }`}
                          >
                            <Check
                              size={13}
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[10px] font-black">
                              {
                                client.name
                              }
                            </p>

                            {client.email && (
                              <p className="mt-0.5 truncate text-[8px] text-black/35">
                                {
                                  client.email
                                }
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    },
                  )}
                </div>
              </div>
            )}

            {audienceType ===
              "all_clients" && (
              <div className="mt-4 flex items-start gap-3 rounded-[14px] bg-[#EEF3FF] px-4 py-4 text-[#2458E8]">
                <Users
                  size={17}
                  className="mt-0.5 shrink-0"
                />

                <div>
                  <p className="text-[10px] font-black">
                    All Clients
                  </p>

                  <p className="mt-1 text-[9px] text-[#2458E8]/65">
                    This notification will be sent to all {clients.length} active clients.
                  </p>
                </div>
              </div>
            )}

            {/* Template */}

            <Field
              label="Template"
            >
              <div className="relative">
                <select
                  value={
                    templateId
                  }
                  onChange={(
                    event,
                  ) =>
                    handleTemplateChange(
                      event.target.value,
                    )
                  }
                  className="h-[48px] w-full appearance-none rounded-[11px] border border-black/10 bg-white px-4 pr-10 text-[10px] font-semibold outline-none"
                >
                  <option value="">
                    Custom notification
                  </option>

                  {templates.map(
                    (
                      template,
                    ) => (
                      <option
                        key={
                          template.id
                        }
                        value={
                          template.id
                        }
                      >
                        {template.name}
                        {template.category
                          ? ` — ${template.category}`
                          : ""}
                      </option>
                    ),
                  )}
                </select>

                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-black/30"
                />
              </div>
            </Field>

            <Field
              label="Title"
            >
              <input
                value={
                  title
                }
                onChange={(
                  event,
                ) =>
                  setTitle(
                    event.target.value,
                  )
                }
                maxLength={
                  255
                }
                placeholder="Notification title"
                className="h-[48px] w-full rounded-[11px] border border-black/10 px-4 text-[11px] font-semibold outline-none"
              />
            </Field>

            <Field
              label="Message"
            >
              <textarea
                value={
                  message
                }
                onChange={(
                  event,
                ) =>
                  setMessage(
                    event.target.value,
                  )
                }
                maxLength={
                  5000
                }
                placeholder="Write your message..."
                className="h-[150px] w-full resize-none rounded-[11px] border border-black/10 px-4 py-3 text-[11px] leading-5 outline-none"
              />

              <p className="mt-2 text-[8px] text-black/30">
                Supported variables: {"{{firstName}}"}, {"{{lastName}}"}, {"{{email}}"}
              </p>
            </Field>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-[9px] font-black uppercase tracking-[0.05em] text-black/40">
                  Priority
                </label>

                <select
                  value={
                    priority
                  }
                  onChange={(
                    event,
                  ) =>
                    setPriority(
                      event.target.value as
                        NotificationPriority,
                    )
                  }
                  className="mt-2 h-[46px] w-full rounded-[11px] border border-black/10 bg-white px-4 text-[10px] font-semibold outline-none"
                >
                  <option value="low">
                    Low
                  </option>

                  <option value="normal">
                    Normal
                  </option>

                  <option value="high">
                    High
                  </option>
                </select>
              </div>

              <div>
                <label className="text-[9px] font-black uppercase tracking-[0.05em] text-black/40">
                  Action URL
                </label>

                <input
                  value={
                    actionUrl
                  }
                  onChange={(
                    event,
                  ) =>
                    setActionUrl(
                      event.target.value,
                    )
                  }
                  placeholder="/accounts"
                  className="mt-2 h-[46px] w-full rounded-[11px] border border-black/10 px-4 text-[10px] outline-none"
                />
              </div>
            </div>
          </section>

          {/* Preview */}

          <section className="h-fit rounded-[22px] bg-[#14251D] p-5 text-white shadow-sm md:p-7">
            <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-white/35">
              Preview
            </p>

            <h2 className="mt-2 text-[19px] font-black">
              Client Notification
            </h2>

            <div className="mt-6 rounded-[20px] bg-white px-5 py-5 text-[#292929] shadow-xl">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-[#EEF3FF] text-[#2458E8]">
                  <Bell
                    size={17}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[12px] font-black">
                      {previewTitle ||
                        "Notification title"}
                    </p>

                    <PriorityBadge
                      priority={
                        priority
                      }
                    />
                  </div>

                  <p className="mt-2 whitespace-pre-wrap text-[10px] leading-5 text-black/55">
                    {previewMessage ||
                      "Your notification message will appear here."}
                  </p>

                  {actionUrl && (
                    <p className="mt-3 text-[8px] font-semibold text-[#2458E8]">
                      Open {actionUrl}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-[14px] border border-white/10 bg-white/5 px-4 py-4">
              <p className="text-[8px] font-bold uppercase tracking-[0.05em] text-white/30">
                Audience
              </p>

              <p className="mt-2 text-[12px] font-black">
                {audienceType ===
                "all_clients"
                  ? `${clients.length} clients`
                  : audienceType ===
                      "users"
                    ? `${selectedClientIds.length} selected clients`
                    : selectedClientIds.length
                      ? previewClient?.name ??
                        "1 client"
                      : "No client selected"}
              </p>
            </div>

            <button
              type="submit"
              disabled={
                sending
              }
              className="mt-6 flex h-[47px] w-full items-center justify-center gap-2 rounded-[11px] bg-[#2458E8] text-[11px] font-bold text-white disabled:opacity-50"
            >
              {sending ? (
                <>
                  <Loader2
                    size={15}
                    className="animate-spin"
                  />

                  Sending...
                </>
              ) : (
                <>
                  <Send
                    size={15}
                  />

                  Send Notification
                </>
              )}
            </button>
          </section>
        </form>
      </section>
    </main>
  );
}

/*
|--------------------------------------------------------------------------
| UI
|--------------------------------------------------------------------------
*/

function Field({
  label,
  children,
}: {
  label: string;

  children:
    React.ReactNode;
}) {
  return (
    <div className="mt-5">
      <label className="text-[9px] font-black uppercase tracking-[0.05em] text-black/40">
        {label}
      </label>

      <div className="mt-2">
        {children}
      </div>
    </div>
  );
}

function AudienceButton({
  active,
  label,
  onClick,
}: {
  active:
    boolean;

  label:
    string;

  onClick:
    () => void;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`h-[42px] rounded-[10px] text-[9px] font-black ${
        active
          ? "bg-[#2458E8] text-white"
          : "border border-black/10 bg-white text-black/45"
      }`}
    >
      {label}
    </button>
  );
}

function PriorityBadge({
  priority,
}: {
  priority:
    NotificationPriority;
}) {
  const styles = {
    low:
      "bg-gray-100 text-gray-600",

    normal:
      "bg-blue-50 text-blue-700",

    high:
      "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`shrink-0 rounded-full px-2 py-1 text-[7px] font-black uppercase ${styles[priority]}`}
    >
      {priority}
    </span>
  );
}

/*
|--------------------------------------------------------------------------
| Template preview
|--------------------------------------------------------------------------
*/

function replacePreviewVariables(
  text: string,

  client:
    | ClientOption
    | null,
) {
  if (!text) {
    return "";
  }

  const names =
    (
      client?.name ??
      ""
    )
      .trim()
      .split(
        /\s+/,
      );

  const firstName =
    names[0] ??
    "John";

  const lastName =
    names.length >
    1
      ? names[
          names.length -
            1
        ]
      : "Doe";

  return text
    .replaceAll(
      "{{firstName}}",
      firstName,
    )
    .replaceAll(
      "{{lastName}}",
      lastName,
    )
    .replaceAll(
      "{{email}}",
      client?.email ??
        "client@example.com",
    );
}