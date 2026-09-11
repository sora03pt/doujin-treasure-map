"use client";

import { useActionState, useEffect, useState } from "react";

import { authenticate, type AuthFormState } from "@/features/auth/actions";
import { clearOfflineData } from "@/features/offline/storage";

const initialAuthFormState: AuthFormState = {
  status: "idle",
  message: "",
};

export function AuthForm() {
  const [state, formAction, isPending] = useActionState(
    authenticate,
    initialAuthFormState,
  );
  const [cleanupState, setCleanupState] = useState<
    "pending" | "ready" | "error"
  >("pending");

  async function retryLocalDataCleanup() {
    setCleanupState("pending");

    try {
      await clearOfflineData();
      setCleanupState("ready");
    } catch {
      setCleanupState("error");
    }
  }

  const controlsDisabled = isPending || cleanupState !== "ready";

  useEffect(() => {
    let active = true;

    clearOfflineData()
      .then(() => {
        if (active) {
          setCleanupState("ready");
        }
      })
      .catch(() => {
        if (active) {
          setCleanupState("error");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <form
      action={formAction}
      aria-busy={cleanupState === "pending" || isPending}
      className="space-y-5"
    >
      {cleanupState === "error" ? (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-900"
          role="alert"
        >
          <p>ローカルデータを削除できないため、ログインを開始できません。</p>
          <button
            className="mt-2 min-h-11 font-semibold underline underline-offset-4"
            onClick={() => void retryLocalDataCleanup()}
            type="button"
          >
            削除を再試行
          </button>
        </div>
      ) : null}

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
          disabled={controlsDisabled}
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
          disabled={controlsDisabled}
          required
          type="password"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          className="min-h-12 rounded-lg bg-slate-950 px-4 text-base font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950"
          disabled={controlsDisabled}
          name="intent"
          type="submit"
          value="login"
        >
          {cleanupState === "pending"
            ? "ローカルデータを確認中..."
            : isPending
              ? "処理中..."
              : "ログイン"}
        </button>
        <button
          className="min-h-12 rounded-lg border border-slate-300 bg-white px-4 text-base font-semibold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900"
          disabled={controlsDisabled}
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
