import { apiRequest } from "@/lib/api-client";
import type { ClientTransaction } from "@/types/transaction";

export const transactionService = {
  listMine(options: { page?: number; pageSize?: number; accountId?: string; type?: "credit" | "debit" } = {}) {
    const query = new URLSearchParams({
      page: String(options.page ?? 1),
      pageSize: String(options.pageSize ?? 50),
    });
    if (options.accountId) query.set("accountId", options.accountId);
    if (options.type) query.set("type", options.type);
    return apiRequest<ClientTransaction[]>(`/transactions/me?${query.toString()}`);
  },
  getMine(id: string) {
    return apiRequest<ClientTransaction>(`/transactions/me/${encodeURIComponent(id)}`);
  },
};
