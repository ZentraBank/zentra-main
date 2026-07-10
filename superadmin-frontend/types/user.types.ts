export type PlatformUser = {
  id: string;
  tenantId: string;
  fullName: string;
  email: string;
  accountNumber?: string;
  kycStatus: "PENDING" | "VERIFIED" | "REJECTED";
  status: "ACTIVE" | "SUSPENDED" | "DISABLED";
};
