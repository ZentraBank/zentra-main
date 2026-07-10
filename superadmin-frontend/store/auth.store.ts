"use client";

import { create } from "zustand";
import type { AuthSession, AuthUser } from "@/types/auth.types";

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  setSession: (session: AuthSession) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  setSession: (session) =>
    set({ user: session.user, token: session.accessToken }),
  clearSession: () => set({ user: null, token: null }),
}));
