import "server-only";

import type { Item, ValidatedItemInput } from "@/features/items/types";
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

async function findOwnedCircle(
  context: NonNullable<Awaited<ReturnType<typeof getAuthenticatedContext>>>,
  eventId: string,
  circleId: string,
) {
  const { data: event, error: eventError } = await context.supabase
    .from("events")
    .select("id")
    .eq("id", eventId)
    .eq("user_id", context.userId)
    .maybeSingle();

  if (eventError) {
    console.error("Failed to verify event ownership for item", {
      code: eventError.code,
    });
    return { status: "error" as const };
  }

  if (!event) {
    return { status: "not_found" as const };
  }

  const { data: circle, error: circleError } = await context.supabase
    .from("circles")
    .select("id")
    .eq("id", circleId)
    .eq("event_id", eventId)
    .eq("user_id", context.userId)
    .maybeSingle();

  if (circleError) {
    console.error("Failed to verify circle ownership for item", {
      code: circleError.code,
    });
    return { status: "error" as const };
  }

  return circle
    ? { status: "owned" as const }
    : { status: "not_found" as const };
}

async function findOwnedItem(
  context: NonNullable<Awaited<ReturnType<typeof getAuthenticatedContext>>>,
  eventId: string,
  circleId: string,
  itemId: string,
) {
  const circleOwnership = await findOwnedCircle(context, eventId, circleId);

  if (circleOwnership.status !== "owned") {
    return circleOwnership;
  }

  const { data, error } = await context.supabase
    .from("items")
    .select("id")
    .eq("id", itemId)
    .eq("circle_id", circleId)
    .eq("user_id", context.userId)
    .maybeSingle();

  if (error) {
    console.error("Failed to verify item ownership", { code: error.code });
    return { status: "error" as const };
  }

  return data
    ? { status: "owned" as const }
    : { status: "not_found" as const };
}

function toItem(row: {
  id: string;
  circle_id: string;
  user_id: string;
  name: string;
  price: number | null;
  quantity: number;
  memo: string | null;
  purchased: boolean;
  created_at: string;
  updated_at: string;
}): Item {
  return {
    id: row.id,
    circleId: row.circle_id,
    userId: row.user_id,
    name: row.name,
    price: row.price,
    quantity: row.quantity,
    memo: row.memo,
    purchased: row.purchased,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toDatabaseInput(input: ValidatedItemInput) {
  return {
    name: input.name,
    price: input.price,
    quantity: input.quantity,
    memo: input.memo,
  };
}

export async function listItemsForCurrentUser(circleIds: string[]) {
  const context = await getAuthenticatedContext();

  if (!context) {
    return { status: "unauthenticated" as const, items: [] };
  }

  if (circleIds.length === 0) {
    return { status: "success" as const, items: [] };
  }

  const { data, error } = await context.supabase
    .from("items")
    .select(
      "id,circle_id,user_id,name,price,quantity,memo,purchased,created_at,updated_at",
    )
    .in("circle_id", circleIds)
    .eq("user_id", context.userId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to load items", { code: error.code });
    return { status: "error" as const, items: [] };
  }

  return {
    status: "success" as const,
    items: (data ?? []).map(toItem),
  };
}

export async function createItemForCurrentUser(
  eventId: string,
  circleId: string,
  input: ValidatedItemInput,
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
    .from("items")
    .insert({
      ...toDatabaseInput(input),
      circle_id: circleId,
      user_id: context.userId,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("Failed to create item", { code: error?.code ?? null });
    return { status: "error" as const };
  }

  return { status: "success" as const, itemId: data.id };
}

export async function updateItemForCurrentUser(
  eventId: string,
  circleId: string,
  itemId: string,
  input: ValidatedItemInput,
) {
  const context = await getAuthenticatedContext();

  if (!context) {
    return { status: "unauthenticated" as const };
  }

  const ownership = await findOwnedItem(context, eventId, circleId, itemId);

  if (ownership.status !== "owned") {
    return ownership;
  }

  const { data, error } = await context.supabase
    .from("items")
    .update(toDatabaseInput(input))
    .eq("id", itemId)
    .eq("circle_id", circleId)
    .eq("user_id", context.userId)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Failed to update item", { code: error.code });
    return { status: "error" as const };
  }

  return data
    ? { status: "success" as const }
    : { status: "not_found" as const };
}

export async function deleteItemForCurrentUser(
  eventId: string,
  circleId: string,
  itemId: string,
) {
  const context = await getAuthenticatedContext();

  if (!context) {
    return { status: "unauthenticated" as const };
  }

  const ownership = await findOwnedItem(context, eventId, circleId, itemId);

  if (ownership.status !== "owned") {
    return ownership;
  }

  const { data, error } = await context.supabase
    .from("items")
    .delete()
    .eq("id", itemId)
    .eq("circle_id", circleId)
    .eq("user_id", context.userId)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Failed to delete item", { code: error.code });
    return { status: "error" as const };
  }

  return data
    ? { status: "success" as const }
    : { status: "not_found" as const };
}
