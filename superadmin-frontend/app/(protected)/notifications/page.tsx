import PageHeader from "@/components/shared/PageHeader";
import DataTablePlaceholder from "@/components/shared/DataTablePlaceholder";

export default function Page() {
  return (
    <main className="mx-auto max-w-[1500px]">
      <PageHeader
        eyebrow="Communication"
        title="Notifications"
        description="Send targeted platform, tenant, and security notifications."
        actionLabel=null
        actionHref=null
      />
      <DataTablePlaceholder columns=["Title", "Audience", "Channels", "Status", "Sent", "Created by", "Actions"] />
    </main>
  );
}
