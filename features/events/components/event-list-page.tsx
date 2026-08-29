import Link from "next/link";

import { LogoutButton } from "@/features/auth/components/logout-button";
import { createClient } from "@/lib/supabase/server";

type EventRow = {
  id: string;
  name: string;
  event_date: string;
  venue: string | null;
};

function formatEventDate(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
  }).format(new Date(`${value}T00:00:00+09:00`));
}

function EmptyState() {
  return (
    <section
      aria-labelledby="empty-events-title"
      className="rounded-lg border border-dashed border-slate-300 bg-white px-5 py-8 text-center dark:border-slate-700 dark:bg-slate-900"
    >
      <h2 id="empty-events-title" className="text-xl font-semibold">
        まだイベントがありません
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300">
        Phase 2でイベント作成を実装します。まずはログインとDB/RLSの土台を確認できる状態です。
      </p>
      <Link
        className="mt-6 inline-flex min-h-12 items-center justify-center rounded-lg bg-slate-950 px-5 text-base font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950"
        href="/events/new"
      >
        イベントを作成
      </Link>
    </section>
  );
}

export async function EventListPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: events, error } = await supabase
    .from("events")
    .select("id,name,event_date,venue")
    .order("event_date", { ascending: true })
    .returns<EventRow[]>();

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-5 text-slate-950 sm:px-6 lg:px-8 dark:bg-slate-950 dark:text-slate-50">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Doujin Treasure Map
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal">
              イベント一覧
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {user?.email ?? "ログイン中"} の宝の地図
            </p>
          </div>
          <LogoutButton />
        </header>

        {error ? (
          <p
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-900"
            role="alert"
          >
            イベント一覧を読み込めませんでした: {error.message}
          </p>
        ) : null}

        {!error && events?.length ? (
          <section aria-labelledby="events-title" className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 id="events-title" className="text-xl font-semibold">
                登録済みイベント
              </h2>
              <Link
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950"
                href="/events/new"
              >
                イベントを作成
              </Link>
            </div>
            <ul className="space-y-3">
              {events.map((event) => (
                <li
                  className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                  key={event.id}
                >
                  <Link className="block rounded-md" href={`/events/${event.id}`}>
                    <span className="block text-lg font-semibold">
                      {event.name}
                    </span>
                    <span className="mt-1 block text-sm text-slate-600 dark:text-slate-300">
                      {formatEventDate(event.event_date)}
                      {event.venue ? ` / ${event.venue}` : ""}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {!error && events?.length === 0 ? <EmptyState /> : null}
      </div>
    </main>
  );
}
