import { summarizeEventDay } from "@/features/circles/event-day";
import type { Circle } from "@/features/circles/types";

type EventDaySummaryProps = {
  circles: Circle[];
};

export function EventDaySummary({ circles }: EventDaySummaryProps) {
  const progress = summarizeEventDay(circles);

  return (
    <section
      aria-labelledby="event-day-progress-title"
      className="border-b border-slate-300 py-5 dark:border-slate-700"
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Progress
          </p>
          <h2 className="mt-1 text-xl font-semibold" id="event-day-progress-title">
            当日の進捗
          </h2>
        </div>
        <p className="shrink-0 text-sm font-semibold">
          対応済み {progress.handled} / {progress.total}
        </p>
      </div>

      <progress
        aria-label={`対応済み${progress.handled}件、全${progress.total}件`}
        className="mt-3 h-2 w-full accent-emerald-700"
        max={Math.max(progress.total, 1)}
        value={progress.handled}
      />

      <dl className="mt-4 grid grid-cols-4 divide-x divide-slate-300 text-center dark:divide-slate-700">
        <div className="px-1">
          <dt className="text-xs text-slate-600 dark:text-slate-300">未訪問</dt>
          <dd className="mt-1 text-lg font-semibold">{progress.unvisited}</dd>
        </div>
        <div className="px-1">
          <dt className="text-xs text-slate-600 dark:text-slate-300">購入済み</dt>
          <dd className="mt-1 text-lg font-semibold">{progress.purchased}</dd>
        </div>
        <div className="px-1">
          <dt className="text-xs text-slate-600 dark:text-slate-300">売り切れ</dt>
          <dd className="mt-1 text-lg font-semibold">{progress.sold_out}</dd>
        </div>
        <div className="px-1">
          <dt className="text-xs text-slate-600 dark:text-slate-300">スキップ</dt>
          <dd className="mt-1 text-lg font-semibold">{progress.skipped}</dd>
        </div>
      </dl>
    </section>
  );
}
