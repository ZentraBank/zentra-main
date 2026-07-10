import { apiRequest } from "@/lib/api";
import type { Tenant } from "@/types/tenant.types";

export function getTenants(token: string) {
  return apiRequest<Tenant[]>("/superadmin/tenants", { token });
}

export function getTenant(id: string, token: string) {
  return apiRequest<Tenant>(`/superadmin/tenants/${id}`, { token });
}
