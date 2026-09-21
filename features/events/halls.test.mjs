import assert from "node:assert/strict";
import test from "node:test";

import {
  getHallOptionsForVenue,
  hasOnlyAllowedEventHalls,
  normalizeEventHalls,
  TOKYO_BIG_SIGHT_HALLS,
} from "./halls.ts";

test("東京ビッグサイトのホールを定義済み会場順で返す", () => {
  assert.deepEqual(getHallOptionsForVenue("東京ビッグサイト"), [
    "東1", "東2", "東3", "東4", "東5", "東6", "東7", "東8",
    "西1", "西2", "西3", "西4", "南1", "南2", "南3", "南4",
  ]);
  assert.equal(TOKYO_BIG_SIGHT_HALLS.length, 16);
});

test("保存順に関係なく定義済み会場順へ正規化する", () => {
  assert.deepEqual(
    normalizeEventHalls("東京ビッグサイト", ["南4", "東2", "東1", "東2"]),
    ["東1", "東2", "南4"],
  );
});

test("会場にないホールは許可せず、未定義会場は空配列にする", () => {
  assert.equal(
    hasOnlyAllowedEventHalls("東京ビッグサイト", ["東1", "東9"]),
    false,
  );
  assert.deepEqual(normalizeEventHalls("インテックス大阪", ["東1"]), []);
});
