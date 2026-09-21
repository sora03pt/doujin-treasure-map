import "server-only";

import { createClient } from "@/lib/supabase/server";
import type {
  Event,
  EventSummary,
  ValidatedEventInput,
} from "@/features/events/types";
import { normalizeEventHalls } from "@/features/events/halls";
import { removeReferenceImages } from "@/features/images/storage";

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

function toEventSummary(row: {
  id: string;
  name: string;
  event_date: string;
  venue: string | null;
}): EventSummary {
  return {
    id: row.id,
    name: row.name,
    eventDate: row.event_date,
    venue: row.venue,
  };
}

function toEvent(row: {
  id: string;
  user_id: string;
  name: string;
  event_date: string;
  planned_budget: number | null;
  venue: string | null;
  halls: string[];
  memo: string | null;
  created_at: string;
  updated_at: string;
}): Event {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    eventDate: row.event_date,
    plannedBudget: row.planned_budget,
    venue: row.venue,
    halls: normalizeEventHalls(row.venue, row.halls),
    memo: row.memo,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toDatabaseInput(input: ValidatedEventInput) {
  return {
    name: input.name,
    event_date: input.eventDate,
    planned_budget: input.plannedBudget,
    venue: input.venue,
    halls: input.halls,
    memo: input.memo,
  };
}

export async function listEventsForCurrentUser() {
  const context = await getAuthenticatedContext();

  if (!context) {
    return { status: "unauthenticated" as const, events: [] };
  }

  const { data, error } = await context.supabase
    .from("events")
    .select("id,name,event_date,venue")
    .eq("user_id", context.userId)
    .order("event_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load events", { code: error.code });
    return { status: "error" as const, events: [] };
  }

  return {
    status: "success" as const,
    events: (data ?? []).map(toEventSummary),
  };
}

export async function getEventForCurrentUser(eventId: string) {
  const context = await getAuthenticatedContext();

  if (!context) {
    return { status: "unauthenticated" as const, event: null };
  }

  const { data, error } = await context.supabase
    .from("events")
    .select(
      "id,user_id,name,event_date,planned_budget,venue,halls,memo,created_at,updated_at",
    )
    .eq("id", eventId)
    .eq("user_id", context.userId)
    .maybeSingle();

  if (error) {
    console.error("Failed to load event", { code: error.code });
    return { status: "error" as const, event: null };
  }

  if (!data) {
    return { status: "not_found" as const, event: null };
  }

  return { status: "success" as const, event: toEvent(data) };
}

export async function createEventForCurrentUser(input: ValidatedEventInput) {
  const context = await getAuthenticatedContext();

  if (!context) {
    return { status: "unauthenticated" as const };
  }

  const { data, error } = await context.supabase
    .from("events")
    .insert({
      ...toDatabaseInput(input),
      user_id: context.userId,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("Failed to create event", { code: error?.code ?? null });
    return { status: "error" as const };
  }

  return { status: "success" as const, eventId: data.id };
}

export async function updateEventForCurrentUser(
  eventId: string,
  input: ValidatedEventInput,
) {
  const context = await getAuthenticatedContext();

  if (!context) {
    return { status: "unauthenticated" as const };
  }

  const { data, error } = await context.supabase
    .from("events")
    .update(toDatabaseInput(input))
    .eq("id", eventId)
    .eq("user_id", context.userId)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Failed to update event", { code: error.code });
    return { status: "error" as const };
  }

  if (!data) {
    return { status: "not_found" as const };
  }

  return { status: "success" as const };
}

export async function deleteEventForCurrentUser(eventId: string) {
  const context = await getAuthenticatedContext();

  if (!context) {
    return { status: "unauthenticated" as const };
  }

  const { data: event, error: loadError } = await context.supabase
    .from("events")
    .select("id,circles(image_path,items(image_path))")
    .eq("id", eventId)
    .eq("user_id", context.userId)
    .maybeSingle();

  if (loadError) {
    console.error("Failed to load event images before deletion", {
      code: loadError.code,
    });
    return { status: "error" as const };
  }

  if (!event) {
    return { status: "not_found" as const };
  }

  const imagePaths = event.circles.flatMap((circle) => [
    circle.image_path,
    ...circle.items.map((item) => item.image_path),
  ]);
  const imageRemoval = await removeReferenceImages(
    context.supabase,
    imagePaths,
  );

  if (imageRemoval.status === "error") {
    console.error("Failed to remove event reference images", {
      code: imageRemoval.code,
    });
    return { status: "error" as const };
  }

  const { data, error } = await context.supabase
    .from("events")
    .delete()
    .eq("id", eventId)
    .eq("user_id", context.userId)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Failed to delete event", { code: error.code });
    return { status: "error" as const };
  }

  if (!data) {
    return { status: "not_found" as const };
  }

  return { status: "success" as const };
}
