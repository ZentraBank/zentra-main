import PageHeader from "@/components/shared/PageHeader";
import DataTablePlaceholder from "@/components/shared/DataTablePlaceholder";

export default function Page() {
  return (
    <main className="mx-auto max-w-[1500px]">
      <PageHeader
        eyebrow="Finance"
        title="Transactions"
        description="Review transactions across all tenants."
        actionLabel=null
        actionHref=null
      />
      <DataTablePlaceholder columns=["Transaction ID", "User", "Tenant", "Type", "Amount", "Status", "Date"] />
    </main>
  );
}
