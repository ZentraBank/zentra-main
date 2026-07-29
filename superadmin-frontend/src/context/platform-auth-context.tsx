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
import { platformAuthService } from "@/src/services/platform-auth.service";
import type {
  PlatformLoginCredentials,
  PlatformUser,
} from "@/src/types/auth";

type PlatformAuthContextValue = {
  user: PlatformUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (
    credentials: PlatformLoginCredentials
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
      const accessToken =
        authStorage.getAccessToken();

      const refreshToken =
        authStorage.getRefreshToken();

      if (!accessToken && !refreshToken) {
        setUser(null);
        return;
      }

      try {
        const response =
          await platformAuthService.me();

        setUser(response.data ?? null);
      } catch (error) {
        console.error(
          "Unable to restore platform session:",
          error
        );

        setUser(null);
        authStorage.clear();
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
      credentials: PlatformLoginCredentials
    ) => {
      setIsLoading(true);

      try {
        const response =
          await platformAuthService.login(
            credentials
          );

        const authData = response.data;

        if (
          !authData?.accessToken ||
          !authData?.refreshToken
        ) {
          throw new Error(
            "The login response did not contain authentication tokens."
          );
        }

        authStorage.setTokens(
          authData.accessToken,
          authData.refreshToken
        );

        if (authData.user) {
          setUser(authData.user);
        } else {
          const meResponse =
            await platformAuthService.me();

          setUser(meResponse.data ?? null);
        }
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout =
    useCallback(async (): Promise<void> => {
      const refreshToken =
        authStorage.getRefreshToken();

      try {
        if (refreshToken) {
          await platformAuthService.logout(
            refreshToken
          );
        }
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

      const role =
        user.roleCode ??
        user.role_code ??
        user.role;

      if (role === "platform_superadmin") {
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
    <PlatformAuthContext.Provider value={value}>
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