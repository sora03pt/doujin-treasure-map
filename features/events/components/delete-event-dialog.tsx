"use client";

import { useActionState, useId, useRef } from "react";

import { deleteEvent } from "@/features/events/actions";
import type { DeleteEventState } from "@/features/events/types";

type DeleteEventDialogProps = {
  eventId: string;
  eventName: string;
};

const initialDeleteState: DeleteEventState = {
  status: "idle",
  message: "",
};

export function DeleteEventDialog({
  eventId,
  eventName,
}: DeleteEventDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const deleteEventWithId = deleteEvent.bind(null, eventId);
  const [state, formAction, isPending] = useActionState(
    deleteEventWithId,
    initialDeleteState,
  );

  function openDialog() {
    dialogRef.current?.showModal();
    cancelButtonRef.current?.focus();
  }

  function closeDialog() {
    dialogRef.current?.close();
  }

  return (
    <>
      <button
        aria-haspopup="dialog"
        className="min-h-12 w-full rounded-lg border border-red-300 bg-white px-5 text-base font-semibold text-red-800 transition hover:bg-red-50 dark:border-red-800 dark:bg-slate-950 dark:text-red-300 dark:hover:bg-red-950"
        onClick={openDialog}
        type="button"
      >
        イベントを削除
      </button>

      <dialog
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-lg border border-slate-300 bg-white p-0 text-slate-950 shadow-xl backdrop:bg-slate-950/60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
        onCancel={(event) => {
          if (isPending) {
            event.preventDefault();
          }
        }}
        ref={dialogRef}
      >
        <div className="p-5">
          <h2 className="text-xl font-semibold" id={titleId}>
            イベントを削除しますか？
          </h2>
          <p
            className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300"
            id={descriptionId}
          >
            「{eventName}」と、登録済みのサークル・頒布物が削除されます。この操作は元に戻せません。
          </p>

          {state.message ? (
            <p
              className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-900"
              role="alert"
            >
              {state.message}
            </p>
          ) : null}

          <form action={formAction} className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              className="min-h-12 rounded-lg border border-slate-300 bg-white px-4 text-base font-semibold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-800"
              disabled={isPending}
              onClick={closeDialog}
              ref={cancelButtonRef}
              type="button"
            >
              キャンセル
            </button>
            <button
              aria-live="polite"
              className="min-h-12 rounded-lg bg-red-700 px-4 text-base font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isPending}
              type="submit"
            >
              {isPending ? "削除中..." : "削除する"}
            </button>
          </form>
        </div>
      </dialog>
    </>
  );
}
