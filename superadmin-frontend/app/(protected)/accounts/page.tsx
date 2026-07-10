import PageHeader from "@/components/shared/PageHeader";
import DataTablePlaceholder from "@/components/shared/DataTablePlaceholder";

export default function Page() {
  return (
    <main className="mx-auto max-w-[1500px]">
      <PageHeader
        eyebrow="Finance"
        title="Accounts"
        description="Monitor all customer banking and wallet accounts."
        actionLabel=null
        actionHref=null
      />
      <DataTablePlaceholder columns=["Account holder", "Account number", "Tenant", "Type", "Balance", "Status", "Actions"] />
    </main>
  );
}
