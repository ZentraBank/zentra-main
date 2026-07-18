import PageHeader from "@/components/shared/PageHeader";
import DataTablePlaceholder from "@/components/shared/DataTablePlaceholder";

export default function Page() {
  return (
    <main className="mx-auto max-w-[1500px]">
      <PageHeader
        eyebrow="Platform"
        title="Tenants"
        description="Manage every organisation using the platform."
        actionLabel="Create tenant"
        actionHref="/tenants/create"
      />
      <DataTablePlaceholder columns={["Tenant", "Domain", "Plan", "Users", "Status", "Created", "Actions"]} />
    </main>
  );
}        
