import assert from "node:assert/strict";
import test from "node:test";

import {
  filterCirclesForEventDay,
  parseEventDayFilters,
  sortCirclesForEventDay,
  summarizeCircleItems,
  summarizeEventDay,
} from "./event-day.ts";

function circle(id, priority, spaceNumber, visitStatus = "unvisited") {
  return {
    id,
    eventId: "event-id",
    userId: "user-id",
    name: `Circle ${id}`,
    spaceNumber,
    xUrl: null,
    webUrl: null,
    memo: null,
    priority,
    assignee: null,
    visitStatus,
    createdAt: "2026-09-01T00:00:00Z",
    updatedAt: "2026-09-01T00:00:00Z",
  };
}

function item(id, price, quantity) {
  return {
    id,
    circleId: "circle-id",
    userId: "user-id",
    name: `Item ${id}`,
    price,
    quantity,
    memo: null,
    purchased: false,
    createdAt: "2026-09-01T00:00:00Z",
    updatedAt: "2026-09-01T00:00:00Z",
  };
}

test("priority順の後にスペース番号を自然順で並べる", () => {
  const circles = [
    circle("if-time", "if_time", "A1"),
    circle("want", "want", "A1"),
    circle("must-10", "must", "A10"),
    circle("must-none", "must", null),
    circle("must-2", "must", "A2"),
  ];

  assert.deepEqual(
    sortCirclesForEventDay(circles).map(({ id }) => id),
    ["must-2", "must-10", "must-none", "want", "if-time"],
  );
  assert.equal(circles[0]?.id, "if-time");
});

test("訪問状態とpriorityを組み合わせて絞り込む", () => {
  const circles = [
    circle("target", "must", "A1", "unvisited"),
    circle("status-mismatch", "must", "A2", "purchased"),
    circle("priority-mismatch", "want", "A3", "unvisited"),
  ];

  assert.deepEqual(
    filterCirclesForEventDay(circles, {
      visitStatus: "unvisited",
      priority: "must",
    }).map(({ id }) => id),
    ["target"],
  );
});

test("URL queryの許可値だけをfilterとして受け取る", () => {
  assert.deepEqual(
    parseEventDayFilters({ status: ["purchased", "skipped"], priority: "must" }),
    { visitStatus: "purchased", priority: "must" },
  );
  assert.deepEqual(
    parseEventDayFilters({ status: "unknown", priority: "invalid" }),
    { visitStatus: "all", priority: "all" },
  );
});

test("進捗件数を訪問状態ごとに集計する", () => {
  const progress = summarizeEventDay([
    circle("1", "must", "A1", "unvisited"),
    circle("2", "want", "A2", "purchased"),
    circle("3", "want", "A3", "sold_out"),
    circle("4", "if_time", "A4", "skipped"),
  ]);

  assert.deepEqual(progress, {
    total: 4,
    handled: 3,
    unvisited: 1,
    purchased: 1,
    sold_out: 1,
    skipped: 1,
  });
});

test("価格未設定を除外し、数量込みでItem合計を算出する", () => {
  const summary = summarizeCircleItems([
    item("priced", 500, 2),
    item("free", 0, 1),
    item("unknown", null, 3),
    item("fourth", 100, 1),
  ]);

  assert.equal(summary.itemCount, 4);
  assert.equal(summary.pricedItemCount, 3);
  assert.equal(summary.totalAmount, 1100);
  assert.deepEqual(summary.names, ["Item priced", "Item free", "Item unknown"]);
  assert.equal(summary.remainingCount, 1);
});
