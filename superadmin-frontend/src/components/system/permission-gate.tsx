"use client";

import { usePlatformAuth } from "@/src/context/platform-auth-context";

export function PermissionGate({ permission, children, fallback = null }: { permission: string; children: React.ReactNode; fallback?: React.ReactNode }) {
  const { hasPermission } = usePlatformAuth();
  return hasPermission(permission) ? children : fallback;
}
