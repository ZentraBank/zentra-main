import PageHeader from "@/components/shared/PageHeader";
import DataTablePlaceholder from "@/components/shared/DataTablePlaceholder";

export default function Page() {
  return (
    <main className="mx-auto max-w-[1500px]">
      <PageHeader
        eyebrow="Platform users"
        title="Users"
        description="View customers across every tenant."
        actionLabel=null
        actionHref=null
      />
      <DataTablePlaceholder columns=["User", "Tenant", "Account", "KYC", "Subscription", "Status", "Actions"] />
    </main>
  );
}
