"use client";

import { useSyncExternalStore } from "react";

type Listener = () => void;

export function createStoreHook<T extends object>(
  createState: (set: (updater: Partial<T> | ((current: T) => Partial<T>)) => void) => T
) {
  let state: T;
  const listeners = new Set<Listener>();

  const set = (updater: Partial<T> | ((current: T) => Partial<T>)) => {
    const patch = typeof updater === "function" ? updater(state) : updater;
    state = { ...state, ...patch };
    listeners.forEach((listener) => listener());
  };

  state = createState(set);

  const subscribe = (listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  return function useStore<Selected>(selector: (value: T) => Selected): Selected {
    return useSyncExternalStore(
      subscribe,
      () => selector(state),
      () => selector(state)
    );
  };
}
