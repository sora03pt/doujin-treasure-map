"use client";

import { useActionState, useEffect, useId, useRef } from "react";

import type {
  CircleFormState,
  CircleFormValues,
} from "@/features/circles/types";
import { useConnectivity } from "@/features/offline/components/connectivity-provider";

type CircleFormAction = (
  state: CircleFormState,
  formData: FormData,
) => Promise<CircleFormState>;

type CircleFormProps = {
  action: CircleFormAction;
  initialValues: CircleFormValues;
  submitLabel: string;
};

const inputClassName =
  "min-h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-950 shadow-sm transition focus:border-blue-600 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:disabled:bg-slate-900";

export const emptyCircleFormValues: CircleFormValues = {
  name: "",
  spaceNumber: "",
  priority: "want",
  visitStatus: "unvisited",
  memo: "",
  assignee: "",
  distributionPostUrl: "",
};

export function CircleForm({
  action,
  initialValues,
  submitLabel,
}: CircleFormProps) {
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
          サークル名 <span className="text-red-700">（必須）</span>
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
        {state.fieldErrors.name ? <p className="text-sm text-red-700" id={errorId("name")}>{state.fieldErrors.name}</p> : null}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold" htmlFor={fieldId("space-number")}>
          スペース番号 <span className="font-normal text-slate-500">（任意）</span>
        </label>
        <input
          aria-describedby={state.fieldErrors.spaceNumber ? errorId("space-number") : undefined}
          aria-invalid={Boolean(state.fieldErrors.spaceNumber)}
          className={inputClassName}
          defaultValue={state.values.spaceNumber}
          disabled={controlsDisabled}
          id={fieldId("space-number")}
          maxLength={50}
          name="space_number"
          type="text"
        />
        {state.fieldErrors.spaceNumber ? <p className="text-sm text-red-700" id={errorId("space-number")}>{state.fieldErrors.spaceNumber}</p> : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-sm font-semibold" htmlFor={fieldId("priority")}>優先度</label>
          <select
            aria-describedby={state.fieldErrors.priority ? errorId("priority") : undefined}
            aria-invalid={Boolean(state.fieldErrors.priority)}
            className={inputClassName}
            defaultValue={state.values.priority}
            disabled={controlsDisabled}
            id={fieldId("priority")}
            name="priority"
          >
            <option value="must">最優先</option>
            <option value="want">行きたい</option>
            <option value="if_time">時間があれば</option>
          </select>
          {state.fieldErrors.priority ? <p className="text-sm text-red-700" id={errorId("priority")}>{state.fieldErrors.priority}</p> : null}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold" htmlFor={fieldId("visit-status")}>訪問状態</label>
          <select
            aria-describedby={state.fieldErrors.visitStatus ? errorId("visit-status") : undefined}
            aria-invalid={Boolean(state.fieldErrors.visitStatus)}
            className={inputClassName}
            defaultValue={state.values.visitStatus}
            disabled={controlsDisabled}
            id={fieldId("visit-status")}
            name="visit_status"
          >
            <option value="unvisited">未訪問</option>
            <option value="purchased">購入済み</option>
            <option value="sold_out">売り切れ</option>
            <option value="skipped">スキップ</option>
          </select>
          {state.fieldErrors.visitStatus ? <p className="text-sm text-red-700" id={errorId("visit-status")}>{state.fieldErrors.visitStatus}</p> : null}
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold" htmlFor={fieldId("assignee")}>
          担当者 <span className="font-normal text-slate-500">（任意）</span>
        </label>
        <input
          aria-describedby={state.fieldErrors.assignee ? errorId("assignee") : undefined}
          aria-invalid={Boolean(state.fieldErrors.assignee)}
          className={inputClassName}
          defaultValue={state.values.assignee}
          disabled={controlsDisabled}
          id={fieldId("assignee")}
          maxLength={100}
          name="assignee"
          type="text"
        />
        {state.fieldErrors.assignee ? <p className="text-sm text-red-700" id={errorId("assignee")}>{state.fieldErrors.assignee}</p> : null}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold" htmlFor={fieldId("distribution-post-url")}>
          Xの頒布情報URL <span className="font-normal text-slate-500">（任意）</span>
        </label>
        <input
          aria-describedby={state.fieldErrors.distributionPostUrl ? errorId("distribution-post-url") : `${fieldId("distribution-post-url")}-help`}
          aria-invalid={Boolean(state.fieldErrors.distributionPostUrl)}
          className={inputClassName}
          defaultValue={state.values.distributionPostUrl}
          disabled={controlsDisabled}
          id={fieldId("distribution-post-url")}
          maxLength={500}
          name="distribution_post_url"
          placeholder="https://x.com/username/status/123456789"
          type="url"
        />
        <p className="text-xs leading-5 text-slate-500 dark:text-slate-400" id={`${fieldId("distribution-post-url")}-help`}>
          x.comまたはtwitter.comの投稿URLを登録できます。
        </p>
        {state.fieldErrors.distributionPostUrl ? <p className="text-sm text-red-700" id={errorId("distribution-post-url")}>{state.fieldErrors.distributionPostUrl}</p> : null}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold" htmlFor={fieldId("memo")}>
          メモ <span className="font-normal text-slate-500">（任意）</span>
        </label>
        <textarea
          aria-describedby={state.fieldErrors.memo ? errorId("memo") : undefined}
          aria-invalid={Boolean(state.fieldErrors.memo)}
          className={`${inputClassName} min-h-28 py-3 leading-6`}
          defaultValue={state.values.memo}
          disabled={controlsDisabled}
          id={fieldId("memo")}
          maxLength={2000}
          name="memo"
          rows={4}
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
