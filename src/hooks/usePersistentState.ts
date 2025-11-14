import { useEffect, useState } from "react";

const isBrowser = typeof window !== "undefined";

export function usePersistentState<T>(key: string, initialValue: T) {
  const [state, setState] = useState<T>(() => {
    if (!isBrowser) return initialValue;

    try {
      const stored = window.localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored) as T;
      }
    } catch (error) {
      console.warn(`Failed to read localStorage key "${key}"`, error);
    }
    return initialValue;
  });

  useEffect(() => {
    if (!isBrowser) return;

    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.warn(`Failed to write localStorage key "${key}"`, error);
    }
  }, [key, state]);

  const reset = (value: T = initialValue) => {
    setState(value);
  };

  return [state, setState, reset] as const;
}



