import Link from "next/link";

import { createEvent } from "@/features/events/actions";
import { EventForm } from "@/features/events/components/event-form";

export default function NewEventPage() {
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
          New Event
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-normal">
          イベントを作成
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
          公式配置図を見ながら準備するイベントの基本情報を登録します。
        </p>
        <div className="mt-6">
          <EventForm
            action={createEvent}
            initialValues={{
              name: "",
              eventDate: "",
              plannedBudget: "",
              venue: "",
              memo: "",
            }}
            submitLabel="イベントを作成"
          />
        </div>
      </section>
    </main>
  );
}
