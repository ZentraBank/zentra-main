"use client";

import { useAuthStore } from "@/store/auth.store";

export default function PermissionGuard({
  permission,
  children,
  fallback = null,
}: {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const permissions = useAuthStore((state) => state.user?.permissions ?? []);
  return permissions.includes(permission) ? <>{children}</> : <>{fallback}</>;
}
