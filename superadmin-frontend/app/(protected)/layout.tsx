import SuperAdminShell from "@/components/layout/SuperAdminShell";
import { ProtectedRoute } from "@/src/components/auth/protected-route";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <SuperAdminShell>{children}</SuperAdminShell>
    </ProtectedRoute>
  );
}
