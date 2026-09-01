"use client";

import { useActionState } from "react";

import { visitStatusOptions } from "@/features/circles/display";
import type {
  QuickVisitStatusState,
  VisitStatus,
} from "@/features/circles/types";

type QuickVisitStatusAction = (
  state: QuickVisitStatusState,
  formData: FormData,
) => Promise<QuickVisitStatusState>;

type QuickVisitStatusProps = {
  action: QuickVisitStatusAction;
  circleName: string;
  initialVisitStatus: VisitStatus;
};

export function QuickVisitStatus({
  action,
  circleName,
  initialVisitStatus,
}: QuickVisitStatusProps) {
  const initialState: QuickVisitStatusState = {
    status: "idle",
    message: "",
    visitStatus: initialVisitStatus,
  };
  const [state, formAction, isPending] = useActionState(action, initialState);
  const currentVisitStatus =
    state.status === "idle" ? initialVisitStatus : state.visitStatus;

  return (
    <div>
      <form action={formAction} aria-busy={isPending}>
        <fieldset disabled={isPending}>
          <legend className="text-sm font-semibold">
            {circleName}の訪問状態
          </legend>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {visitStatusOptions.map(({ value, label }) => {
              const isCurrent = currentVisitStatus === value;

              return (
                <button
                  aria-pressed={isCurrent}
                  className={`min-h-11 rounded-lg border px-2 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-60 ${
                    isCurrent
                      ? "border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950"
                      : "border-slate-300 bg-white text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-800"
                  }`}
                  key={value}
                  name="visit_status"
                  type="submit"
                  value={value}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </fieldset>
      </form>

      {isPending ? (
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300" role="status">
          更新中...
        </p>
      ) : state.message ? (
        <p
          className={`mt-2 text-sm ${
            state.status === "error"
              ? "font-semibold text-red-700 dark:text-red-300"
              : "text-emerald-700 dark:text-emerald-300"
          }`}
          role={state.status === "error" ? "alert" : "status"}
        >
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
