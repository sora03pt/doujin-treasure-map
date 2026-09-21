import "server-only";

import type {
  Circle,
  ValidatedCircleInput,
} from "@/features/circles/types";
import {
  circleImagePath,
  createSignedImageUrlMap,
  removeReferenceImages,
  uploadReferenceImage,
} from "@/features/images/storage";
import { normalizeEventHalls } from "@/features/events/halls";
import { createClient } from "@/lib/supabase/server";

async function getAuthenticatedContext() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return { supabase, userId: user.id };
}

async function getOwnedEvent(
  context: NonNullable<Awaited<ReturnType<typeof getAuthenticatedContext>>>,
  eventId: string,
) {
  const { data, error } = await context.supabase
    .from("events")
    .select("id,venue,halls")
    .eq("id", eventId)
    .eq("user_id", context.userId)
    .maybeSingle();

  if (error) {
    console.error("Failed to verify event ownership", { code: error.code });
    return { status: "error" as const, halls: [] };
  }

  return data
    ? {
        status: "owned" as const,
        halls: normalizeEventHalls(data.venue, data.halls),
      }
    : { status: "not_found" as const, halls: [] };
}

function toCircle(row: {
  id: string;
  event_id: string;
  user_id: string;
  name: string;
  image_path: string | null;
  distribution_post_url: string | null;
  hall: string | null;
  space_number: string | null;
  x_url: string | null;
  web_url: string | null;
  memo: string | null;
  priority: "must" | "want" | "if_time";
  assignee: string | null;
  visit_status: "unvisited" | "purchased" | "sold_out" | "skipped";
  created_at: string;
  updated_at: string;
}, imageUrl: string | null = null): Circle {
  return {
    id: row.id,
    eventId: row.event_id,
    userId: row.user_id,
    name: row.name,
    imagePath: row.image_path,
    imageUrl,
    distributionPostUrl: row.distribution_post_url,
    hall: row.hall,
    spaceNumber: row.space_number,
    xUrl: row.x_url,
    webUrl: row.web_url,
    memo: row.memo,
    priority: row.priority,
    assignee: row.assignee,
    visitStatus: row.visit_status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toDatabaseInput(input: ValidatedCircleInput) {
  return {
    name: input.name,
    hall: input.hall,
    space_number: input.spaceNumber,
    priority: input.priority,
    visit_status: input.visitStatus,
    memo: input.memo,
    assignee: input.assignee,
    distribution_post_url: input.distributionPostUrl,
  };
}

async function findOwnedCircle(
  context: NonNullable<Awaited<ReturnType<typeof getAuthenticatedContext>>>,
  eventId: string,
  circleId: string,
) {
  const ownership = await getOwnedEvent(context, eventId);

  if (ownership.status !== "owned") {
    return ownership;
  }

  const { data, error } = await context.supabase
    .from("circles")
    .select("id")
    .eq("id", circleId)
    .eq("event_id", eventId)
    .eq("user_id", context.userId)
    .maybeSingle();

  if (error) {
    console.error("Failed to verify circle ownership", { code: error.code });
    return { status: "error" as const };
  }

  return data
    ? { status: "owned" as const, eventHalls: ownership.halls }
    : { status: "not_found" as const };
}

export async function listCirclesForCurrentUser(eventId: string) {
  const context = await getAuthenticatedContext();

  if (!context) {
    return { status: "unauthenticated" as const, circles: [] };
  }

  const ownership = await getOwnedEvent(context, eventId);

  if (ownership.status !== "owned") {
    return { status: ownership.status, circles: [] };
  }

  const { data, error } = await context.supabase
    .from("circles")
    .select(
      "id,event_id,user_id,name,image_path,distribution_post_url,hall,space_number,x_url,web_url,memo,priority,assignee,visit_status,created_at,updated_at",
    )
    .eq("event_id", eventId)
    .eq("user_id", context.userId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to load circles", { code: error.code });
    return { status: "error" as const, circles: [] };
  }

  const imageUrls = await createSignedImageUrlMap(
    context.supabase,
    (data ?? []).map((row) => row.image_path),
  );

  return {
    status: "success" as const,
    circles: (data ?? []).map((row) =>
      toCircle(row, row.image_path ? imageUrls.get(row.image_path) ?? null : null),
    ),
  };
}

export async function createCircleForCurrentUser(
  eventId: string,
  input: ValidatedCircleInput,
) {
  const context = await getAuthenticatedContext();

  if (!context) {
    return { status: "unauthenticated" as const };
  }

  const ownership = await getOwnedEvent(context, eventId);

  if (ownership.status !== "owned") {
    return { status: ownership.status };
  }

  if (input.hall && !ownership.halls.includes(input.hall)) {
    return { status: "invalid_hall" as const };
  }

  const { data, error } = await context.supabase
    .from("circles")
    .insert({
      ...toDatabaseInput(input),
      event_id: eventId,
      user_id: context.userId,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("Failed to create circle", { code: error?.code ?? null });
    return { status: "error" as const };
  }

  return { status: "success" as const, circleId: data.id };
}

export async function updateCircleForCurrentUser(
  eventId: string,
  circleId: string,
  input: ValidatedCircleInput,
) {
  const context = await getAuthenticatedContext();

  if (!context) {
    return { status: "unauthenticated" as const };
  }

  const ownership = await findOwnedCircle(context, eventId, circleId);

  if (ownership.status !== "owned") {
    return ownership;
  }

  if (input.hall && !ownership.eventHalls.includes(input.hall)) {
    return { status: "invalid_hall" as const };
  }

  const { data, error } = await context.supabase
    .from("circles")
    .update(toDatabaseInput(input))
    .eq("id", circleId)
    .eq("event_id", eventId)
    .eq("user_id", context.userId)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Failed to update circle", { code: error.code });
    return { status: "error" as const };
  }

  return data
    ? { status: "success" as const }
    : { status: "not_found" as const };
}

export async function updateCircleVisitStatusForCurrentUser(
  eventId: string,
  circleId: string,
  visitStatus: Circle["visitStatus"],
) {
  const context = await getAuthenticatedContext();

  if (!context) {
    return { status: "unauthenticated" as const };
  }

  const ownership = await findOwnedCircle(context, eventId, circleId);

  if (ownership.status !== "owned") {
    return ownership;
  }

  const { data, error } = await context.supabase
    .from("circles")
    .update({ visit_status: visitStatus })
    .eq("id", circleId)
    .eq("event_id", eventId)
    .eq("user_id", context.userId)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Failed to update circle visit status", {
      code: error.code,
    });
    return { status: "error" as const };
  }

  return data
    ? { status: "success" as const }
    : { status: "not_found" as const };
}

