import "server-only";

import type {
  Circle,
  ValidatedCircleInput,
} from "@/features/circles/types";
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

async function hasOwnedEvent(
  context: NonNullable<Awaited<ReturnType<typeof getAuthenticatedContext>>>,
  eventId: string,
) {
  const { data, error } = await context.supabase
    .from("events")
    .select("id")
    .eq("id", eventId)
    .eq("user_id", context.userId)
    .maybeSingle();

  if (error) {
    console.error("Failed to verify event ownership", { code: error.code });
    return "error" as const;
  }

  return data ? ("owned" as const) : ("not_found" as const);
}

function toCircle(row: {
  id: string;
  event_id: string;
  user_id: string;
  name: string;
  space_number: string | null;
  x_url: string | null;
  web_url: string | null;
  memo: string | null;
  priority: "must" | "want" | "if_time";
  assignee: string | null;
  visit_status: "unvisited" | "purchased" | "sold_out" | "skipped";
  created_at: string;
  updated_at: string;
}): Circle {
  return {
    id: row.id,
    eventId: row.event_id,
    userId: row.user_id,
    name: row.name,
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
    space_number: input.spaceNumber,
    priority: input.priority,
    visit_status: input.visitStatus,
    memo: input.memo,
    assignee: input.assignee,
  };
}

async function findOwnedCircle(
  context: NonNullable<Awaited<ReturnType<typeof getAuthenticatedContext>>>,
  eventId: string,
  circleId: string,
) {
  const ownership = await hasOwnedEvent(context, eventId);

  if (ownership !== "owned") {
    return { status: ownership } as const;
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
    ? { status: "owned" as const }
    : { status: "not_found" as const };
}

export async function listCirclesForCurrentUser(eventId: string) {
  const context = await getAuthenticatedContext();

  if (!context) {
    return { status: "unauthenticated" as const, circles: [] };
  }

  const ownership = await hasOwnedEvent(context, eventId);

  if (ownership !== "owned") {
    return { status: ownership, circles: [] };
  }

  const { data, error } = await context.supabase
    .from("circles")
    .select(
      "id,event_id,user_id,name,space_number,x_url,web_url,memo,priority,assignee,visit_status,created_at,updated_at",
    )
    .eq("event_id", eventId)
    .eq("user_id", context.userId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to load circles", { code: error.code });
    return { status: "error" as const, circles: [] };
  }

  return {
    status: "success" as const,
    circles: (data ?? []).map(toCircle),
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

  const ownership = await hasOwnedEvent(context, eventId);

  if (ownership !== "owned") {
    return { status: ownership };
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
