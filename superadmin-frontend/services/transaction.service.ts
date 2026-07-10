import { apiRequest } from "@/lib/api";
import type { Transaction } from "@/types/transaction.types";

export function getTransactions(token: string) {
  return apiRequest<Transaction[]>("/superadmin/transactions", { token });
}

export function getTransaction(id: string, token: string) {
  return apiRequest<Transaction>(`/superadmin/transactions/${id}`, { token });
}
