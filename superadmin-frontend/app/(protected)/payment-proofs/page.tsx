import PageHeader from "@/components/shared/PageHeader";
import DataTablePlaceholder from "@/components/shared/DataTablePlaceholder";

export default function Page() {
  return (
    <main className="mx-auto max-w-[1500px]">
      <PageHeader
        eyebrow="Approvals"
        title="Payment proofs"
        description="Review submitted payment evidence and activate subscriptions."
        actionLabel=null
        actionHref=null
      />
      <DataTablePlaceholder columns=["Submitted by", "Tenant", "Plan", "Amount", "Submitted", "Status", "Actions"] />
    </main>
  );
}
