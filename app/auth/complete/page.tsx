import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "登録完了 | Doujin Treasure Map",
};

export default async function AuthCompletePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 sm:px-6 dark:bg-slate-950 dark:text-slate-50">
      <section
        aria-labelledby="registration-complete-title"
        className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center"
      >
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Doujin Treasure Map
          </p>

          <div
            aria-hidden="true"
            className="mx-auto mt-7 flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
          >
            <svg
              className="size-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
            >
              <path d="m5 12 4 4L19 6" />
            </svg>
          </div>

          <h1
            className="mt-6 text-2xl font-semibold tracking-normal"
            id="registration-complete-title"
          >
            登録が完了しました
          </h1>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
            メールアドレスの確認が完了しました。
            <br />
            宝の地図を作成して、イベントの準備を始めましょう。
          </p>

          <Link
            className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-slate-950 px-5 text-base font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
            href="/events"
          >
            はじめる
          </Link>
        </div>
      </section>
    </main>
  );
}
