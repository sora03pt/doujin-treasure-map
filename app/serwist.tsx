"use client";

import { SerwistProvider } from "@serwist/next/react";

import { ConnectivityProvider } from "@/features/offline/components/connectivity-provider";

export function AppServiceWorker({ children }: { children: React.ReactNode }) {
  return (
    <SerwistProvider
      disable={process.env.NODE_ENV !== "production"}
      swUrl="/sw.js"
    >
      <ConnectivityProvider>{children}</ConnectivityProvider>
    </SerwistProvider>
  );
}
