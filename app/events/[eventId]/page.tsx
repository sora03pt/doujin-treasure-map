import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { updateEvent } from "@/features/events/actions";
import { DeleteEventDialog } from "@/features/events/components/delete-event-dialog";
import { EventForm } from "@/features/events/components/event-form";
import { getEventForCurrentUser } from "@/features/events/data";
import { isEventId } from "@/features/events/validation";

type EventDetailPageProps = {
  params: Promise<{
    eventId: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function EventDetailPage({
  params,
}: EventDetailPageProps) {
  const { eventId } = await params;

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

  const event = result.event;
  const updateEventWithId = updateEvent.bind(null, event.id);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-5 text-slate-950 sm:px-6 lg:px-8 dark:bg-slate-950 dark:text-slate-50">
      <div className="mx-auto w-full max-w-2xl">
        <Link
          className="inline-flex min-h-11 items-center text-sm font-semibold text-blue-700 hover:underline dark:text-blue-300"
          href="/events"
        >
          イベント一覧へ戻る
        </Link>
      </div>
      <section className="mx-auto mt-3 w-full max-w-2xl rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
          Event
        </p>
        <h1 className="mt-1 break-words text-3xl font-semibold tracking-normal">
          {event.name}
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
          開催日や会場など、このイベントの基本情報を編集できます。
        </p>
        <div className="mt-6">
          <EventForm
            action={updateEventWithId}
            initialValues={{
              name: event.name,
              eventDate: event.eventDate,
              venue: event.venue ?? "",
              memo: event.memo ?? "",
            }}
            submitLabel="変更を保存"
          />
        </div>
      </section>

      <section
        aria-labelledby="delete-event-title"
        className="mx-auto mt-5 w-full max-w-2xl border-t border-slate-300 pt-5 dark:border-slate-700"
      >
        <h2 className="text-lg font-semibold" id="delete-event-title">
          イベントの削除
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          このイベントに紐づくデータも削除されます。内容を確認して操作してください。
        </p>
        <div className="mt-4">
          <DeleteEventDialog eventId={event.id} eventName={event.name} />
        </div>
      </section>
    </main>
  );
}
