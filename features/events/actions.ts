"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createEventForCurrentUser,
  deleteEventForCurrentUser,
  updateEventForCurrentUser,
} from "@/features/events/data";
import type {
  DeleteEventState,
  EventFormState,
} from "@/features/events/types";
import { isEventId, validateEventForm } from "@/features/events/validation";

export async function createEvent(
  _previousState: EventFormState,
  formData: FormData,
): Promise<EventFormState> {
  const validation = validateEventForm(formData);

  if (!validation.ok) {
    return {
      status: "error",
      message: "入力内容を確認してください。",
      fieldErrors: validation.fieldErrors,
      values: validation.values,
    };
  }

  const result = await createEventForCurrentUser(validation.input);

  if (result.status === "unauthenticated") {
    redirect("/login");
  }

  if (result.status === "error") {
    return {
      status: "error",
      message: "イベントを保存できませんでした。時間をおいて再度お試しください。",
      fieldErrors: {},
      values: validation.values,
    };
  }

  revalidatePath("/");
  revalidatePath("/events");
  redirect("/events?notice=created");
}

export async function updateEvent(
  eventId: string,
  _previousState: EventFormState,
  formData: FormData,
): Promise<EventFormState> {
  const validation = validateEventForm(formData);

  if (!validation.ok) {
    return {
      status: "error",
      message: "入力内容を確認してください。",
      fieldErrors: validation.fieldErrors,
      values: validation.values,
    };
  }

  if (!isEventId(eventId)) {
    return {
      status: "error",
      message: "イベントが見つからないか、編集権限がありません。",
      fieldErrors: {},
      values: validation.values,
    };
  }

  const result = await updateEventForCurrentUser(eventId, validation.input);

  if (result.status === "unauthenticated") {
    redirect("/login");
  }

  if (result.status === "not_found") {
    return {
      status: "error",
      message: "イベントが見つからないか、編集権限がありません。",
      fieldErrors: {},
      values: validation.values,
    };
  }

  if (result.status === "error") {
    return {
      status: "error",
      message: "イベントを更新できませんでした。時間をおいて再度お試しください。",
      fieldErrors: {},
      values: validation.values,
    };
  }

  revalidatePath("/");
  revalidatePath("/events");
  revalidatePath(`/events/${eventId}`);
  redirect("/events?notice=updated");
}

export async function deleteEvent(
  eventId: string,
  previousState: DeleteEventState,
): Promise<DeleteEventState> {
  void previousState;

  if (!isEventId(eventId)) {
    return {
      status: "error",
      message: "イベントが見つからないか、削除権限がありません。",
    };
  }

  const result = await deleteEventForCurrentUser(eventId);

  if (result.status === "unauthenticated") {
    redirect("/login");
  }

  if (result.status === "not_found") {
    return {
      status: "error",
      message: "イベントが見つからないか、削除権限がありません。",
    };
  }

  if (result.status === "error") {
    return {
      status: "error",
      message: "イベントを削除できませんでした。時間をおいて再度お試しください。",
    };
  }

  revalidatePath("/");
  revalidatePath("/events");
  redirect("/events?notice=deleted");
}
