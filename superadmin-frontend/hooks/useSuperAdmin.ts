"use client";

import { isSuperAdmin } from "@/lib/auth";
import { useAuthStore } from "@/store/auth.store";

export function useSuperAdmin() {
  const user = useAuthStore((state) => state.user);

  return {
    user,
    isSuperAdmin: isSuperAdmin(user),
  };
}
