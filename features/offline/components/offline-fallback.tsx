"use client";

import { useEffect, useState } from "react";

import { useConnectivity } from "@/features/offline/components/connectivity-provider";
import { OfflineEventDayView } from "@/features/offline/components/offline-event-day-view";
import {
  getActiveOfflineUser,
  loadEventDaySnapshot,
} from "@/features/offline/storage";
import type { EventDaySnapshot } from "@/features/offline/types";

function getEventIdFromPath(pathname: string) {
  return pathname.match(/^\/events\/([^/]+)\/?$/)?.[1] ?? null;
}

export function OfflineFallback() {
  const { state, checkConnection } = useConnectivity();
  const [snapshot, setSnapshot] = useState<EventDaySnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = getActiveOfflineUser();
    const eventId = getEventIdFromPath(window.location.pathname);

    const snapshotPromise =
      userId && eventId
        ? loadEventDaySnapshot(userId, eventId)
        : Promise.resolve(null);

    snapshotPromise
      .then(setSnapshot)
      .finally(() => setLoading(false));
  }, []);

  async function retry() {
    if (await checkConnection()) {
      window.location.reload();
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-950 sm:px-6 dark:bg-slate-950 dark:text-slate-50">
      <div className="mx-auto w-full max-w-2xl">
        <div
          className="mb-5 border-l-4 border-amber-500 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:bg-amber-950 dark:text-amber-100"
          role="status"
        >
          <p className="font-semibold">
            {state === "online" ? "接続が復帰しました" : "現在オフラインです"}
          </p>
          <p className="mt-1">
            オフラインデータは保存時点の内容です。更新操作はできません。
          </p>
        </div>

        {loading ? (
          <p role="status">保存済みデータを確認しています...</p>
        ) : snapshot ? (
          <OfflineEventDayView snapshot={snapshot} />
        ) : (
          <section aria-labelledby="offline-title" className="py-8">
            <h1 className="text-2xl font-semibold" id="offline-title">
              このページはオフラインでは開けません
            </h1>
            <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">
              一度オンラインで開いたEventの当日情報は、保存されていれば再表示できます。接続復帰後にもう一度お試しください。
            </p>
          </section>
        )}

        <button
          className="mt-6 min-h-12 w-full rounded-lg bg-slate-950 px-5 font-semibold text-white hover:bg-slate-800 disabled:cursor-wait disabled:opacity-60 dark:bg-white dark:text-slate-950"
          disabled={state === "checking"}
          onClick={retry}
          type="button"
        >
          {state === "checking" ? "接続を確認中..." : "接続を確認して再試行"}
        </button>
      </div>
    </main>
  );
}
