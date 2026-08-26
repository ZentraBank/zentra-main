"use client";

import Link from "next/link";

import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  Edit3,
  Loader2,
  Plus,
  Search,
  Trash2,
  X,
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

import type {
  CreateNotificationTemplateInput,
  NotificationPriority,
  NotificationTemplate,
  NotificationTemplateStatus,
} from "@/services/notification.service";

type TemplateForm = {
  name: string;
  category: string;
  title: string;
  message: string;
  priority: NotificationPriority;
  actionUrl: string;
  status: NotificationTemplateStatus;
};

const emptyForm: TemplateForm = {
  name: "",
  category: "",
  title: "",
  message: "",
  priority: "normal",
  actionUrl: "",
  status: "active",
};

export default function NotificationTemplatesPage() {
  const [
    templates,
    setTemplates,
  ] = useState<NotificationTemplate[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    deletingId,
    setDeletingId,
  ] = useState<string | null>(null);

  const [
    formOpen,
    setFormOpen,
  ] = useState(false);

  const [
    editingId,
    setEditingId,
  ] = useState<string | null>(null);

  const [
    form,
    setForm,
  ] = useState<TemplateForm>(emptyForm);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState<
    "all" | "active" | "inactive"
  >("all");

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Load
  |--------------------------------------------------------------------------
  */

  const load =
    useCallback(async () => {
      setLoading(true);
      setError("");

      try {
        const result =
          await notificationService.listTemplates({
            status: "all",
          });

        setTemplates(result);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load notification templates.",
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void load();
  }, [load]);

  /*
  |--------------------------------------------------------------------------
  | Filter
  |--------------------------------------------------------------------------
  */

  const filtered =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return templates.filter(
        (template) => {
          if (
            statusFilter !==
              "all" &&
            template.status !==
              statusFilter
          ) {
            return false;
          }

          if (!query) {
            return true;
          }

          return (
            template.name
              .toLowerCase()
              .includes(query) ||
            template.title
              .toLowerCase()
              .includes(query) ||
            (
              template.category ??
              ""
            )
              .toLowerCase()
              .includes(query) ||
            template.message
              .toLowerCase()
              .includes(query)
          );
        },
      );
    }, [
      templates,
      search,
      statusFilter,
    ]);

  const activeCount =
    useMemo(
      () =>
        templates.filter(
          (template) =>
            template.status ===
            "active",
        ).length,
      [templates],
    );

  /*
  |--------------------------------------------------------------------------
  | Form
  |--------------------------------------------------------------------------
  */

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setFormOpen(true);
  };

  const openEdit = (
    template: NotificationTemplate,
  ) => {
    setEditingId(template.id);

    setForm({
      name:
        template.name,

      category:
        template.category ??
        "",

      title:
        template.title,

      message:
        template.message,

      priority:
        template.priority,

      actionUrl:
        template.action_url ??
        "",

      status:
        template.status,
    });

    setError("");
    setSuccess("");
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit =
    async (
      event: FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      setError("");
      setSuccess("");

      if (
        !form.name.trim()
      ) {
        setError(
          "Template name is required.",
        );

        return;
      }

      if (
        !form.title.trim()
      ) {
        setError(
          "Notification title is required.",
        );

        return;
      }

      if (
        !form.message.trim()
      ) {
        setError(
          "Notification message is required.",
        );

        return;
      }

      const payload:
        CreateNotificationTemplateInput = {
          name:
            form.name.trim(),

          category:
            form.category.trim() ||
            null,

          title:
            form.title.trim(),

          message:
            form.message.trim(),

          priority:
            form.priority,

          actionUrl:
            form.actionUrl.trim() ||
            null,

          status:
            form.status,
        };

      setSaving(true);

      try {
        if (editingId) {
          await notificationService.updateTemplate(
            editingId,
            payload,
          );

          setSuccess(
            "Template updated successfully.",
          );
        } else {
          await notificationService.createTemplate(
            payload,
          );

          setSuccess(
            "Template created successfully.",
          );
        }

        closeForm();
        await load();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to save template.",
        );
      } finally {
        setSaving(false);
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Delete
  |--------------------------------------------------------------------------
  */

  const removeTemplate =
    async (
      template: NotificationTemplate,
    ) => {
      const confirmed =
        window.confirm(
          `Delete "${template.name}"? This cannot be undone.`,
        );

      if (!confirmed) {
        return;
      }

      setDeletingId(template.id);
      setError("");
      setSuccess("");

      try {
        await notificationService.deleteTemplate(
          template.id,
        );

        setSuccess(
          "Template deleted successfully.",
        );

        await load();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to delete template.",
        );
      } finally {
        setDeletingId(null);
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Quick status toggle
  |--------------------------------------------------------------------------
  */

  const toggleStatus =
    async (
      template: NotificationTemplate,
    ) => {
      const nextStatus:
        NotificationTemplateStatus =
        template.status ===
        "active"
          ? "inactive"
          : "active";

      setError("");
      setSuccess("");

      try {
        await notificationService.updateTemplate(
          template.id,
          {
            status:
              nextStatus,
          },
        );

        setSuccess(
          nextStatus ===
            "active"
            ? "Template activated."
            : "Template disabled.",
        );

        await load();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to update template status.",
        );
      }
    };

  return (
    <main className="min-h-screen bg-[#F4F6F8] px-5 pb-14 pt-8 text-[#292929]">
      <section className="mx-auto w-full max-w-[1180px]">
        {/* Header */}

        <header className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/communications/notifications"
              className="grid h-9 w-9 place-items-center rounded-full bg-white text-black/55 shadow-sm"
            >
              <ArrowLeft
                size={18}
              />
            </Link>

            <div>
              <h1 className="text-[25px] font-black tracking-[-0.035em]">
                Notification Templates
              </h1>

              <p className="mt-1 text-[11px] text-black/40">
                Create reusable notification messages for your team.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="flex h-[42px] items-center justify-center gap-2 rounded-[10px] bg-[#2458E8] px-4 text-[10px] font-bold text-white"
          >
            <Plus
              size={15}
            />

            New Template
          </button>
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

        {/* Stats */}

        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          <SummaryCard
            label="Total Templates"
            value={String(
              templates.length,
            )}
          />

          <SummaryCard
            label="Active"
            value={String(
              activeCount,
            )}
            positive
          />

          <SummaryCard
            label="Inactive"
            value={String(
              templates.length -
                activeCount,
            )}
          />
        </div>

        {/* Filters */}

        <div className="mt-6 flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30"
            />

            <input
              value={search}
              onChange={(
                event,
              ) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search templates"
              className="h-[46px] w-full rounded-[11px] border border-black/10 bg-white pl-11 pr-4 text-[11px] outline-none"
            />
          </div>

          <div className="flex gap-2">
            <FilterButton
              label="All"
              active={
                statusFilter ===
                "all"
              }
              onClick={() =>
                setStatusFilter(
                  "all",
                )
              }
            />

            <FilterButton
              label="Active"
              active={
                statusFilter ===
                "active"
              }
              onClick={() =>
                setStatusFilter(
                  "active",
                )
              }
            />

            <FilterButton
              label="Inactive"
              active={
                statusFilter ===
                "inactive"
              }
              onClick={() =>
                setStatusFilter(
                  "inactive",
                )
              }
            />
          </div>
        </div>

        {/* Templates */}

        {loading ? (
          <div className="mt-7 grid min-h-[350px] place-items-center rounded-[20px] bg-white">
            <Loader2
              size={30}
              className="animate-spin text-[#2458E8]"
            />
          </div>
        ) : filtered.length ===
          0 ? (
          <div className="mt-7 grid min-h-[350px] place-items-center rounded-[20px] border border-dashed border-black/10 bg-white">
            <div className="text-center">
              <Bell
                size={35}
                className="mx-auto text-[#2458E8]"
              />

              <p className="mt-4 text-[14px] font-black">
                No templates found
              </p>

              <button
                type="button"
                onClick={
                  openCreate
                }
                className="mt-4 rounded-[9px] bg-[#2458E8] px-4 py-2 text-[10px] font-bold text-white"
              >
                Create Template
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map(
              (
                template,
              ) => (
                <TemplateCard
                  key={
                    template.id
                  }
                  template={
                    template
                  }
                  deleting={
                    deletingId ===
                    template.id
                  }
                  onEdit={() =>
                    openEdit(
                      template,
                    )
                  }
                  onDelete={() =>
                    void removeTemplate(
                      template,
                    )
                  }
                  onToggleStatus={() =>
                    void toggleStatus(
                      template,
                    )
                  }
                />
              ),
            )}
          </div>
        )}

        {/* Modal */}

        {formOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 px-4 py-8">
            <div className="mx-auto w-full max-w-[720px]">
              <form
                onSubmit={
                  handleSubmit
                }
                className="rounded-[22px] bg-white p-5 shadow-2xl md:p-7"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.07em] text-black/30">
                      {editingId
                        ? "Edit Template"
                        : "New Template"}
                    </p>

                    <h2 className="mt-1 text-[21px] font-black">
                      {editingId
                        ? "Update Notification Template"
                        : "Create Notification Template"}
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={
                      closeForm
                    }
                    className="grid h-9 w-9 place-items-center rounded-full bg-[#F4F6F8]"
                  >
                    <X
                      size={17}
                    />
                  </button>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <InputField
                    label="Template Name"
                    value={
                      form.name
                    }
                    placeholder="Account Verification Required"
                    onChange={(
                      value,
                    ) =>
                      setForm(
                        (
                          current,
                        ) => ({
                          ...current,

                          name:
                            value,
                        }),
                      )
                    }
                  />

                  <InputField
                    label="Category"
                    value={
                      form.category
                    }
                    placeholder="account"
                    onChange={(
                      value,
                    ) =>
                      setForm(
                        (
                          current,
                        ) => ({
                          ...current,

                          category:
                            value,
                        }),
                      )
                    }
                  />
                </div>

                <div className="mt-4">
                  <InputField
                    label="Notification Title"
                    value={
                      form.title
                    }
                    placeholder="Action required on your account"
                    onChange={(
                      value,
                    ) =>
                      setForm(
                        (
                          current,
                        ) => ({
                          ...current,

                          title:
                            value,
                        }),
                      )
                    }
                  />
                </div>

                <div className="mt-4">
                  <label className="text-[9px] font-black uppercase tracking-[0.05em] text-black/40">
                    Message
                  </label>

                  <textarea
                    value={
                      form.message
                    }
                    onChange={(
                      event,
                    ) =>
                      setForm(
                        (
                          current,
                        ) => ({
                          ...current,

                          message:
                            event.target
                              .value,
                        }),
                      )
                    }
                    maxLength={
                      5000
                    }
                    placeholder="Hi {{firstName}}, ..."
                    className="mt-2 h-[150px] w-full resize-none rounded-[11px] border border-black/10 px-4 py-3 text-[11px] leading-5 outline-none"
                  />

                  <p className="mt-2 text-[8px] text-black/30">
                    Variables:{" "}
                    {"{{firstName}}"},{" "}
                    {"{{lastName}}"},{" "}
                    {"{{email}}"}
                  </p>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <SelectField
                    label="Priority"
                    value={
                      form.priority
                    }
                    options={[
                      [
                        "low",
                        "Low",
                      ],
                      [
                        "normal",
                        "Normal",
                      ],
                      [
                        "high",
                        "High",
                      ],
                    ]}
                    onChange={(
                      value,
                    ) =>
                      setForm(
                        (
                          current,
                        ) => ({
                          ...current,

                          priority:
                            value as NotificationPriority,
                        }),
                      )
                    }
                  />

                  <SelectField
                    label="Status"
                    value={
                      form.status
                    }
                    options={[
                      [
                        "active",
                        "Active",
                      ],
                      [
                        "inactive",
                        "Inactive",
                      ],
                    ]}
                    onChange={(
                      value,
                    ) =>
                      setForm(
                        (
                          current,
                        ) => ({
                          ...current,

                          status:
                            value as NotificationTemplateStatus,
                        }),
                      )
                    }
                  />

                  <InputField
                    label="Action URL"
                    value={
                      form.actionUrl
                    }
                    placeholder="/accounts"
                    onChange={(
                      value,
                    ) =>
                      setForm(
                        (
                          current,
                        ) => ({
                          ...current,

                          actionUrl:
                            value,
                        }),
                      )
                    }
                  />
                </div>

                {/* Preview */}

                <div className="mt-6 rounded-[18px] bg-[#14251D] p-5 text-white">
                  <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-white/30">
                    Preview
                  </p>

                  <div className="mt-4 rounded-[16px] bg-white px-4 py-4 text-[#292929]">
                    <div className="flex items-start gap-3">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] bg-[#EEF3FF] text-[#2458E8]">
                        <Bell
                          size={16}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-black">
                          {replacePreviewVariables(
                            form.title,
                          ) ||
                            "Notification title"}
                        </p>

                        <p className="mt-2 whitespace-pre-wrap text-[9px] leading-4 text-black/50">
                          {replacePreviewVariables(
                            form.message,
                          ) ||
                            "Notification message"}
                        </p>

                        {form.actionUrl && (
                          <p className="mt-3 text-[8px] font-bold text-[#2458E8]">
                            Open{" "}
                            {
                              form.actionUrl
                            }
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={
                    saving
                  }
                  className="mt-6 flex h-[46px] w-full items-center justify-center gap-2 rounded-[11px] bg-[#2458E8] text-[11px] font-bold text-white disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2
                        size={15}
                        className="animate-spin"
                      />

                      Saving...
                    </>
                  ) : editingId ? (
                    <>
                      <Edit3
                        size={14}
                      />

                      Update Template
                    </>
                  ) : (
                    <>
                      <Plus
                        size={14}
                      />

                      Create Template
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

/*
|--------------------------------------------------------------------------
| Template card
|--------------------------------------------------------------------------
*/

function TemplateCard({
  template,
  deleting,
  onEdit,
  onDelete,
  onToggleStatus,
}: {
  template:
    NotificationTemplate;

  deleting:
    boolean;

  onEdit:
    () => void;

  onDelete:
    () => void;

  onToggleStatus:
    () => void;
}) {
  return (
    <article className="flex flex-col rounded-[18px] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="grid h-10 w-10 place-items-center rounded-[12px] bg-[#EEF3FF] text-[#2458E8]">
          <Bell
            size={17}
          />
        </div>

        <StatusBadge
          status={
            template.status
          }
        />
      </div>

      <p className="mt-5 text-[9px] font-bold uppercase tracking-[0.06em] text-black/30">
        {template.category ||
          "General"}
      </p>

      <h2 className="mt-1 text-[15px] font-black">
        {template.name}
      </h2>

      <p className="mt-3 text-[10px] font-bold">
        {template.title}
      </p>

      <p className="mt-2 line-clamp-4 text-[9px] leading-4 text-black/45">
        {template.message}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <span className="rounded-full bg-[#F4F6F8] px-2.5 py-1 text-[7px] font-black uppercase text-black/45">
          {
            template.priority
          }
        </span>

        {template.action_url && (
          <span className="max-w-full truncate rounded-full bg-[#EEF3FF] px-2.5 py-1 text-[7px] font-semibold text-[#2458E8]">
            {
              template.action_url
            }
          </span>
        )}
      </div>

      <div className="mt-auto grid grid-cols-3 gap-2 border-t border-black/5 pt-5">
        <button
          type="button"
          onClick={
            onEdit
          }
          className="flex h-[38px] items-center justify-center gap-1.5 rounded-[9px] bg-[#EEF3FF] text-[8px] font-bold text-[#2458E8]"
        >
          <Edit3
            size={12}
          />

          Edit
        </button>

        <button
          type="button"
          onClick={
            onToggleStatus
          }
          className="flex h-[38px] items-center justify-center rounded-[9px] bg-[#F4F6F8] px-2 text-[8px] font-bold text-black/55"
        >
          {template.status ===
          "active"
            ? "Disable"
            : "Activate"}
        </button>

        <button
          type="button"
          disabled={
            deleting
          }
          onClick={
            onDelete
          }
          className="flex h-[38px] items-center justify-center gap-1.5 rounded-[9px] bg-red-50 text-[8px] font-bold text-red-600 disabled:opacity-50"
        >
          {deleting ? (
            <Loader2
              size={12}
              className="animate-spin"
            />
          ) : (
            <Trash2
              size={12}
            />
          )}

          Delete
        </button>
      </div>
    </article>
  );
}

/*
|--------------------------------------------------------------------------
| UI
|--------------------------------------------------------------------------
*/

function SummaryCard({
  label,
  value,
  positive = false,
}: {
  label: string;

  value: string;

  positive?: boolean;
}) {
  return (
    <div className="rounded-[15px] bg-white px-4 py-4 shadow-sm">
      <p className="text-[8px] font-bold uppercase tracking-[0.05em] text-black/30">
        {label}
      </p>

      <p
        className={`mt-2 text-[20px] font-black ${
          positive
            ? "text-[#16884B]"
            : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string;

  active: boolean;

  onClick:
    () => void;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`h-[46px] rounded-[11px] px-4 text-[9px] font-black ${
        active
          ? "bg-[#2458E8] text-white"
          : "border border-black/10 bg-white text-black/45"
      }`}
    >
      {label}
    </button>
  );
}

function StatusBadge({
  status,
}: {
  status:
    NotificationTemplateStatus;
}) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[7px] font-black uppercase ${
        status ===
        "active"
          ? "bg-green-50 text-green-700"
          : "bg-gray-100 text-gray-500"
      }`}
    >
      {status}
    </span>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;

  value: string;

  onChange:
    (
      value: string,
    ) => void;

  placeholder?:
    string;
}) {
  return (
    <div>
      <label className="text-[9px] font-black uppercase tracking-[0.05em] text-black/40">
        {label}
      </label>

      <input
        value={
          value
        }
        onChange={(
          event,
        ) =>
          onChange(
            event.target.value,
          )
        }
        placeholder={
          placeholder
        }
        className="mt-2 h-[46px] w-full rounded-[11px] border border-black/10 px-4 text-[10px] outline-none"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;

  value: string;

  options:
    readonly (
      readonly [
        string,
        string,
      ]
    )[];

  onChange:
    (
      value: string,
    ) => void;
}) {
  return (
    <div>
      <label className="text-[9px] font-black uppercase tracking-[0.05em] text-black/40">
        {label}
      </label>

      <select
        value={
          value
        }
        onChange={(
          event,
        ) =>
          onChange(
            event.target.value,
          )
        }
        className="mt-2 h-[46px] w-full rounded-[11px] border border-black/10 bg-white px-4 text-[10px] font-semibold outline-none"
      >
        {options.map(
          ([
            value,
            label,
          ]) => (
            <option
              key={
                value
              }
              value={
                value
              }
            >
              {label}
            </option>
          ),
        )}
      </select>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Preview
|--------------------------------------------------------------------------
*/

function replacePreviewVariables(
  text: string,
) {
  return text
    .replaceAll(
      "{{firstName}}",
      "John",
    )
    .replaceAll(
      "{{lastName}}",
      "Doe",
    )
    .replaceAll(
      "{{email}}",
      "john@example.com",
    );
}