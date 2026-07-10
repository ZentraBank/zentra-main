"use client";

import { hasPermission } from "@/lib/auth";
import { useAuthStore } from "@/store/auth.store";

export function usePermission(permission: string) {
  const user = useAuthStore((state) => state.user);
  return hasPermission(user, permission);
}
