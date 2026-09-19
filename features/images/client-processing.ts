import {
  REFERENCE_IMAGE_MAX_DIMENSION,
  REFERENCE_IMAGE_MAX_SOURCE_BYTES,
  REFERENCE_IMAGE_MIME_TYPES,
} from "@/features/images/constants";

export async function processReferenceImage(file: File) {
  if (!REFERENCE_IMAGE_MIME_TYPES.includes(file.type as never)) {
    throw new Error("JPEG、PNG、WebP形式の画像を選択してください。");
  }

  if (file.size <= 0 || file.size > REFERENCE_IMAGE_MAX_SOURCE_BYTES) {
    throw new Error("元画像は20MB以下にしてください。");
  }

  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(
    1,
    REFERENCE_IMAGE_MAX_DIMENSION / Math.max(bitmap.width, bitmap.height),
  );
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");

  if (!context) {
    bitmap.close();
    throw new Error("画像を処理できませんでした。");
  }

  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/webp", 0.86);
  });

  if (!blob) {
    throw new Error("画像を処理できませんでした。");
  }

  return new File([blob], "reference.webp", { type: "image/webp" });
}
