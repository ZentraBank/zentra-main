import { apiRequest } from "@/lib/api";
import type { AuthSession } from "@/types/auth.types";

export function loginSuperAdmin(email: string, password: string) {
  return apiRequest<AuthSession>("/superadmin/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function getCurrentSuperAdmin(token: string) {
  return apiRequest<AuthSession["user"]>("/superadmin/auth/me", { token });
}
