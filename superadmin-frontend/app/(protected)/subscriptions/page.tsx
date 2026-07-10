import PageHeader from "@/components/shared/PageHeader";
import DataTablePlaceholder from "@/components/shared/DataTablePlaceholder";

export default function Page() {
  return (
    <main className="mx-auto max-w-[1500px]">
      <PageHeader
        eyebrow="Revenue"
        title="Subscriptions"
        description="Manage platform and customer subscriptions."
        actionLabel="Manage plans"
        actionHref="/subscriptions/plans"
      />
      <DataTablePlaceholder columns=["Subscriber", "Tenant", "Plan", "Amount", "Renewal", "Status", "Actions"] />
    </main>
  );
}
