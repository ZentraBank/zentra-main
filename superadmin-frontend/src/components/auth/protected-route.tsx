"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { usePlatformAuth } from "@/src/context/platform-auth-context";

export function ProtectedRoute({
  children,
  permission,
}: {
  children: React.ReactNode;
  permission?: string;
}) {
  const router = useRouter();

  const {
    isLoading,
    isAuthenticated,
    hasPermission,
  } = usePlatformAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [
    isLoading,
    isAuthenticated,
    router,
  ]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-neutral-500">
          Loading platform session…
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (
    permission &&
    !hasPermission(permission)
  ) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-semibold">
            Access denied
          </h1>

          <p className="mt-2 text-sm text-neutral-500">
            Your platform account does not
            have permission to view this page.
          </p>
        </div>
      </div>
    );
  }

  return children;
}
