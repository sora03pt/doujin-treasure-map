import Link from "next/link";

export default function NewEventPlaceholderPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-5 text-slate-950 sm:px-6 lg:px-8 dark:bg-slate-950 dark:text-slate-50">
      <section className="mx-auto w-full max-w-2xl rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
          Phase 2
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-normal">
          イベント作成は次のPhaseで実装します
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Phase 1ではAuth、DB、RLS、イベント一覧の空状態までを確認します。
        </p>
        <Link
          className="mt-6 inline-flex min-h-12 items-center justify-center rounded-lg bg-slate-950 px-5 text-base font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950"
          href="/"
        >
          イベント一覧へ戻る
        </Link>
      </section>
    </main>
  );
}
