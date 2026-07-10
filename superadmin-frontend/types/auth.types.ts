export type UserRole = "SUPER_ADMIN" | "TENANT_ADMIN" | "AGENT" | "CUSTOMER";

export type AuthUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  tenantId: string | null;
  status: "ACTIVE" | "SUSPENDED" | "DISABLED";
  permissions: string[];
};

export type AuthSession = {
  user: AuthUser;
  accessToken: string;
};
