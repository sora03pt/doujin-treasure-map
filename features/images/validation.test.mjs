import assert from "node:assert/strict";
import test from "node:test";

import { REFERENCE_IMAGE_MAX_BYTES } from "./constants.ts";
import {
  hasExpectedImageSignature,
  validateReferenceImageMetadata,
} from "./validation.ts";

test("JPEG、PNG、WebPの5MB以下を受け付ける", () => {
  for (const type of ["image/jpeg", "image/png", "image/webp"]) {
    assert.equal(
      validateReferenceImageMetadata({ size: 1024, type }).ok,
      true,
    );
  }
});

test("許可外形式と空ファイルを拒否する", () => {
  assert.equal(
    validateReferenceImageMetadata({ size: 1024, type: "image/gif" }).ok,
    false,
  );
  assert.equal(
    validateReferenceImageMetadata({ size: 0, type: "image/png" }).ok,
    false,
  );
});

test("5MBを超える画像を拒否する", () => {
  assert.equal(
    validateReferenceImageMetadata({
      size: REFERENCE_IMAGE_MAX_BYTES + 1,
      type: "image/webp",
    }).ok,
    false,
  );
});

test("MIME typeと画像signatureの一致を確認する", () => {
  assert.equal(
    hasExpectedImageSignature(
      Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      "image/png",
    ),
    true,
  );
  assert.equal(
    hasExpectedImageSignature(Uint8Array.from([0xff, 0xd8, 0xff]), "image/png"),
    false,
  );
});
