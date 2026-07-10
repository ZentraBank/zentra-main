import SuperAdminShell from "@/components/layout/SuperAdminShell";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SuperAdminShell>{children}</SuperAdminShell>;
}
