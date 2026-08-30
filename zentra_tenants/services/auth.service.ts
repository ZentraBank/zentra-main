import {
  api,
  setAccessToken,
} from "@/lib/api";

import type {
  AuthSessionResponse,
  AuthUser,
} from "@/types/auth.types";

let authOperationVersion = 0;

export const getAuthOperationVersion = () =>
  authOperationVersion;

/*
|--------------------------------------------------------------------------
| Shared response types
|--------------------------------------------------------------------------
*/

type ApiResponse<T> = {
  data: T;
};

export type TenantRegistrationOtpResponse = {
  email: string;
  expiresIn: number;
};

export type TenantRegistrationVerificationResponse = {
  email: string;
  verified: boolean;
  registrationToken: string;
  registrationTokenExpiresIn: number;
};

export type TenantRegistrationCompleteResponse = {
  tenant: {
    id: string;
    name: string;
    code: string;
    status: "pending" | "active" | string;
    temporaryDomain: string;
  };

  owner: {
    id: string;
    membershipId: string;
    email: string;
    emailVerified: boolean;
    status: "pending" | "active" | string;
  };

  subscription: null;

  onboardingToken: string;
  onboardingTokenExpiresIn: number;

  nextStep: "choose_subscription" | string;
};

export type CompleteTenantRegistrationPayload = {
  email: string;
  registrationToken: string;

  ownerFirstName: string;
  ownerLastName: string;
  ownerPassword: string;

  name: string;
  code: string;
  appName: string;

  logoUrl?: string | null;
  primaryColor: string;
};

/*
|--------------------------------------------------------------------------
| Tenant registration
|--------------------------------------------------------------------------
*/

export async function requestTenantRegistrationOtp(
  email: string,
) {
  const response = await api.post<
    ApiResponse<TenantRegistrationOtpResponse>
  >(
    "/tenant-registration/request",
    {
      email: email
        .trim()
        .toLowerCase(),
    },
  );

  return response.data.data;
}

export async function verifyTenantRegistrationOtp(
  email: string,
  code: string,
) {
  const response = await api.post<
    ApiResponse<TenantRegistrationVerificationResponse>
  >(
    "/tenant-registration/verify",
    {
      email: email
        .trim()
        .toLowerCase(),

      code: code.trim(),
    },
  );

  return response.data.data;
}

export async function resendTenantRegistrationOtp(
  email: string,
) {
  const response = await api.post<
    ApiResponse<TenantRegistrationOtpResponse>
  >(
    "/tenant-registration/resend",
    {
      email: email
        .trim()
        .toLowerCase(),
    },
  );

  return response.data.data;
}

export async function completeTenantRegistration(
  payload: CompleteTenantRegistrationPayload,
) {
  const response = await api.post<
    ApiResponse<TenantRegistrationCompleteResponse>
  >(
    "/tenant-registration/complete",
    {
      ...payload,

      email: payload.email
        .trim()
        .toLowerCase(),

      registrationToken:
        payload.registrationToken.trim(),

      ownerFirstName:
        payload.ownerFirstName.trim(),

      ownerLastName:
        payload.ownerLastName.trim(),

      name:
        payload.name.trim(),

      code: payload.code
        .trim()
        .toLowerCase(),

      appName:
        payload.appName.trim(),

      logoUrl:
        payload.logoUrl || null,
    },
  );

  return response.data.data;
}

/*
|--------------------------------------------------------------------------
| Login
|--------------------------------------------------------------------------
*/

export async function login(
  email: string,
  password: string,
) {
  authOperationVersion += 1;

  const response = await api.post<
    ApiResponse<AuthSessionResponse>
  >(
    "/auth/login",
    {
      email: email
        .trim()
        .toLowerCase(),

      password,
    },
  );

  setAccessToken(
    response.data.data.accessToken,
  );

  return response.data.data;
}

/*
|--------------------------------------------------------------------------
| Restore session
|--------------------------------------------------------------------------
*/

export async function restoreSession() {
  const response = await api.post<
    ApiResponse<AuthSessionResponse>
  >(
    "/auth/refresh",
    {},
  );

  setAccessToken(
    response.data.data.accessToken,
  );

  return response.data.data;
}

/*
|--------------------------------------------------------------------------
| Current user
|--------------------------------------------------------------------------
*/

export async function getCurrentUser() {
  const response = await api.get<
    ApiResponse<AuthUser>
  >(
    "/auth/me",
  );

  return response.data.data;
}

/*
|--------------------------------------------------------------------------
| Logout
|--------------------------------------------------------------------------
*/

export async function logout() {
  authOperationVersion += 1;

  try {
    await api.post(
      "/auth/logout",
      {},
    );
  } finally {
    setAccessToken(null);
  }
}