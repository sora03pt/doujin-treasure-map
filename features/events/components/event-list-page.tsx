import Link from "next/link";
import { redirect } from "next/navigation";

import { LogoutButton } from "@/features/auth/components/logout-button";
import { listEventsForCurrentUser } from "@/features/events/data";

const notices = {
  created: "イベントを作成しました。",
  updated: "イベントを更新しました。",
  deleted: "イベントを削除しました。",
} as const;

type EventListPageProps = {
  notice?: keyof typeof notices;
};

function formatEventDate(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
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
        参加予定のイベントを登録して、当日の宝の地図を作り始めましょう。
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

export async function EventListPage({ notice }: EventListPageProps = {}) {
  const result = await listEventsForCurrentUser();

  if (result.status === "unauthenticated") {
    redirect("/login");
  }

  const events = result.events;

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
              参加予定を開催日が新しい順に表示しています。
            </p>
          </div>
          <LogoutButton />
        </header>

        {notice ? (
          <p
            className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-900"
            role="status"
          >
            {notices[notice]}
          </p>
        ) : null}

        {result.status === "error" ? (
          <p
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-900"
            role="alert"
          >
            イベント一覧を読み込めませんでした。時間をおいて再度お試しください。
          </p>
        ) : null}

        {result.status === "success" && events.length > 0 ? (
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
                      <time dateTime={event.eventDate}>
                        {formatEventDate(event.eventDate)}
                      </time>
                    </span>
                    <span className="mt-1 block text-sm text-slate-600 dark:text-slate-300">
                      {event.venue || "会場未登録"}
                    </span>
                    <span className="mt-3 block text-sm font-semibold text-blue-700 dark:text-blue-300">
                      詳細・編集へ
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {result.status === "success" && events.length === 0 ? (
          <EmptyState />
        ) : null}
      </div>
    </main>
  );
}
