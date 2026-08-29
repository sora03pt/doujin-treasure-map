"use client";

import { useActionState } from "react";

import { authenticate, type AuthFormState } from "@/features/auth/actions";

const initialAuthFormState: AuthFormState = {
  status: "idle",
  message: "",
};

export function AuthForm() {
  const [state, formAction, isPending] = useActionState(
    authenticate,
    initialAuthFormState,
  );

  return (
    <form action={formAction} className="space-y-5">
      {state.message ? (
        <p
          className={`rounded-lg border px-4 py-3 text-sm leading-6 ${
            state.status === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-red-200 bg-red-50 text-red-900"
          }`}
          role={state.status === "error" ? "alert" : "status"}
        >
          {state.message}
        </p>
      ) : null}

      <div className="space-y-2">
        <label className="block text-sm font-semibold" htmlFor="email">
          メールアドレス
        </label>
        <input
          autoComplete="email"
          className="min-h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-950 shadow-sm transition focus:border-blue-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50"
          id="email"
          name="email"
          required
          type="email"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold" htmlFor="password">
          パスワード
        </label>
        <input
          autoComplete="current-password"
          className="min-h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-950 shadow-sm transition focus:border-blue-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50"
          id="password"
          minLength={6}
          name="password"
          required
          type="password"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          className="min-h-12 rounded-lg bg-slate-950 px-4 text-base font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950"
          disabled={isPending}
          name="intent"
          type="submit"
          value="login"
        >
          {isPending ? "処理中..." : "ログイン"}
        </button>
        <button
          className="min-h-12 rounded-lg border border-slate-300 bg-white px-4 text-base font-semibold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900"
          disabled={isPending}
          name="intent"
          type="submit"
          value="signup"
        >
          新規登録
        </button>
      </div>
    </form>
  );
}
