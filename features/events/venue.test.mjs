import assert from "node:assert/strict";
import test from "node:test";

import { getVenueFormSelection, resolveVenue } from "./venue.ts";

test("preset会場を選択値として判定する", () => {
  assert.deepEqual(getVenueFormSelection("インテックス大阪"), {
    preset: "インテックス大阪",
    custom: "",
  });
  assert.equal(resolveVenue("マリンメッセ福岡", "無視される値"), "マリンメッセ福岡");
});

test("既存の自由入力会場をその他として復元する", () => {
  assert.deepEqual(getVenueFormSelection("地域交流ホール"), {
    preset: "other",
    custom: "地域交流ホール",
  });
  assert.equal(resolveVenue("other", " 地域交流ホール "), "地域交流ホール");
});

test("未設定の既存会場もその他の空欄として扱う", () => {
  assert.deepEqual(getVenueFormSelection(null), {
    preset: "other",
    custom: "",
  });
});
