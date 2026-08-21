import { apiRequest } from "@/lib/api-client";
import type { ClientTransaction } from "@/types/transaction";

type TransactionListResponse = {
  activity: ClientTransaction[];

  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

type ListMineOptions = {
  page?: number;
  pageSize?: number;
};

export const transactionService = {
  async listMine(
    options: ListMineOptions = {},
  ): Promise<ClientTransaction[]> {
    const {
      page = 1,
      pageSize = 50,
    } = options;

    const params =
      new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });

    const result =
      await apiRequest<TransactionListResponse>(
        `/accounts/me/activity?${params.toString()}`,
      );

    return result.activity;
  },
};