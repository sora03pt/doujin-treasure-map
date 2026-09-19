import assert from "node:assert/strict";
import test from "node:test";

import {
  createEventDaySnapshot,
  getRecordsToDelete,
  getSnapshotKey,
  MAX_OFFLINE_EVENTS_PER_USER,
  OFFLINE_SNAPSHOT_MAX_AGE_MS,
  restoreSnapshot,
  serializeSnapshot,
} from "./snapshot.ts";

const savedAt = "2026-09-06T03:00:00.000Z";
const now = Date.parse(savedAt);
const event = {
  id: "event-a",
  userId: "user-a",
  name: "テストイベント",
  eventDate: "2026-09-06",
  plannedBudget: 5_000,
  venue: "テスト会場",
  memo: null,
  createdAt: savedAt,
  updatedAt: savedAt,
};
const circles = [
  {
    id: "circle-a",
    eventId: event.id,
    userId: event.userId,
    name: "テストサークル",
    imagePath: "user-a/circles/circle-a/reference",
    imageUrl: "https://storage.example.test/signed-circle-image",
    distributionPostUrl: "https://x.com/test/status/123",
    spaceNumber: "A01",
    xUrl: null,
    webUrl: null,
    memo: null,
    priority: "must",
    assignee: "担当A",
    visitStatus: "purchased",
    createdAt: savedAt,
    updatedAt: savedAt,
  },
];
const items = [
  {
    id: "item-priced",
    circleId: circles[0].id,
    userId: event.userId,
    name: "新刊",
    imagePath: "user-a/items/item-priced/reference",
    imageUrl: "https://storage.example.test/signed-item-image",
    price: 700,
    quantity: 2,
    memo: null,
    purchased: false,
    createdAt: savedAt,
    updatedAt: savedAt,
  },
  {
    id: "item-unpriced",
    circleId: circles[0].id,
    userId: event.userId,
    name: "価格未定グッズ",
    imagePath: null,
    imageUrl: null,
    price: null,
    quantity: 3,
    memo: null,
    purchased: false,
    createdAt: savedAt,
    updatedAt: savedAt,
  },
];

test("snapshotをserializeして同じユーザーとEventで復元できる", () => {
  const snapshot = createEventDaySnapshot(
    event.userId,
    event,
    circles,
    items,
    savedAt,
  );
  const serialized = serializeSnapshot(snapshot);
  const restored = restoreSnapshot(
    serialized,
    event.userId,
    event.id,
    now,
  );

  assert.deepEqual(restored, snapshot);
  for (const forbiddenField of [
    "access_token",
    "refresh_token",
    "password",
    "publishable_key",
    "service_role",
    "signed-circle-image",
    "signed-item-image",
    "imagePath",
    "imageUrl",
  ]) {
    assert.equal(serialized.includes(forbiddenField), false);
  }
});

test("price、quantity、購入済みCircle、予算をsnapshotへ保持する", () => {
  const snapshot = createEventDaySnapshot(
    event.userId,
    event,
    circles,
    items,
    savedAt,
  );

  assert.equal(snapshot.circles[0].totalAmount, 1_400);
  assert.equal(snapshot.circles[0].items[0].quantity, 2);
  assert.equal(snapshot.circles[0].items[1].price, null);
  assert.deepEqual(snapshot.budgetSummary, {
    plannedBudget: 5_000,
    registeredTotal: 1_400,
    purchasedTotal: 1_400,
    remainingBudget: 3_600,
  });
});

test("期限を過ぎたsnapshotは復元しない", () => {
  const snapshot = createEventDaySnapshot(
    event.userId,
    event,
    circles,
    items,
    savedAt,
  );

  assert.equal(
    restoreSnapshot(
      serializeSnapshot(snapshot),
      event.userId,
      event.id,
      now + OFFLINE_SNAPSHOT_MAX_AGE_MS + 1,
    ),
    null,
  );
});

test("User AのsnapshotをUser Bとして復元できない", () => {
  const snapshot = createEventDaySnapshot(
    event.userId,
    event,
    circles,
    items,
    savedAt,
  );

  assert.notEqual(
    getSnapshotKey("user-a", event.id),
    getSnapshotKey("user-b", event.id),
  );
  assert.equal(
    restoreSnapshot(serializeSnapshot(snapshot), "user-b", event.id, now),
    null,
  );
});

test("同じEventはkeyで置換できる", () => {
  assert.equal(
    getSnapshotKey(event.userId, event.id),
    getSnapshotKey(event.userId, event.id),
  );
});

test("期限切れと上限を超えたsnapshotだけを削除する", () => {
  const recentRecords = Array.from(
    { length: MAX_OFFLINE_EVENTS_PER_USER + 1 },
    (_, index) => ({
      key: `user-a:event-${index}`,
      userId: "user-a",
      eventId: `event-${index}`,
      savedAt: new Date(now - index * 1_000).toISOString(),
      serialized: "{}",
    }),
  );
  const expired = {
    key: "user-a:expired",
    userId: "user-a",
    eventId: "expired",
    savedAt: new Date(now - OFFLINE_SNAPSHOT_MAX_AGE_MS - 1).toISOString(),
    serialized: "{}",
  };
  const otherUser = {
    key: "user-b:event-1",
    userId: "user-b",
    eventId: "event-1",
    savedAt,
    serialized: "{}",
  };

  assert.deepEqual(
    new Set(
      getRecordsToDelete([...recentRecords, expired, otherUser], "user-a", now),
    ),
    new Set(["user-a:event-5", "user-a:expired"]),
  );
});
