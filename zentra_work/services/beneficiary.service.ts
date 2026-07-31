import { apiRequest } from "@/lib/api-client";
import type { Beneficiary, CreateBeneficiaryInput } from "@/types/beneficiary";

export const beneficiaryService = {
  listMine(search = "", page = 1, pageSize = 100): Promise<Beneficiary[]> {
    const query = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      search,
    });
    return apiRequest<Beneficiary[]>(`/beneficiaries/me?${query.toString()}`);
  },

  create(input: CreateBeneficiaryInput): Promise<Beneficiary> {
    return apiRequest<Beneficiary>("/beneficiaries", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  remove(beneficiaryId: string): Promise<{ id: string; removed: boolean }> {
    return apiRequest(`/beneficiaries/me/${encodeURIComponent(beneficiaryId)}`, {
      method: "DELETE",
    });
  },
};
