"use client";

import type { AuthUser } from "@/types/auth.types";
import { createStoreHook } from "@/store/create-store";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthStore = {
  user: AuthUser | null;
  status: AuthStatus;
  setSession: (user: AuthUser) => void;
  setLoading: () => void;
  clearSession: () => void;
};

export const useAuthStore = createStoreHook<AuthStore>((set) => ({
  user: null,
  status: "loading",
  setSession: (user) => set({ user, status: "authenticated" }),
  setLoading: () => set({ status: "loading" }),
  clearSession: () => set({ user: null, status: "unauthenticated" }),
}));
