import { apiRequest } from "@/src/lib/api-client";
import type {
  PlatformAuthResponse,
  PlatformLoginPayload,
  PlatformUser,
} from "@/src/types/auth";

export const platformAuthService = {
  login(payload: PlatformLoginPayload) {
    return apiRequest<PlatformAuthResponse>(
      "/superadmin/auth/login",
      {
        method: "POST",
        auth: false,
        body: JSON.stringify(payload),
      }
    );
  },

  logout(refreshToken: string) {
    return apiRequest<null>(
      "/superadmin/auth/logout",
      {
        method: "POST",
        auth: false,
        body: JSON.stringify({
          refreshToken,
        }),
      }
    );
  },

  me() {
    return apiRequest<PlatformUser>(
      "/superadmin/auth/me"
    );
  },
};
