import { apiRequest } from "@/lib/api";
import type { PlatformUser } from "@/types/user.types";

export function getPlatformUsers(token: string) {
  return apiRequest<PlatformUser[]>("/superadmin/users", { token });
}

export function getPlatformUser(id: string, token: string) {
  return apiRequest<PlatformUser>(`/superadmin/users/${id}`, { token });
}
