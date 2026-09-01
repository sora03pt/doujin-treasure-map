import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { BudgetSummary } from "@/features/budget/components/budget-summary";
import { CircleList } from "@/features/circles/components/circle-list";
import { EventDaySummary } from "@/features/circles/components/event-day-summary";
import { listCirclesForCurrentUser } from "@/features/circles/data";
import { parseEventDayFilters } from "@/features/circles/event-day";
import { updateEvent } from "@/features/events/actions";
import { DeleteEventDialog } from "@/features/events/components/delete-event-dialog";
import { EventForm } from "@/features/events/components/event-form";
import { getEventForCurrentUser } from "@/features/events/data";
import { isEventId } from "@/features/events/validation";
import { listItemsForCurrentUser } from "@/features/items/data";

type EventDetailPageProps = {
  params: Promise<{ eventId: string }>;
  searchParams: Promise<{
    notice?: string;
    status?: string | string[];
    priority?: string | string[];
  }>;
};

const noticeMessages: Record<string, string> = {
  "circle-created": "サークルを追加しました。",
  "circle-updated": "サークル情報を更新しました。",
  "circle-deleted": "サークルを削除しました。",
  "item-created": "頒布物を追加しました。",
  "item-updated": "頒布物を更新しました。",
  "item-deleted": "頒布物を削除しました。",
};

const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

export const dynamic = "force-dynamic";

export default async function EventDetailPage({
  params,
  searchParams,
}: EventDetailPageProps) {
  const [{ eventId }, query] = await Promise.all([params, searchParams]);

  if (!isEventId(eventId)) {
    notFound();
  }

  const result = await getEventForCurrentUser(eventId);

  if (result.status === "unauthenticated") {
    redirect("/login");
  }

  if (result.status === "not_found") {
    notFound();
  }

  if (result.status === "error") {
    throw new Error("イベントを読み込めませんでした。");
  }

  const circlesResult = await listCirclesForCurrentUser(eventId);

  if (circlesResult.status === "unauthenticated") {
    redirect("/login");
  }

  if (circlesResult.status === "not_found") {
    notFound();
  }

  if (circlesResult.status === "error") {
    throw new Error("サークルを読み込めませんでした。");
  }

  const itemsResult = await listItemsForCurrentUser(
    circlesResult.circles.map((circle) => circle.id),
  );

  if (itemsResult.status === "unauthenticated") {
    redirect("/login");
  }

  if (itemsResult.status === "error") {
    throw new Error("頒布物を読み込めませんでした。");
  }

  const event = result.event;
  const updateEventWithId = updateEvent.bind(null, event.id);
  const noticeMessage = query.notice ? noticeMessages[query.notice] : undefined;
  const filters = parseEventDayFilters(query);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-5 text-slate-950 sm:px-6 lg:px-8 dark:bg-slate-950 dark:text-slate-50">
      <div className="mx-auto w-full max-w-2xl">
        <Link
          className="inline-flex min-h-11 items-center text-sm font-semibold text-blue-700 hover:underline dark:text-blue-300"
          href="/events"
        >
          イベント一覧へ戻る
        </Link>

        {noticeMessage ? (
          <p
            className="mt-3 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100"
            role="status"
          >
            {noticeMessage}
          </p>
        ) : null}

        <section className="mt-3 border-b border-slate-300 pb-5 dark:border-slate-700">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Event
          </p>
          <h1 className="mt-1 break-words text-3xl font-semibold tracking-normal">
            {event.name}
          </h1>
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-semibold text-slate-600 dark:text-slate-300">
                開催日
              </dt>
              <dd className="mt-1">
                {dateFormatter.format(new Date(`${event.eventDate}T00:00:00Z`))}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-600 dark:text-slate-300">
                会場
              </dt>
              <dd className="mt-1 break-words">{event.venue ?? "未設定"}</dd>
            </div>
          </dl>
          {event.memo ? (
            <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600 dark:text-slate-300">
              {event.memo}
            </p>
          ) : null}

          <details className="group mt-4">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 [&::-webkit-details-marker]:hidden">
              イベント情報を編集
            </summary>
            <div className="mt-4 border-l-2 border-slate-300 pl-3 dark:border-slate-700 sm:pl-4">
              <EventForm
                action={updateEventWithId}
                initialValues={{
                  name: event.name,
                  eventDate: event.eventDate,
                  plannedBudget: event.plannedBudget?.toString() ?? "",
                  venue: event.venue ?? "",
                  memo: event.memo ?? "",
                }}
                submitLabel="変更を保存"
              />
            </div>
          </details>
        </section>

        <BudgetSummary
          circles={circlesResult.circles}
          items={itemsResult.items}
          plannedBudget={event.plannedBudget}
        />

        <EventDaySummary circles={circlesResult.circles} />

        <div className="mt-6">
          <CircleList
            circles={circlesResult.circles}
            eventId={event.id}
            filters={filters}
            items={itemsResult.items}
          />
        </div>

        <section
          aria-labelledby="delete-event-title"
          className="mt-8 border-t border-slate-300 pt-5 dark:border-slate-700"
        >
          <h2 className="text-lg font-semibold" id="delete-event-title">
            イベントの削除
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            このイベントに紐づくサークルと頒布物も削除されます。
          </p>
          <div className="mt-4">
            <DeleteEventDialog eventId={event.id} eventName={event.name} />
          </div>
        </section>
      </div>
    </main>
  );
}
