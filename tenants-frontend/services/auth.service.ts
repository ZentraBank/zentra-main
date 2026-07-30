import { api, setAccessToken } from "@/lib/api";
import type { AuthSessionResponse, AuthUser } from "@/types/auth.types";

let authOperationVersion = 0;
export const getAuthOperationVersion = () => authOperationVersion;

export async function login(email: string, password: string) {
  authOperationVersion += 1;
  const response = await api.post<{ data: AuthSessionResponse }>("/auth/login", {
    email: email.trim().toLowerCase(),
    password,
  });
  setAccessToken(response.data.data.accessToken);
  return response.data.data;
}

export async function restoreSession() {
  const response = await api.post<{ data: AuthSessionResponse }>("/auth/refresh", {});
  setAccessToken(response.data.data.accessToken);
  return response.data.data;
}

export async function getCurrentUser() {
  const response = await api.get<{ data: AuthUser }>("/auth/me");
  return response.data.data;
}

export async function logout() {
  authOperationVersion += 1;
  try {
    await api.post("/auth/logout", {});
  } finally {
    setAccessToken(null);
  }
}
