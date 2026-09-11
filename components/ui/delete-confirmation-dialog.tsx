"use client";

import { useActionState, useEffect, useId, useRef } from "react";

import { useConnectivity } from "@/features/offline/components/connectivity-provider";

type DeleteState = {
  status: "idle" | "error";
  message: string;
};

type DeleteConfirmationDialogProps = {
  action: (state: DeleteState) => Promise<DeleteState>;
  triggerLabel: string;
  title: string;
  description: string;
};

const initialState: DeleteState = {
  status: "idle",
  message: "",
};

export function DeleteConfirmationDialog({
  action,
  triggerLabel,
  title,
  description,
}: DeleteConfirmationDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const [state, formAction, isPending] = useActionState(action, initialState);
  const { isOnline } = useConnectivity();

  useEffect(() => {
    if (state.status === "error") {
      errorRef.current?.focus();
    }
  }, [state]);

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
        aria-label={
          isOnline ? triggerLabel : `${triggerLabel}（オフライン中は利用不可）`
        }
        aria-haspopup="dialog"
        className="min-h-11 rounded-lg px-3 text-sm font-semibold text-red-800 underline-offset-4 hover:bg-red-50 hover:underline dark:text-red-300 dark:hover:bg-red-950"
        disabled={!isOnline}
        onClick={openDialog}
        ref={triggerRef}
        type="button"
      >
        {triggerLabel}
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
        onClose={() => triggerRef.current?.focus()}
        ref={dialogRef}
      >
        <div className="p-5">
          <h2 className="text-xl font-semibold" id={titleId}>
            {title}
          </h2>
          <p
            className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300"
            id={descriptionId}
          >
            {description}
          </p>

          {state.message ? (
            <p
              className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-900"
              ref={errorRef}
              role="alert"
              tabIndex={-1}
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
              disabled={isPending || !isOnline}
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
