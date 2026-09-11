"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useConnectivity } from "@/features/offline/components/connectivity-provider";
import { saveEventDaySnapshot } from "@/features/offline/storage";
import type { EventDaySnapshot } from "@/features/offline/types";

const savedAtFormatter = new Intl.DateTimeFormat("ja-JP", {
  month: "numeric",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function EventDaySnapshotManager({
  snapshot,
}: {
  snapshot: EventDaySnapshot;
}) {
  const router = useRouter();
  const { state, isOnline, reconnectVersion } = useConnectivity();
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [storageError, setStorageError] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      return;
    }

    let active = true;

    saveEventDaySnapshot(snapshot)
      .then(() => {
        if (active) {
          setSavedAt(snapshot.savedAt);
          setStorageError(false);
        }
      })
      .catch(() => {
        if (active) {
          setStorageError(true);
        }
      });

    return () => {
      active = false;
    };
  }, [isOnline, snapshot]);

  useEffect(() => {
    if (reconnectVersion > 0) {
      router.refresh();
    }
  }, [reconnectVersion, router]);

  const statusLabel =
    state === "offline"
      ? "オフライン"
      : state === "checking"
        ? "接続確認中"
        : "オンライン";

  return (
    <section
      aria-label="接続とオフライン保存の状態"
      className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-y border-slate-200 py-2 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-300"
    >
      <p className="font-semibold" role="status">
        接続: {statusLabel}
      </p>
      {savedAt ? (
        <p>オフライン保存: {savedAtFormatter.format(new Date(savedAt))}</p>
      ) : null}
      {state === "offline" ? (
        <p className="basis-full font-medium text-amber-800 dark:text-amber-200">
          表示中の内容は古い可能性があります。更新操作は利用できません。
        </p>
      ) : null}
      {storageError ? (
        <p className="basis-full text-red-700 dark:text-red-300" role="alert">
          オフライン用データを保存できませんでした。
        </p>
      ) : null}
    </section>
  );
}