export async function deleteCircleForCurrentUser(
  eventId: string,
  circleId: string,
) {
  const context = await getAuthenticatedContext();

  if (!context) {
    return { status: "unauthenticated" as const };
  }

  const ownership = await findOwnedCircle(context, eventId, circleId);

  if (ownership.status !== "owned") {
    return ownership;
  }

  const { data: circle, error: circleError } = await context.supabase
    .from("circles")
    .select("id,image_path,items(image_path)")
    .eq("id", circleId)
    .eq("event_id", eventId)
    .eq("user_id", context.userId)
    .maybeSingle();

  if (circleError) {
    console.error("Failed to load circle images before deletion", {
      code: circleError.code,
    });
    return { status: "error" as const };
  }

  if (!circle) {
    return { status: "not_found" as const };
  }

  const imageRemoval = await removeReferenceImages(context.supabase, [
    circle.image_path,
    ...(circle.items ?? []).map((item) => item.image_path),
  ]);

  if (imageRemoval.status === "error") {
    console.error("Failed to remove circle reference images", {
      code: imageRemoval.code,
    });
    return { status: "error" as const };
  }

  const { data, error } = await context.supabase
    .from("circles")
    .delete()
    .eq("id", circleId)
    .eq("event_id", eventId)
    .eq("user_id", context.userId)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Failed to delete circle", { code: error.code });
    return { status: "error" as const };
  }

  return data
    ? { status: "success" as const }
    : { status: "not_found" as const };
}

export async function uploadCircleImageForCurrentUser(
  eventId: string,
  circleId: string,
  file: File,
) {
  const context = await getAuthenticatedContext();

  if (!context) {
    return { status: "unauthenticated" as const };
  }

  const ownership = await findOwnedCircle(context, eventId, circleId);

  if (ownership.status !== "owned") {
    return ownership;
  }

  const { data: circle, error: loadError } = await context.supabase
    .from("circles")
    .select("image_path")
    .eq("id", circleId)
    .eq("event_id", eventId)
    .eq("user_id", context.userId)
    .maybeSingle();

  if (loadError || !circle) {
    return { status: loadError ? "error" as const : "not_found" as const };
  }

  const path = circleImagePath(context.userId, circleId);
  const upload = await uploadReferenceImage(context.supabase, path, file);

  if (upload.status === "error") {
    console.error("Failed to upload circle reference image", {
      code: upload.code,
    });
    return { status: "error" as const };
  }

  if (circle.image_path === path) {
    return { status: "success" as const };
  }

  const { data, error } = await context.supabase
    .from("circles")
    .update({ image_path: path })
    .eq("id", circleId)
    .eq("event_id", eventId)
    .eq("user_id", context.userId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    await removeReferenceImages(context.supabase, [path]);
    console.error("Failed to save circle reference image path", {
      code: error?.code ?? null,
    });
    return { status: error ? "error" as const : "not_found" as const };
  }

  return { status: "success" as const };
}

export async function deleteCircleImageForCurrentUser(
  eventId: string,
  circleId: string,
) {
  const context = await getAuthenticatedContext();

  if (!context) {
    return { status: "unauthenticated" as const };
  }

  const ownership = await findOwnedCircle(context, eventId, circleId);

  if (ownership.status !== "owned") {
    return ownership;
  }

  const { data: circle, error: loadError } = await context.supabase
    .from("circles")
    .select("image_path")
    .eq("id", circleId)
    .eq("event_id", eventId)
    .eq("user_id", context.userId)
    .maybeSingle();

  if (loadError || !circle) {
    return { status: loadError ? "error" as const : "not_found" as const };
  }

  const removal = await removeReferenceImages(context.supabase, [circle.image_path]);

  if (removal.status === "error") {
    console.error("Failed to delete circle reference image", {
      code: removal.code,
    });
    return { status: "error" as const };
  }

  const { data, error } = await context.supabase
    .from("circles")
    .update({ image_path: null })
    .eq("id", circleId)
    .eq("event_id", eventId)
    .eq("user_id", context.userId)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Failed to clear circle reference image path", {
      code: error.code,
    });
    return { status: "error" as const };
  }

  return data ? { status: "success" as const } : { status: "not_found" as const };
}
