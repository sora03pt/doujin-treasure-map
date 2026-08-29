"use client";

import { useActionState, useEffect, useId, useRef } from "react";

import type {
  EventFormState,
  EventFormValues,
} from "@/features/events/types";

type EventFormAction = (
  state: EventFormState,
  formData: FormData,
) => Promise<EventFormState>;

type EventFormProps = {
  action: EventFormAction;
  initialValues: EventFormValues;
  submitLabel: string;
};

const inputClassName =
  "min-h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-950 shadow-sm transition focus:border-blue-600 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:disabled:bg-slate-900";

export function EventForm({
  action,
  initialValues,
  submitLabel,
}: EventFormProps) {
  const formId = useId().replaceAll(":", "");
  const [state, formAction, isPending] = useActionState(action, {
    status: "idle",
    message: "",
    fieldErrors: {},
    values: initialValues,
  });
  const errorSummaryRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (state.status !== "error") {
      return;
    }

    const firstInvalidField = document.querySelector<HTMLElement>(
      `#${formId} [aria-invalid="true"]`,
    );

    if (firstInvalidField) {
      firstInvalidField.focus();
      return;
    }

    errorSummaryRef.current?.focus();
  }, [formId, state]);

  const fieldId = (name: string) => `${formId}-${name}`;
  const errorId = (name: string) => `${fieldId(name)}-error`;

  return (
    <form
      action={formAction}
      aria-busy={isPending}
      className="space-y-5"
      id={formId}
    >
      {state.message ? (
        <p
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-900"
          ref={errorSummaryRef}
          role="alert"
          tabIndex={-1}
        >
          {state.message}
        </p>
      ) : null}

      <div className="space-y-2">
        <label className="block text-sm font-semibold" htmlFor={fieldId("name")}>
          イベント名 <span className="text-red-700">（必須）</span>
        </label>
        <input
          aria-describedby={state.fieldErrors.name ? errorId("name") : undefined}
          aria-invalid={Boolean(state.fieldErrors.name)}
          className={inputClassName}
          defaultValue={state.values.name}
          disabled={isPending}
          id={fieldId("name")}
          maxLength={120}
          name="name"
          required
          type="text"
        />
        {state.fieldErrors.name ? (
          <p className="text-sm text-red-700" id={errorId("name")}>
            {state.fieldErrors.name}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label
          className="block text-sm font-semibold"
          htmlFor={fieldId("event-date")}
        >
          開催日 <span className="text-red-700">（必須）</span>
        </label>
        <input
          aria-describedby={
            state.fieldErrors.eventDate ? errorId("event-date") : undefined
          }
          aria-invalid={Boolean(state.fieldErrors.eventDate)}
          className={inputClassName}
          defaultValue={state.values.eventDate}
          disabled={isPending}
          id={fieldId("event-date")}
          name="event_date"
          required
          type="date"
        />
        {state.fieldErrors.eventDate ? (
          <p className="text-sm text-red-700" id={errorId("event-date")}>
            {state.fieldErrors.eventDate}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label
          className="block text-sm font-semibold"
          htmlFor={fieldId("venue")}
        >
          会場 <span className="font-normal text-slate-500">（任意）</span>
        </label>
        <input
          aria-describedby={
            state.fieldErrors.venue ? errorId("venue") : undefined
          }
          aria-invalid={Boolean(state.fieldErrors.venue)}
          className={inputClassName}
          defaultValue={state.values.venue}
          disabled={isPending}
          id={fieldId("venue")}
          maxLength={200}
          name="venue"
          type="text"
        />
        {state.fieldErrors.venue ? (
          <p className="text-sm text-red-700" id={errorId("venue")}>
            {state.fieldErrors.venue}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label
          className="block text-sm font-semibold"
          htmlFor={fieldId("memo")}
        >
          メモ <span className="font-normal text-slate-500">（任意）</span>
        </label>
        <textarea
          aria-describedby={
            state.fieldErrors.memo ? errorId("memo") : undefined
          }
          aria-invalid={Boolean(state.fieldErrors.memo)}
          className={`${inputClassName} min-h-32 py-3 leading-6`}
          defaultValue={state.values.memo}
          disabled={isPending}
          id={fieldId("memo")}
          maxLength={2000}
          name="memo"
          rows={5}
        />
        {state.fieldErrors.memo ? (
          <p className="text-sm text-red-700" id={errorId("memo")}>
            {state.fieldErrors.memo}
          </p>
        ) : null}
      </div>

      <button
        aria-live="polite"
        className="min-h-12 w-full rounded-lg bg-slate-950 px-5 text-base font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "保存中..." : submitLabel}
      </button>
    </form>
  );
}
