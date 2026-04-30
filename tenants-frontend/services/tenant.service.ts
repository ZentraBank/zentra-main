import { api } from "@/lib/api";
import { Tenant } from "@/types/tenant.types";

export async function getCurrentTenant(): Promise<Tenant> {
  const res = await api.get("/api/tenants/current");

  return res.data.tenant || res.data;
}