"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import type { ConnectivityState } from "@/features/offline/types";

type ConnectivityContextValue = {
  state: ConnectivityState;
  isOnline: boolean;
  reconnectVersion: number;
  checkConnection: () => Promise<boolean>;
};

const ConnectivityContext = createContext<ConnectivityContextValue | null>(
  null,
);

export function ConnectivityProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ConnectivityState>("checking");
  const [announcement, setAnnouncement] = useState("");
  const [reconnectVersion, setReconnectVersion] = useState(0);
  const previousStateRef = useRef<ConnectivityState>("checking");

  const applyState = useCallback((nextState: ConnectivityState) => {
    const previousState = previousStateRef.current;
    previousStateRef.current = nextState;
    setState(nextState);

    if (nextState === "offline" && previousState !== "offline") {
      setAnnouncement("オフラインになりました。更新操作は利用できません。");
    }

    if (nextState === "online" && previousState === "offline") {
      setAnnouncement("オンラインに復帰しました。最新情報を確認します。");
      setReconnectVersion((version) => version + 1);
    }
  }, []);

  const checkConnection = useCallback(async () => {
    if (!navigator.onLine) {
      applyState("offline");
      return false;
    }

    setState("checking");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 4_000);

    try {
      const response = await fetch(`/api/connectivity?t=${Date.now()}`, {
        cache: "no-store",
        credentials: "same-origin",
        signal: controller.signal,
      });
      const isReachable = response.ok;
      applyState(isReachable ? "online" : "offline");
      return isReachable;
    } catch {
      applyState("offline");
      return false;
    } finally {
      window.clearTimeout(timeout);
    }
  }, [applyState]);

  useEffect(() => {
    const initialCheck = window.setTimeout(() => void checkConnection(), 0);

    const handleOffline = () => applyState("offline");
    const handleOnline = () => void checkConnection();
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        void checkConnection();
      }
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    window.addEventListener("focus", handleOnline);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.clearTimeout(initialCheck);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("focus", handleOnline);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [applyState, checkConnection]);

  return (
    <ConnectivityContext.Provider
      value={{
        state,
        isOnline: state !== "offline",
        reconnectVersion,
        checkConnection,
      }}
    >
      {children}
      <p aria-live="polite" className="sr-only" role="status">
        {announcement}
      </p>
    </ConnectivityContext.Provider>
  );
}

export function useConnectivity() {
  const context = useContext(ConnectivityContext);

  if (!context) {
    throw new Error("useConnectivity must be used within ConnectivityProvider.");
  }

  return context;
}
