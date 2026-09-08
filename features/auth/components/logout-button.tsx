"use client";

import { useRef, useState } from "react";

import { logout } from "@/features/auth/actions";
import { clearOfflineData } from "@/features/offline/storage";

export function LogoutButton() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [clearError, setClearError] = useState(false);
  const clearedRef = useRef(false);

  async function clearThenSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (clearedRef.current) {
      return;
    }

    event.preventDefault();
    setIsClearing(true);
    setClearError(false);

    try {
      await clearOfflineData();
      clearedRef.current = true;
      formRef.current?.requestSubmit();
    } catch {
      setIsClearing(false);
      setClearError(true);
    }
  }

  return (
    <div>
      <form action={logout} onSubmit={clearThenSubmit} ref={formRef}>
        <button
          aria-describedby={clearError ? "logout-clear-error" : undefined}
          className="min-h-11 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900"
          disabled={isClearing}
          type="submit"
        >
          {isClearing ? "ローカルデータを削除中..." : "ログアウト"}
        </button>
      </form>
      {clearError ? (
        <p
          className="mt-2 max-w-64 text-sm text-red-700 dark:text-red-300"
          id="logout-clear-error"
          role="alert"
        >
          ローカルデータを削除できませんでした。もう一度お試しください。
        </p>
      ) : null}
    </div>
  );
}
