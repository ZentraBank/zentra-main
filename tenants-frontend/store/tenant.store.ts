import { create } from "zustand";
import { Tenant } from "@/types/tenant.types";

type TenantStore = {
  tenant: Tenant | null;
  isTenantLoading: boolean;
  setTenant: (tenant: Tenant) => void;
  setTenantLoading: (value: boolean) => void;
};

export const useTenantStore = create<TenantStore>((set) => ({
  tenant: null,
  isTenantLoading: true,
  setTenant: (tenant) => set({ tenant }),
  setTenantLoading: (value) => set({ isTenantLoading: value }),
}));