import {
  REFERENCE_IMAGE_MAX_BYTES,
  REFERENCE_IMAGE_MIME_TYPES,
  type ReferenceImageMimeType,
} from "./constants.ts";

type ImageFileMetadata = {
  size: number;
  type: string;
};

export type ImageValidationResult =
  | { ok: true; mimeType: ReferenceImageMimeType }
  | { ok: false; message: string };

export function validateReferenceImageMetadata(
  file: ImageFileMetadata,
): ImageValidationResult {
  if (!Number.isInteger(file.size) || file.size <= 0) {
    return { ok: false, message: "画像ファイルを選択してください。" };
  }

  if (file.size > REFERENCE_IMAGE_MAX_BYTES) {
    return { ok: false, message: "画像は5MB以下にしてください。" };
  }

  if (
    !REFERENCE_IMAGE_MIME_TYPES.includes(
      file.type as ReferenceImageMimeType,
    )
  ) {
    return {
      ok: false,
      message: "JPEG、PNG、WebP形式の画像を選択してください。",
    };
  }

  return { ok: true, mimeType: file.type as ReferenceImageMimeType };
}

export function hasExpectedImageSignature(
  bytes: Uint8Array,
  mimeType: ReferenceImageMimeType,
) {
  if (mimeType === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  if (mimeType === "image/png") {
    return [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every(
      (value, index) => bytes[index] === value,
    );
  }

  return (
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  );
}

export async function readReferenceImage(formData: FormData) {
  const value = formData.get("image");

  if (!(value instanceof File)) {
    return { ok: false as const, message: "画像ファイルを選択してください。" };
  }

  const validation = validateReferenceImageMetadata(value);

  if (!validation.ok) {
    return validation;
  }

  const header = new Uint8Array(await value.slice(0, 12).arrayBuffer());

  if (!hasExpectedImageSignature(header, validation.mimeType)) {
    return {
      ok: false as const,
      message: "画像の内容とファイル形式が一致しません。",
    };
  }

  return { ok: true as const, file: value, mimeType: validation.mimeType };
}
