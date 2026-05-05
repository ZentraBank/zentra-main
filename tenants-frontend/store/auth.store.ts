import { create } from "zustand";

type UserRole = "customer" | "tenant_admin" | "super_admin";

type User = {
  id: number;
  email: string;
  role: UserRole;
};

type AuthStore = {
  user: User | null;
  setUser: (user: User | null) => void;
  clearUser: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  // Temporary test user
  user: {
    id: 1,
    email: "admin@test.com",
    role: "tenant_admin",
    // role: "customer",
  },

  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));

