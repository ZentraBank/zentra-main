import type { AuthUser } from "@/types/auth.types";

export function isSuperAdmin(user: AuthUser | null | undefined) {
  return user?.role === "SUPER_ADMIN" && user.status === "ACTIVE";
}

export function hasPermission(
  user: AuthUser | null | undefined,
  permission: string,
) {
  if (!isSuperAdmin(user)) return false;
  return user.permissions.includes(permission) || user.permissions.includes("*");
}
