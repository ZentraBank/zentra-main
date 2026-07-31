import { apiRequest } from "@/lib/api-client";
import type { DemoBank, ResolvedDemoAccount } from "@/types/demo-bank";
export const demoBankService = {
  list(): Promise<DemoBank[]> { return apiRequest<DemoBank[]>("/demo-banks"); },
  resolve(bankCode: string, accountNumber: string): Promise<ResolvedDemoAccount> {
    return apiRequest<ResolvedDemoAccount>("/demo-banks/resolve", { method: "POST", body: JSON.stringify({ bankCode, accountNumber }) });
  },
};
