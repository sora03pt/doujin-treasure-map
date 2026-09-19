"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";

import type {
  EventFormState,
  EventFormValues,
} from "@/features/events/types";
import { useConnectivity } from "@/features/offline/components/connectivity-provider";
import { VENUE_PRESETS } from "@/features/events/venue";

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
  const [venuePreset, setVenuePreset] = useState(initialValues.venuePreset);
  const { isOnline } = useConnectivity();
  const controlsDisabled = isPending || !isOnline;

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
          disabled={controlsDisabled}
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
          disabled={controlsDisabled}
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
          htmlFor={fieldId("planned-budget")}
        >
          予定予算 <span className="font-normal text-slate-500">（任意）</span>
        </label>
        <div className="relative">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-500"
          >
            ¥
          </span>
          <input
            aria-describedby={
              state.fieldErrors.plannedBudget
                ? errorId("planned-budget")
                : undefined
            }
            aria-invalid={Boolean(state.fieldErrors.plannedBudget)}
            className={`${inputClassName} pl-8`}
            defaultValue={state.values.plannedBudget}
            disabled={controlsDisabled}
            id={fieldId("planned-budget")}
            inputMode="numeric"
            max={2147483647}
            min={0}
            name="planned_budget"
            step={1}
            type="number"
          />
        </div>
        {state.fieldErrors.plannedBudget ? (
          <p className="text-sm text-red-700" id={errorId("planned-budget")}>
            {state.fieldErrors.plannedBudget}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label
          className="block text-sm font-semibold"
          htmlFor={fieldId("venue-preset")}
        >
          会場 <span className="font-normal text-slate-500">（任意）</span>
        </label>
        <select
          aria-describedby={
            state.fieldErrors.venuePreset ? errorId("venue-preset") : undefined
          }
          aria-invalid={Boolean(state.fieldErrors.venuePreset)}
          className={inputClassName}
          disabled={controlsDisabled}
          id={fieldId("venue-preset")}
          name="venue_preset"
          onChange={(event) => setVenuePreset(event.currentTarget.value)}
          value={venuePreset}
        >
          {VENUE_PRESETS.map((venue) => (
            <option key={venue} value={venue}>{venue}</option>
          ))}
          <option value="other">その他</option>
        </select>
        {state.fieldErrors.venuePreset ? (
          <p className="text-sm text-red-700" id={errorId("venue-preset")}>
            {state.fieldErrors.venuePreset}
          </p>
        ) : null}
      </div>

      {venuePreset === "other" ? (
        <div className="space-y-2">
          <label className="block text-sm font-semibold" htmlFor={fieldId("venue-custom")}>
            会場名 <span className="font-normal text-slate-500">（任意）</span>
          </label>
          <input
            aria-describedby={state.fieldErrors.venueCustom ? errorId("venue-custom") : undefined}
            aria-invalid={Boolean(state.fieldErrors.venueCustom)}
            className={inputClassName}
            defaultValue={state.values.venueCustom}
            disabled={controlsDisabled}
            id={fieldId("venue-custom")}
            maxLength={200}
            name="venue_custom"
            type="text"
          />
          {state.fieldErrors.venueCustom ? (
            <p className="text-sm text-red-700" id={errorId("venue-custom")}>
              {state.fieldErrors.venueCustom}
            </p>
          ) : null}
        </div>
      ) : (
        <input name="venue_custom" type="hidden" value="" />
      )}

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
          disabled={controlsDisabled}
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
        disabled={controlsDisabled}
        type="submit"
      >
        {isPending
          ? "保存中..."
          : !isOnline
            ? "オフライン中は保存できません"
            : submitLabel}
      </button>
    </form>
  );
}
