import { create } from "zustand";
import type { ClientTenant } from "@/types/tenant";

type TenantState = {
  tenant: ClientTenant | null;
  loading: boolean;
  error: string | null;
  setTenant: (tenant: ClientTenant) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
};

export const useTenantStore = create<TenantState>((set) => ({
  tenant: null,
  loading: true,
  error: null,
  setTenant: (tenant) => set({ tenant, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
