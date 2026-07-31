import { apiRequest } from "@/lib/api-client";
import type { ClientTransfer, CreateTransferInput } from "@/types/transfer";

export const transferService = {
  create(input: CreateTransferInput): Promise<ClientTransfer> {
    return apiRequest<ClientTransfer>("/transfers", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  listMine(page = 1, pageSize = 20): Promise<ClientTransfer[]> {
    const query = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    });
    return apiRequest<ClientTransfer[]>(`/transfers/me?${query.toString()}`);
  },

  getMine(transferId: string): Promise<ClientTransfer> {
    return apiRequest<ClientTransfer>(`/transfers/me/${encodeURIComponent(transferId)}`);
  },
};
