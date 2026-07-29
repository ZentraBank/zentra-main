import { ProtectedRoute } from "@/src/components/auth/protected-route";
import { TenantDetailsView } from "@/src/components/tenants/tenant-details-view";

export default async function TenantDetailsPage({
  params,
}: {
  params: Promise<{
    tenantId: string;
  }>;
}) {
  const { tenantId } = await params;

  return (
    <ProtectedRoute permission="platform.tenants.read">
      <main className="mx-auto max-w-6xl px-6 py-10">
        <TenantDetailsView
          tenantId={tenantId}
        />
      </main>
    </ProtectedRoute>
  );
}
