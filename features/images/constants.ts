export const REFERENCE_IMAGE_BUCKET = "reference-images";
export const REFERENCE_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const REFERENCE_IMAGE_MAX_SOURCE_BYTES = 20 * 1024 * 1024;
export const REFERENCE_IMAGE_MAX_DIMENSION = 1600;
export const REFERENCE_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type ReferenceImageMimeType =
  (typeof REFERENCE_IMAGE_MIME_TYPES)[number];
