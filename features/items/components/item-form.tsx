"use client";

import { useActionState, useEffect, useId, useRef } from "react";

import type { ItemFormState, ItemFormValues } from "@/features/items/types";
import { useConnectivity } from "@/features/offline/components/connectivity-provider";

type ItemFormAction = (
  state: ItemFormState,
  formData: FormData,
) => Promise<ItemFormState>;

type ItemFormProps = {
  action: ItemFormAction;
  initialValues: ItemFormValues;
  submitLabel: string;
};

const inputClassName =
  "min-h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-950 shadow-sm transition focus:border-blue-600 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:disabled:bg-slate-900";

export const emptyItemFormValues: ItemFormValues = {
  name: "",
  price: "",
  quantity: "1",
  memo: "",
};

export function ItemForm({ action, initialValues, submitLabel }: ItemFormProps) {
  const formId = useId().replaceAll(":", "");
  const [state, formAction, isPending] = useActionState(action, {
    status: "idle",
    message: "",
    fieldErrors: {},
    values: initialValues,
  });
  const errorSummaryRef = useRef<HTMLParagraphElement>(null);
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
    <form action={formAction} aria-busy={isPending} className="space-y-5" id={formId}>
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
          頒布物名 <span className="text-red-700">（必須）</span>
        </label>
        <input
          aria-describedby={state.fieldErrors.name ? errorId("name") : undefined}
          aria-invalid={Boolean(state.fieldErrors.name)}
          className={inputClassName}
          defaultValue={state.values.name}
          disabled={controlsDisabled}
          id={fieldId("name")}
          maxLength={200}
          name="name"
          required
          type="text"
        />
        {state.fieldErrors.name ? <p className="text-sm text-red-700" id={errorId("name")}>{state.fieldErrors.name}</p> : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-sm font-semibold" htmlFor={fieldId("price")}>
            価格 <span className="font-normal text-slate-500">（任意）</span>
          </label>
          <input
            aria-describedby={state.fieldErrors.price ? errorId("price") : undefined}
            aria-invalid={Boolean(state.fieldErrors.price)}
            className={inputClassName}
            defaultValue={state.values.price}
            disabled={controlsDisabled}
            id={fieldId("price")}
            inputMode="numeric"
            min={0}
            name="price"
            step={1}
            type="number"
          />
          {state.fieldErrors.price ? <p className="text-sm text-red-700" id={errorId("price")}>{state.fieldErrors.price}</p> : null}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold" htmlFor={fieldId("quantity")}>
            数量 <span className="text-red-700">（必須）</span>
          </label>
          <input
            aria-describedby={state.fieldErrors.quantity ? errorId("quantity") : undefined}
            aria-invalid={Boolean(state.fieldErrors.quantity)}
            className={inputClassName}
            defaultValue={state.values.quantity}
            disabled={controlsDisabled}
            id={fieldId("quantity")}
            inputMode="numeric"
            min={1}
            name="quantity"
            required
            step={1}
            type="number"
          />
          {state.fieldErrors.quantity ? <p className="text-sm text-red-700" id={errorId("quantity")}>{state.fieldErrors.quantity}</p> : null}
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold" htmlFor={fieldId("memo")}>
          メモ <span className="font-normal text-slate-500">（任意）</span>
        </label>
        <textarea
          aria-describedby={state.fieldErrors.memo ? errorId("memo") : undefined}
          aria-invalid={Boolean(state.fieldErrors.memo)}
          className={`${inputClassName} min-h-24 py-3 leading-6`}
          defaultValue={state.values.memo}
          disabled={controlsDisabled}
          id={fieldId("memo")}
          maxLength={2000}
          name="memo"
          rows={3}
        />
        {state.fieldErrors.memo ? <p className="text-sm text-red-700" id={errorId("memo")}>{state.fieldErrors.memo}</p> : null}
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
