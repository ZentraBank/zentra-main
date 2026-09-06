import {
  apiRequest,
  API_BASE_URL,
} from "@/lib/api-client";

import { authToken } from "@/lib/auth-token";

import {
  getTenantSlug,
  setTenantSlug,
} from "@/lib/tenant";

import type {
  AuthSession,
  AuthUser,
} from "@/types/auth";

export type SocialProvider =
  | "google"
  | "facebook";

export type CodeResponse = {
  email: string;
  tenantId?: string;
  tenantSlug?: string;
  expiresIn: number;
  developmentCode?: string;
};

export const authService = {
  async register(payload: {
    inviteCode: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
    phone?: string;
    password: string;
  }): Promise<CodeResponse> {
    const result =
      await apiRequest<CodeResponse>(
        "/auth/register",
        {
          method: "POST",
          skipAuth: true,
          body: JSON.stringify(
            payload,
          ),
        },
      );

    if (result.tenantSlug) {
      setTenantSlug(
        result.tenantSlug,
      );
    }

    return result;
  },

  verifyRegistration(
    email: string,
    code: string,
  ): Promise<{
    email: string;
  }> {
    return apiRequest(
      "/auth/register/verify",
      {
        method: "POST",
        skipAuth: true,
        body: JSON.stringify({
          email,
          code,
        }),
      },
    );
  },

  resendRegistration(
    email: string,
  ): Promise<CodeResponse> {
    return apiRequest(
      "/auth/register/resend",
      {
        method: "POST",
        skipAuth: true,
        body: JSON.stringify({
          email,
        }),
      },
    );
  },

  forgotPassword(
    email: string,
  ): Promise<CodeResponse> {
    return apiRequest(
      "/auth/forgot-password",
      {
        method: "POST",
        skipAuth: true,
        body: JSON.stringify({
          email,
        }),
      },
    );
  },

  resetPassword(
    email: string,
    code: string,
    newPassword: string,
  ): Promise<null> {
    return apiRequest(
      "/auth/reset-password",
      {
        method: "POST",
        skipAuth: true,
        body: JSON.stringify({
          email,
          code,
          newPassword,
        }),
      },
    );
  },

  changePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<null> {
    return apiRequest(
      "/auth/change-password",
      {
        method: "POST",
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      },
    );
  },

  async login(
    email: string,
    password: string,
  ): Promise<AuthSession> {
    const session =
      await apiRequest<AuthSession>(
        "/auth/login",
        {
          method: "POST",
          skipAuth: true,
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        },
      );

    authToken.set(
      session.accessToken,
    );

    return session;
  },

  async restore():
    Promise<AuthSession | null> {
    try {
      const session =
        await apiRequest<AuthSession>(
          "/auth/refresh",
          {
            method: "POST",
            skipAuth: true,
            body: JSON.stringify({}),
          },
        );

      authToken.set(
        session.accessToken,
      );

      return session;
    } catch {
      authToken.clear();

      return null;
    }
  },

  me(): Promise<AuthUser> {
    return apiRequest<AuthUser>(
      "/auth/me",
    );
  },

  async logout():
    Promise<void> {
    try {
      await apiRequest<null>(
        "/auth/logout",
        {
          method: "POST",
          body: JSON.stringify({}),
          retryOnUnauthorized:
            false,
        },
      );
    } finally {
      authToken.clear();
    }
  },

  socialLoginUrl(
    provider:
      SocialProvider,
    next = "/dashboard",
  ): string {
    const params =
      new URLSearchParams({
        next,
        tenant:
          getTenantSlug(),
      });

    return `${API_BASE_URL}/auth/social/${provider}/start?${params.toString()}`;
  },
};