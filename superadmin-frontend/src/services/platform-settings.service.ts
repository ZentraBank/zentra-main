import { apiRequest } from "@/src/lib/api-client";
import type {
  PlatformSetting,
} from "@/src/types/platform-operations";

export const platformSettingsService = {
  list() {
    return apiRequest<PlatformSetting[]>(
      "/superadmin/settings"
    );
  },

  get(settingKey: string) {
    return apiRequest<PlatformSetting>(
      `/superadmin/settings/${settingKey}`
    );
  },

  save(
    settingKey: string,
    payload: {
      value: unknown;
      isSecret: boolean;
      description?: string;
      reason?: string;
    }
  ) {
    return apiRequest<PlatformSetting>(
      `/superadmin/settings/${settingKey}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      }
    );
  },

  history(settingKey: string, limit = 50) {
    return apiRequest<Array<Record<string, unknown>>>(
      `/superadmin/settings/${settingKey}/history?limit=${limit}`
    );
  },
};
