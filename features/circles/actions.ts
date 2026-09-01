"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createCircleForCurrentUser,
  deleteCircleForCurrentUser,
  updateCircleForCurrentUser,
  updateCircleVisitStatusForCurrentUser,
} from "@/features/circles/data";
import type {
  CircleFormState,
  DeleteCircleState,
  QuickVisitStatusState,
} from "@/features/circles/types";
import {
  isCircleId,
  isVisitStatus,
  validateCircleForm,
} from "@/features/circles/validation";
import { isEventId } from "@/features/events/validation";

function invalidOwnershipState(values: CircleFormState["values"]): CircleFormState {
  return {
    status: "error",
    message: "イベントまたはサークルが見つからないか、操作権限がありません。",
    fieldErrors: {},
    values,
  };
}

export async function createCircle(
  eventId: string,
  _previousState: CircleFormState,
  formData: FormData,
): Promise<CircleFormState> {
  const validation = validateCircleForm(formData);

  if (!validation.ok) {
    return {
      status: "error",
      message: "入力内容を確認してください。",
      fieldErrors: validation.fieldErrors,
      values: validation.values,
    };
  }

  if (!isEventId(eventId)) {
    return invalidOwnershipState(validation.values);
  }

  const result = await createCircleForCurrentUser(eventId, validation.input);

  if (result.status === "unauthenticated") {
    redirect("/login");
  }

  if (result.status === "not_found") {
    return invalidOwnershipState(validation.values);
  }

  if (result.status === "error") {
    return {
      status: "error",
      message: "サークルを保存できませんでした。時間をおいて再度お試しください。",
      fieldErrors: {},
      values: validation.values,
    };
  }

  revalidatePath(`/events/${eventId}`);
  redirect(`/events/${eventId}?notice=circle-created#circles`);
}

export async function updateCircle(
  eventId: string,
  circleId: string,
  _previousState: CircleFormState,
  formData: FormData,
): Promise<CircleFormState> {
  const validation = validateCircleForm(formData);

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

  const result = await updateCircleForCurrentUser(
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
      message: "サークルを更新できませんでした。時間をおいて再度お試しください。",
      fieldErrors: {},
      values: validation.values,
    };
  }

  revalidatePath(`/events/${eventId}`);
  redirect(`/events/${eventId}?notice=circle-updated#circle-${circleId}`);
}

export async function deleteCircle(
  eventId: string,
  circleId: string,
  previousState: DeleteCircleState,
): Promise<DeleteCircleState> {
  void previousState;

  if (!isEventId(eventId) || !isCircleId(circleId)) {
    return {
      status: "error",
      message: "サークルが見つからないか、削除権限がありません。",
    };
  }

  const result = await deleteCircleForCurrentUser(eventId, circleId);

  if (result.status === "unauthenticated") {
    redirect("/login");
  }

  if (result.status === "not_found") {
    return {
      status: "error",
      message: "サークルが見つからないか、削除権限がありません。",
    };
  }

  if (result.status === "error") {
    return {
      status: "error",
      message: "サークルを削除できませんでした。時間をおいて再度お試しください。",
    };
  }

  revalidatePath(`/events/${eventId}`);
  redirect(`/events/${eventId}?notice=circle-deleted#circles`);
}

export async function quickUpdateCircleVisitStatus(
  eventId: string,
  circleId: string,
  previousState: QuickVisitStatusState,
  formData: FormData,
): Promise<QuickVisitStatusState> {
  const visitStatus = formData.get("visit_status");

  if (
    !isEventId(eventId) ||
    !isCircleId(circleId) ||
    typeof visitStatus !== "string" ||
    !isVisitStatus(visitStatus)
  ) {
    return {
      status: "error",
      message: "訪問状態を変更できませんでした。入力内容を確認してください。",
      visitStatus: previousState.visitStatus,
    };
  }

  const result = await updateCircleVisitStatusForCurrentUser(
    eventId,
    circleId,
    visitStatus,
  );

  if (result.status === "unauthenticated") {
    redirect("/login");
  }

  if (result.status === "not_found") {
    return {
      status: "error",
      message: "サークルが見つからないか、変更権限がありません。",
      visitStatus: previousState.visitStatus,
    };
  }

  if (result.status === "error") {
    return {
      status: "error",
      message: "訪問状態を変更できませんでした。時間をおいて再度お試しください。",
      visitStatus: previousState.visitStatus,
    };
  }

  revalidatePath(`/events/${eventId}`);

  return {
    status: "success",
    message: "訪問状態を更新しました。",
    visitStatus,
  };
}
