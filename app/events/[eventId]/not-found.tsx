import Link from "next/link";

export default function EventNotFound() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <section className="mx-auto w-full max-w-xl text-center">
        <h1 className="text-2xl font-semibold">イベントが見つかりません</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
          削除されたか、このアカウントでは表示できないイベントです。
        </p>
        <Link
          className="mt-6 inline-flex min-h-12 items-center justify-center rounded-lg bg-slate-950 px-5 text-base font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950"
          href="/events"
        >
          イベント一覧へ戻る
        </Link>
      </section>
    </main>
  );
}
