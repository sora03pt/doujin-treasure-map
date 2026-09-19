import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { REFERENCE_IMAGE_BUCKET } from "@/features/images/constants";
import type { Database } from "@/lib/supabase/database.types";

type AppSupabaseClient = SupabaseClient<Database>;

export function circleImagePath(userId: string, circleId: string) {
  return `${userId}/circles/${circleId}/reference`;
}

export function itemImagePath(userId: string, itemId: string) {
  return `${userId}/items/${itemId}/reference`;
}

export async function uploadReferenceImage(
  supabase: AppSupabaseClient,
  path: string,
  file: File,
) {
  const { error } = await supabase.storage
    .from(REFERENCE_IMAGE_BUCKET)
    .upload(path, await file.arrayBuffer(), {
      cacheControl: "0",
      contentType: file.type,
      upsert: true,
    });

  return error ? { status: "error" as const, code: error.name } : { status: "success" as const };
}

export async function removeReferenceImages(
  supabase: AppSupabaseClient,
  paths: Array<string | null>,
) {
  const uniquePaths = [...new Set(paths.filter((path): path is string => Boolean(path)))];

  if (uniquePaths.length === 0) {
    return { status: "success" as const };
  }

  const { error } = await supabase.storage
    .from(REFERENCE_IMAGE_BUCKET)
    .remove(uniquePaths);

  return error ? { status: "error" as const, code: error.name } : { status: "success" as const };
}

export async function createSignedImageUrlMap(
  supabase: AppSupabaseClient,
  paths: Array<string | null>,
) {
  const uniquePaths = [...new Set(paths.filter((path): path is string => Boolean(path)))];
  const result = new Map<string, string>();

  if (uniquePaths.length === 0) {
    return result;
  }

  const { data, error } = await supabase.storage
    .from(REFERENCE_IMAGE_BUCKET)
    .createSignedUrls(uniquePaths, 60 * 60);

  if (error) {
    console.error("Failed to sign reference images", { code: error.name });
    return result;
  }

  data.forEach((entry, index) => {
    if (entry.signedUrl) {
      result.set(uniquePaths[index], entry.signedUrl);
    }
  });

  return result;
}
