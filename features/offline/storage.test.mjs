import assert from "node:assert/strict";
import test from "node:test";

import "fake-indexeddb/auto";

import { createEventDaySnapshot } from "./snapshot.ts";
import {
  clearOfflineData,
  getActiveOfflineUser,
  loadEventDaySnapshot,
  saveEventDaySnapshot,
} from "./storage.ts";

const localValues = new Map();

globalThis.localStorage = {
  clear() {
    localValues.clear();
  },
  getItem(key) {
    return localValues.get(key) ?? null;
  },
  key(index) {
    return [...localValues.keys()][index] ?? null;
  },
  get length() {
    return localValues.size;
  },
  removeItem(key) {
    localValues.delete(key);
  },
  setItem(key, value) {
    localValues.set(key, String(value));
  },
};

const event = {
  id: "event-storage",
  userId: "user-storage",
  name: "保存前イベント",
  eventDate: "2026-09-07",
  plannedBudget: null,
  venue: null,
  memo: null,
  createdAt: "2026-09-07T01:00:00.000Z",
  updatedAt: "2026-09-07T01:00:00.000Z",
};

test("同じEventを置換し、logout相当のcleanupで全ローカルデータを削除する", async () => {
  await clearOfflineData();
  const firstSavedAt = new Date(Date.now() - 2_000).toISOString();
  const secondSavedAt = new Date(Date.now() - 1_000).toISOString();

  await saveEventDaySnapshot(
    createEventDaySnapshot(
      event.userId,
      event,
      [],
      [],
      firstSavedAt,
    ),
  );
  await saveEventDaySnapshot(
    createEventDaySnapshot(
      event.userId,
      { ...event, name: "保存後イベント" },
      [],
      [],
      secondSavedAt,
    ),
  );

  const restored = await loadEventDaySnapshot(
    event.userId,
    event.id,
  );

  assert.equal(restored?.event.name, "保存後イベント");
  assert.equal(getActiveOfflineUser(), event.userId);

  await clearOfflineData();

  assert.equal(getActiveOfflineUser(), null);
  assert.equal(
    await loadEventDaySnapshot(event.userId, event.id),
    null,
  );
});
