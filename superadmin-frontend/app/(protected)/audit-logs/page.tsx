import PageHeader from "@/components/shared/PageHeader";
import DataTablePlaceholder from "@/components/shared/DataTablePlaceholder";

export default function Page() {
  return (
    <main className="mx-auto max-w-[1500px]">
      <PageHeader
        eyebrow="Compliance"
        title="Audit logs"
        description="Review immutable records of privileged actions."
        actionLabel={undefined}
        actionHref={undefined}
      />
      <DataTablePlaceholder columns={["Actor", "Action", "Resource", "Tenant", "IP address", "Time", "Severity"]} />
    </main>
  );
}
