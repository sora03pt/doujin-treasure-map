"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isCircleId } from "@/features/circles/validation";
import { isEventId } from "@/features/events/validation";
import {
  createItemForCurrentUser,
  deleteItemForCurrentUser,
  updateItemForCurrentUser,
} from "@/features/items/data";
import type { DeleteItemState, ItemFormState } from "@/features/items/types";
import { isItemId, validateItemForm } from "@/features/items/validation";

function invalidOwnershipState(values: ItemFormState["values"]): ItemFormState {
  return {
    status: "error",
    message: "サークルまたは頒布物が見つからないか、操作権限がありません。",
    fieldErrors: {},
    values,
  };
}

export async function createItem(
  eventId: string,
  circleId: string,
  _previousState: ItemFormState,
  formData: FormData,
): Promise<ItemFormState> {
  const validation = validateItemForm(formData);

  if (!validation.ok) {
    return {
      status: "error",
      message: "入力内容を確認してください。",
      fieldErrors: validation.fieldErrors,
      values: validation.values,
    };
  }

  if (!isEventId(eventId) || !isCircleId(circleId)) {
    return invalidOwnershipState(validation.values);
  }

  const result = await createItemForCurrentUser(
    eventId,
    circleId,
    validation.input,
  );

  if (result.status === "unauthenticated") {
    redirect("/login");
  }

  if (result.status === "not_found") {
    return invalidOwnershipState(validation.values);
  }

  if (result.status === "error") {
    return {
      status: "error",
      message: "頒布物を保存できませんでした。時間をおいて再度お試しください。",
      fieldErrors: {},
      values: validation.values,
    };
  }

  revalidatePath(`/events/${eventId}`);
  redirect(`/events/${eventId}?notice=item-created#circle-${circleId}`);
}

export async function updateItem(
  eventId: string,
  circleId: string,
  itemId: string,
  _previousState: ItemFormState,
  formData: FormData,
): Promise<ItemFormState> {
  const validation = validateItemForm(formData);

  if (!validation.ok) {
    return {
      status: "error",
      message: "入力内容を確認してください。",
      fieldErrors: validation.fieldErrors,
      values: validation.values,
    };
  }

  if (
    !isEventId(eventId) ||
    !isCircleId(circleId) ||
    !isItemId(itemId)
  ) {
    return invalidOwnershipState(validation.values);
  }

  const result = await updateItemForCurrentUser(
    eventId,
    circleId,
    itemId,
    validation.input,
  );

  if (result.status === "unauthenticated") {
    redirect("/login");
  }

  if (result.status === "not_found") {
    return invalidOwnershipState(validation.values);
  }

  if (result.status === "error") {
    return {
      status: "error",
      message: "頒布物を更新できませんでした。時間をおいて再度お試しください。",
      fieldErrors: {},
      values: validation.values,
    };
  }

  revalidatePath(`/events/${eventId}`);
  redirect(`/events/${eventId}?notice=item-updated#item-${itemId}`);
}

export async function deleteItem(
  eventId: string,
  circleId: string,
  itemId: string,
  previousState: DeleteItemState,
): Promise<DeleteItemState> {
  void previousState;

  if (
    !isEventId(eventId) ||
    !isCircleId(circleId) ||
    !isItemId(itemId)
  ) {
    return {
      status: "error",
      message: "頒布物が見つからないか、削除権限がありません。",
    };
  }

  const result = await deleteItemForCurrentUser(eventId, circleId, itemId);

  if (result.status === "unauthenticated") {
    redirect("/login");
  }

  if (result.status === "not_found") {
    return {
      status: "error",
      message: "頒布物が見つからないか、削除権限がありません。",
    };
  }

  if (result.status === "error") {
    return {
      status: "error",
      message: "頒布物を削除できませんでした。時間をおいて再度お試しください。",
    };
  }

  revalidatePath(`/events/${eventId}`);
  redirect(`/events/${eventId}?notice=item-deleted#circle-${circleId}`);
}
