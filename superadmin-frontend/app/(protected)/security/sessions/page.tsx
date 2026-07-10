import PageHeader from "@/components/shared/PageHeader";
import DataTablePlaceholder from "@/components/shared/DataTablePlaceholder";

export default function SessionsPage() {
  return <main className="mx-auto max-w-[1500px]"><PageHeader eyebrow="Security" title="Active sessions" description="Review and revoke active platform sessions." /><DataTablePlaceholder columns={["User", "Role", "Tenant", "Device", "IP address", "Last activity", "Actions"]} /></main>;
}
