export type PlatformAdministratorRole =
  | "platform_superadmin"
  | "platform_support"
  | "platform_auditor";

export type PlatformAdministratorStatus =
  | "pending"
  | "active"
  | "suspended"
  | "disabled";

export type PlatformAdministrator = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role_code: PlatformAdministratorRole;
  status: PlatformAdministratorStatus;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  permissions?: string[];
};

export type CreatePlatformAdministratorPayload = {
  email: string;
  firstName: string;
  lastName: string;
  roleCode: PlatformAdministratorRole;
  status: PlatformAdministratorStatus;
  temporaryPassword: string;
  permissions: string[];
};
