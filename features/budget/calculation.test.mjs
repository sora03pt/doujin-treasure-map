import assert from "node:assert/strict";
import test from "node:test";

import { calculateBudgetSummary } from "./calculation.ts";

function circle(id, visitStatus = "unvisited") {
  return { id, visitStatus };
}

function item(circleId, price, quantity = 1) {
  return { circleId, price, quantity };
}

test("登録済みItemの通常合計を計算する", () => {
  const summary = calculateBudgetSummary(
    5_000,
    [circle("a"), circle("b")],
    [item("a", 500), item("b", 1_000)],
  );

  assert.equal(summary.registeredTotal, 1_500);
});

test("Item小計へquantityを反映する", () => {
  const summary = calculateBudgetSummary(
    5_000,
    [circle("a")],
    [item("a", 700, 3)],
  );

  assert.equal(summary.registeredTotal, 2_100);
});

test("priceがnullのItemを集計対象外にする", () => {
  const summary = calculateBudgetSummary(
    5_000,
    [circle("a")],
    [item("a", null, 4), item("a", 500)],
  );

  assert.equal(summary.registeredTotal, 500);
});

test("purchasedのCircle配下だけを購入済み総額へ含める", () => {
  const summary = calculateBudgetSummary(
    5_000,
    [circle("purchased", "purchased"), circle("unvisited")],
    [item("purchased", 800, 2), item("unvisited", 1_200)],
  );

  assert.equal(summary.registeredTotal, 2_800);
  assert.equal(summary.purchasedTotal, 1_600);
  assert.equal(summary.remainingBudget, 3_400);
});

test("予定予算が未設定なら残予算も未設定にする", () => {
  const summary = calculateBudgetSummary(
    null,
    [circle("purchased", "purchased")],
    [item("purchased", 1_000)],
  );

  assert.equal(summary.plannedBudget, null);
  assert.equal(summary.remainingBudget, null);
});

test("購入済み総額が予定予算を超えた場合は負の残予算を返す", () => {
  const summary = calculateBudgetSummary(
    1_000,
    [circle("purchased", "purchased")],
    [item("purchased", 750, 2)],
  );

  assert.equal(summary.purchasedTotal, 1_500);
  assert.equal(summary.remainingBudget, -500);
});
