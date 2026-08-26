export type PlatformRole =
  | "platform_superadmin"
  | "platform_support"
  | "platform_auditor";

export type PlatformUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: PlatformRole;
  status:
    | "pending"
    | "active"
    | "suspended"
    | "disabled";
  permissions: string[];
  lastLoginAt: string | null;
};

export type PlatformLoginPayload = {
  email: string;
  password: string;
  deviceName?: string;
};

export type PlatformAuthResponse = {
  accessToken: string;
  accessTokenExpiresIn: string;
  user: PlatformUser;
};