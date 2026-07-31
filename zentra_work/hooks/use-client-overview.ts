"use client";

import { useCallback, useEffect, useState } from "react";
import { accountService } from "@/services/account.service";
import { transferService } from "@/services/transfer.service";
import type { ClientAccount } from "@/types/account";
import type { ClientTransfer } from "@/types/transfer";

export function useClientOverview() {
  const [accounts, setAccounts] = useState<ClientAccount[]>([]);
  const [transfers, setTransfers] = useState<ClientTransfer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [nextAccounts, nextTransfers] = await Promise.all([
        accountService.listMine(),
        transferService.listMine(1, 5),
      ]);
      setAccounts(nextAccounts);
      setTransfers(nextTransfers);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load your dashboard");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { accounts, transfers, isLoading, error, reload: load };
}
