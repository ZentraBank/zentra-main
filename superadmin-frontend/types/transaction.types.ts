export type TransactionStatus =
  | "PENDING"
  | "PROCESSING"
  | "SUCCESSFUL"
  | "FAILED"
  | "REVERSED"
  | "UNDER_REVIEW";

export type Transaction = {
  id: string;
  tenantId: string;
  userId: string;
  type: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  createdAt: string;
};
