import assert from "node:assert/strict";
import test from "node:test";

import { normalizeDistributionPostUrl } from "./validation.ts";

test("x.comとtwitter.comのstatus URLを受け付けて追跡queryを除く", () => {
  assert.deepEqual(
    normalizeDistributionPostUrl("http://x.com/user_name/status/123?s=20#fragment"),
    { ok: true, value: "https://x.com/user_name/status/123" },
  );
  assert.deepEqual(
    normalizeDistributionPostUrl("https://www.twitter.com/user/status/456/"),
    { ok: true, value: "https://www.twitter.com/user/status/456" },
  );
});

test("空欄は未設定として扱う", () => {
  assert.deepEqual(normalizeDistributionPostUrl("  "), {
    ok: true,
    value: null,
  });
});

test("status以外、許可外host、http以外を拒否する", () => {
  for (const value of [
    "https://x.com/user",
    "https://example.com/user/status/123",
    "javascript:alert(1)",
    "https://notx.com/user/status/123",
    "https://name:password@x.com/user/status/123",
    "https://x.com:444/user/status/123",
  ]) {
    assert.deepEqual(normalizeDistributionPostUrl(value), { ok: false });
  }
});
