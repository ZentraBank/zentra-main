import { api } from "@/lib/api";
import { Tenant } from "@/types/tenant.types";

export async function getCurrentTenant(): Promise<Tenant> {
  const res = await api.get("/api/tenants/current");

  return res.data.tenant || res.data;
}

// // services/tenant.service.ts
// export async function getCurrentTenant() {
//   // In a browser environment, window.location.hostname 
//   // will give you "tenant-a.com" or "tenant-b.com"
//   const domain = window.location.hostname;
  
//   const response = await api.get(`/tenants/by-domain?domain=${domain}`);
//   return response.data;
// }