import { create } from "zustand";

type NotificationState = {
  unreadCount: number;

  setUnreadCount: (
    count: number,
  ) => void;

  decrementUnreadCount: () => void;

  clearUnreadCount: () => void;
};

export const useNotificationStore =
  create<NotificationState>(
    (set) => ({
      unreadCount: 0,

      setUnreadCount: (
        count,
      ) =>
        set({
          unreadCount:
            Math.max(
              0,
              Number(count) || 0,
            ),
        }),

      decrementUnreadCount:
        () =>
          set(
            (state) => ({
              unreadCount:
                Math.max(
                  0,
                  state.unreadCount -
                    1,
                ),
            }),
          ),

      clearUnreadCount:
        () =>
          set({
            unreadCount: 0,
          }),
    }),
  );