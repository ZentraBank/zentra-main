"use client";

import type { Tenant } from "@/types/tenant.types";
import { createStoreHook } from "@/store/create-store";

type TenantStore = {
  tenant: Tenant | null;
  isTenantLoading: boolean;
  setTenant: (tenant: Tenant) => void;
  setTenantLoading: (value: boolean) => void;
};

export const useTenantStore = createStoreHook<TenantStore>((set) => ({
  tenant: null,
  isTenantLoading: true,
  setTenant: (tenant) => set({ tenant }),
  setTenantLoading: (value) => set({ isTenantLoading: value }),
}));
