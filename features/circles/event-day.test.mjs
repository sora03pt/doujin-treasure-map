import assert from "node:assert/strict";
import test from "node:test";

import {
  buildRecommendedRoute,
  filterCirclesForEventDay,
  parseEventDayFilters,
  sortCirclesForEventDay,
  summarizeCircleItems,
  summarizeEventDay,
} from "./event-day.ts";

function circle(
  id,
  priority,
  spaceNumber,
  visitStatus = "unvisited",
  hall = null,
) {
  return {
    id,
    eventId: "event-id",
    userId: "user-id",
    name: `Circle ${id}`,
    imagePath: null,
    imageUrl: null,
    distributionPostUrl: null,
    hall,
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

function routeIds(groups) {
  return groups.flatMap((group) => group.entries.map(({ circle: value }) => value.id));
}

function item(id, price, quantity) {
  return {
    id,
    circleId: "circle-id",
    userId: "user-id",
    name: `Item ${id}`,
    imagePath: null,
    imageUrl: null,
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

test("おすすめ巡回順はEventのホール順をpriorityより先に適用する", () => {
  const groups = buildRecommendedRoute(
    [
      circle("east-2-must", "must", "B1", "unvisited", "東2"),
      circle("east-1-want", "want", "A1", "unvisited", "東1"),
      circle("east-1-must", "must", "A9", "unvisited", "東1"),
    ],
    ["東1", "東2"],
    { visitStatus: "all", priority: "all" },
  );

  assert.deepEqual(groups.map(({ label }) => label), ["東1", "東2"]);
  assert.deepEqual(routeIds(groups), ["east-1-must", "east-1-want", "east-2-must"]);
  assert.deepEqual(
    groups.flatMap((group) => group.entries.map(({ position }) => position)),
    [1, 2, 3],
  );
});

test("同じホールとpriorityではspace_number自然順で未設定を最後にする", () => {
  const groups = buildRecommendedRoute(
    [
      circle("none", "must", null, "unvisited", "東1"),
      circle("a10", "must", "A10", "unvisited", "東1"),
      circle("a2", "must", "A2", "unvisited", "東1"),
    ],
    ["東1"],
    { visitStatus: "all", priority: "all" },
  );

  assert.deepEqual(routeIds(groups), ["a2", "a10", "none"]);
});

test("hall未設定とEvent使用ホール外は未分類として最後にまとめる", () => {
  const groups = buildRecommendedRoute(
    [
      circle("no-hall", "must", "A1"),
      circle("outside", "want", "A2", "unvisited", "東2"),
      circle("classified", "if_time", "A3", "unvisited", "東1"),
    ],
    ["東1"],
    { visitStatus: "all", priority: "all" },
  );

  assert.deepEqual(groups.map(({ label }) => label), ["東1", "未分類"]);
  assert.deepEqual(routeIds(groups), ["classified", "no-hall", "outside"]);
});

test("おすすめ巡回順は未訪問だけを対象にpriority filterも維持する", () => {
  const circles = [
    circle("target", "must", "A1", "unvisited", "東1"),
    circle("want", "want", "A2", "unvisited", "東1"),
    circle("purchased", "must", "A3", "purchased", "東1"),
    circle("sold-out", "must", "A4", "sold_out", "東1"),
    circle("skipped", "must", "A5", "skipped", "東1"),
  ];

  assert.deepEqual(
    routeIds(
      buildRecommendedRoute(circles, ["東1"], {
        visitStatus: "all",
        priority: "must",
      }),
    ),
    ["target"],
  );
  assert.deepEqual(
    buildRecommendedRoute(circles, ["東1"], {
      visitStatus: "purchased",
      priority: "all",
    }),
    [],
  );
});
