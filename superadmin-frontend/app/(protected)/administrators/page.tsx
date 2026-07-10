import PageHeader from "@/components/shared/PageHeader";
import DataTablePlaceholder from "@/components/shared/DataTablePlaceholder";

export default function Page() {
  return (
    <main className="mx-auto max-w-[1500px]">
      <PageHeader
        eyebrow="Access management"
        title="Administrators"
        description="Manage tenant administrators and platform-level access."
        actionLabel="Create administrator"
        actionHref="/administrators/create"
      />
      <DataTablePlaceholder columns=["Administrator", "Tenant", "Role", "2FA", "Status", "Last login", "Actions"] />
    </main>
  );
}
