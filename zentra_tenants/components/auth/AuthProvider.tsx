"use client";

import { useEffect } from "react";
import { getAuthOperationVersion, restoreSession } from "@/services/auth.service";
import { setSessionListener } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);

  useEffect(() => {
    let active = true;
    const unsubscribe = setSessionListener((session) => {
      if (!active) return;
      if (session) setSession(session.user);
      else clearSession();
    });

    const operationVersion = getAuthOperationVersion();
    restoreSession()
      .then((session) => {
        if (active && operationVersion === getAuthOperationVersion()) {
          setSession(session.user);
        }
      })
      .catch(() => {
        if (active && operationVersion === getAuthOperationVersion()) {
          clearSession();
        }
      });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [clearSession, setSession]);

  return <>{children}</>;
}
