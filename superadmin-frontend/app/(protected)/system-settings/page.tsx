import PageHeader from "@/components/shared/PageHeader";

export default function SystemSettingsPage() {
  return (
    <main className="mx-auto max-w-5xl">
      <PageHeader eyebrow="Platform control" title="System settings" description="Manage global authentication, transaction, subscription, and notification settings." />
      <div className="mt-6 space-y-4">
        {["General settings", "Authentication", "Transaction limits", "Notifications", "Uploads and storage", "Maintenance mode"].map((item) => <button key={item} className="flex w-full items-center justify-between rounded-[20px] bg-white p-5 text-left font-black shadow-[0_10px_30px_rgba(22,54,112,0.07)]"><span>{item}</span><span>→</span></button>)}
      </div>
    </main>
  );
}
