/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  accountService,
  type AccountActivity,
} from "@/services/account.service";

import {
  transferService,
} from "@/services/transfer.service";

import {
  cardService,
} from "@/services/card.service";

import {
  notificationService,
} from "@/services/notification.service";

import type {
  ClientAccount,
} from "@/types/account";

import type {
  ClientTransfer,
} from "@/types/transfer";

import type {
  ClientCard,
} from "@/types/card";

import type {
  ClientNotification,
} from "@/types/notification";

import type {
  CardPurchaseRequest,
} from "@/services/card.service";

export function useClientOverview() {
  const [
    accounts,
    setAccounts,
  ] =
    useState<ClientAccount[]>(
      [],
    );

  const [
    transfers,
    setTransfers,
  ] =
    useState<ClientTransfer[]>(
      [],
    );

  const [
    activity,
    setActivity,
  ] =
    useState<AccountActivity[]>(
      [],
    );

  const [
    cards,
    setCards,
  ] =
    useState<ClientCard[]>(
      [],
    );

  const [
    notifications,
    setNotifications,
  ] =
    useState<
      ClientNotification[]
    >([]);

  const [
    cardPurchaseRequests,
    setCardPurchaseRequests,
  ] =
    useState<
      CardPurchaseRequest[]
    >([]);

  const [
    unreadNotificationCount,
    setUnreadNotificationCount,
  ] =
    useState(0);

  const [
    isLoading,
    setIsLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  const load =
    useCallback(async () => {
      setIsLoading(true);
      setError(null);

      const [
        accountsResult,
        transfersResult,
        activityResult,
        cardsResult,
        notificationsResult,
        unreadResult,
        cardRequestsResult,
      ] =
        await Promise.allSettled([
          accountService.listMine(),

          transferService.listMine(
            1,
            5,
          ),

          accountService.listMyActivity(
            1,
            5,
          ),

          cardService.listMine(),

          notificationService.list(
            1,
            5,
          ),

          notificationService.unreadCount(),

          cardService.listMyPurchaseRequests(),
        ]);

      if (
        accountsResult.status ===
        "fulfilled"
      ) {
        setAccounts(
          accountsResult.value,
        );
      }

      if (
        transfersResult.status ===
        "fulfilled"
      ) {
        setTransfers(
          transfersResult.value,
        );
      }

      if (
        activityResult.status ===
        "fulfilled"
      ) {
        setActivity(
          activityResult.value.activity,
        );
      }

      if (
        cardsResult.status ===
        "fulfilled"
      ) {
        setCards(
          cardsResult.value,
        );
      }

      if (
        notificationsResult.status ===
        "fulfilled"
      ) {
        setNotifications(
          notificationsResult.value,
        );
      }

      if (
        unreadResult.status ===
        "fulfilled"
      ) {
        setUnreadNotificationCount(
          unreadResult.value,
        );
      }

      if (
        cardRequestsResult.status ===
        "fulfilled"
      ) {
        setCardPurchaseRequests(
          cardRequestsResult.value,
        );
      }

      /*
       * Accounts and account activity are
       * the critical dashboard banking data.
       *
       * Transfers can still be loaded for
       * other widgets/features, but the
       * homepage transaction history should
       * now use ledger activity.
       */
      const criticalFailure =
        accountsResult.status ===
          "rejected" ||
        activityResult.status ===
          "rejected";

      if (criticalFailure) {
        const reason =
          accountsResult.status ===
          "rejected"
            ? accountsResult.reason
            : activityResult.status ===
                "rejected"
              ? activityResult.reason
              : null;

        setError(
          reason instanceof Error
            ? reason.message
            : "Unable to load your banking information",
        );
      }

      setIsLoading(false);
    }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    accounts,

    /*
     * Keep transfers because other client
     * pages may still rely on them.
     */
    transfers,

    /*
     * Use this for homepage transaction
     * history / unified account activity.
     */
    activity,

    cards,
    notifications,
    unreadNotificationCount,
    cardPurchaseRequests,

    isLoading,
    error,

    reload:
      load,
  };
}