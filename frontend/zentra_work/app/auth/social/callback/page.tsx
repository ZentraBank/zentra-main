"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";

function SocialCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    async function completeLogin() {
      const error = searchParams.get("error");
      if (error) {
        router.replace(`/login?error=${encodeURIComponent(error)}`);
        return;
      }

      const session = await authService.restore();
      if (!session) {
        router.replace("/login?error=Social login could not be completed");
        return;
      }

      setUser(session.user);
      router.replace(searchParams.get("next") || "/dashboard");
    }

    void completeLogin();
  }, [router, searchParams, setUser]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#E8EEF3] text-[#2458E8]">
      <div className="text-center">
        <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-[#2458E8]/20 border-t-[#2458E8]" />
        <p className="mt-3 text-sm font-medium">Completing secure login…</p>
      </div>
    </main>
  );
}


export default function SocialCallbackPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#E8EEF3]" />}>
      <SocialCallbackContent />
    </Suspense>
  );
}
