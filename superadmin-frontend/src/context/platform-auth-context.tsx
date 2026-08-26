"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { authStorage } from "@/src/lib/auth-storage";
import { ApiError } from "@/src/lib/api-error";
import { platformAuthService } from "@/src/services/platform-auth.service";

import type {
  PlatformLoginPayload,
  PlatformUser,
} from "@/src/types/auth";

type PlatformAuthContextValue = {
  user: PlatformUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (
    credentials: PlatformLoginPayload
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
};

const PlatformAuthContext =
  createContext<PlatformAuthContextValue | null>(
    null
  );

type PlatformAuthProviderProps = {
  children: ReactNode;
};

export function PlatformAuthProvider({
  children,
}: PlatformAuthProviderProps) {
  const [user, setUser] =
    useState<PlatformUser | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

 const refreshUser =
  useCallback(async (): Promise<void> => {
    try {
      const response =
        await platformAuthService.me();

      setUser(response.data ?? null);
    } catch (error) {
      /*
       * A 401 here simply means there is
       * no active platform session.
       *
       * This is normal when visiting /login
       * before authentication.
       */
      if (
        error instanceof ApiError &&
        error.status === 401
      ) {
        authStorage.clear();
        setUser(null);
        return;
      }

      console.error(
        "Unable to restore platform session:",
        error
      );

      authStorage.clear();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const initialiseSession = async () => {
      try {
        await refreshUser();
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void initialiseSession();

    return () => {
      mounted = false;
    };
  }, [refreshUser]);

  const login = useCallback(
    async (
      credentials: PlatformLoginPayload
    ): Promise<void> => {
      setIsLoading(true);

      try {
        const response =
          await platformAuthService.login(
            credentials
          );

        const authData = response.data;

        if (!authData?.accessToken) {
          throw new Error(
            "The login response did not contain an access token."
          );
        }

        authStorage.setAccessToken(
          authData.accessToken
        );

        if (authData.user) {
          setUser(authData.user);
          return;
        }

        const meResponse =
          await platformAuthService.me();

        setUser(meResponse.data ?? null);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout =
    useCallback(async (): Promise<void> => {
      try {
        await platformAuthService.logout();
      } catch (error) {
        console.error(
          "Platform logout request failed:",
          error
        );
      } finally {
        authStorage.clear();
        setUser(null);
        setIsLoading(false);
      }
    }, []);

  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!user) {
        return false;
      }

      if (
        user.role ===
        "platform_superadmin"
      ) {
        return true;
      }

      return (
        user.permissions?.includes(permission) ??
        false
      );
    },
    [user]
  );

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      logout,
      refreshUser,
      hasPermission,
    }),
    [
      user,
      isLoading,
      login,
      logout,
      refreshUser,
      hasPermission,
    ]
  );

  return (
    <PlatformAuthContext.Provider
      value={value}
    >
      {children}
    </PlatformAuthContext.Provider>
  );
}

export function usePlatformAuth() {
  const context = useContext(
    PlatformAuthContext
  );

  if (!context) {
    throw new Error(
      "usePlatformAuth must be used inside PlatformAuthProvider."
    );
  }

  return context;
}