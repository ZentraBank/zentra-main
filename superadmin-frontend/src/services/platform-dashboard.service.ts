import { apiRequest } from "@/src/lib/api-client";
import type {
  PlatformDashboard,
} from "@/src/types/dashboard";

export const platformDashboardService = {
  getDashboard() {
    return apiRequest<PlatformDashboard>(
      "/superadmin/dashboard"
    );
  },
};
