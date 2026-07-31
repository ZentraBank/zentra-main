"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";

const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/password/forgot-password",
  "/onboarding",
  "/auth/social/callback",
];

const forbiddenClientRoleCodes = new Set([
  "tenant_admin",
  "super_admin",
  "platform_admin",
  "platform_owner",
]);

function isPublicPath(pathname: string): boolean {
  return publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const initialised = useRef(false);
  const status = useAuthStore((state) => state.status);
  const setStatus = useAuthStore((state) => state.setStatus);
  const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);

  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;
    let active = true;

    async function initialise() {
      setStatus("loading");
      const session = await authService.restore();
      if (!active) return;

      if (!session) {
        clearUser();
        return;
      }

      const roleCode = session.user.role?.code?.toLowerCase();
      if (roleCode && forbiddenClientRoleCodes.has(roleCode)) {
        await authService.logout();
        if (!active) return;
        clearUser();
        router.replace("/login?error=This account belongs to an administrator portal");
        return;
      }

      setUser(session.user);
    }

    void initialise();
    return () => {
      active = false;
    };
  }, [clearUser, router, setStatus, setUser]);

  useEffect(() => {
    if (status === "unauthenticated" && !isPublicPath(pathname)) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [pathname, router, status]);

  if ((status === "idle" || status === "loading" || status === "unauthenticated") && !isPublicPath(pathname)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#E8EEF3] text-[#2458E8]">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-[#2458E8]/20 border-t-[#2458E8]" />
          <p className="mt-3 text-sm font-medium">Restoring your secure session…</p>
        </div>
      </main>
    );
  }

  return children;
}
