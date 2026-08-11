"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { restoreSession } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";

const safeNextPath = (value: string | null) =>
  value && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/dashboard";

export default function SocialLoginCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      clearSession();
      router.replace(`/login?social_error=${encodeURIComponent(error)}`);
      return;
    }

    restoreSession()
      .then((session) => {
        setSession(session.user);
        router.replace(safeNextPath(searchParams.get("next")));
      })
      .catch(() => {
        clearSession();
        router.replace("/login?social_error=Social%20login%20could%20not%20be%20completed");
      });
  }, [clearSession, router, searchParams, setSession]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-black text-white">
      <div className="text-center">
        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        <p className="text-sm">Completing secure sign-in…</p>
      </div>
    </main>
  );
}
