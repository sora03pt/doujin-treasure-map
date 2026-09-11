import {
  priorityLabels,
  visitStatusLabels,
} from "@/features/circles/display";
import { formatYen } from "@/features/budget/format";
import type { EventDaySnapshot } from "@/features/offline/types";

const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

const savedAtFormatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function OfflineEventDayView({
  snapshot,
}: {
  snapshot: EventDaySnapshot;
}) {
  const budget = snapshot.budgetSummary;
  const progress = snapshot.progressSummary;
  const isOverBudget =
    budget.remainingBudget !== null && budget.remainingBudget < 0;

  return (
    <div>
      <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
        オフラインデータ
      </p>
      <h1 className="mt-1 break-words text-3xl font-semibold">
        {snapshot.event.name}
      </h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        最終更新: {savedAtFormatter.format(new Date(snapshot.savedAt))}
      </p>

      <dl className="mt-4 grid gap-3 border-y border-slate-300 py-4 text-sm sm:grid-cols-2 dark:border-slate-700">
        <div>
          <dt className="font-semibold">開催日</dt>
          <dd className="mt-1">
            {dateFormatter.format(
              new Date(`${snapshot.event.eventDate}T00:00:00Z`),
            )}
          </dd>
        </div>
        <div>
          <dt className="font-semibold">会場</dt>
          <dd className="mt-1">{snapshot.event.venue ?? "未設定"}</dd>
        </div>
      </dl>

      <section aria-labelledby="offline-budget-title" className="py-5">
        <h2 className="text-xl font-semibold" id="offline-budget-title">
          予算サマリー
        </h2>
        {isOverBudget ? (
          <p className="mt-1 font-semibold text-red-700 dark:text-red-300">
            予算超過
          </p>
        ) : null}
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <div>
            <dt className="text-slate-600 dark:text-slate-300">予定予算</dt>
            <dd className="mt-1 font-semibold">
              {budget.plannedBudget === null
                ? "未設定"
                : formatYen(budget.plannedBudget)}
            </dd>
          </div>
          <div>
            <dt className="text-slate-600 dark:text-slate-300">登録総額</dt>
            <dd className="mt-1 font-semibold">
              {formatYen(budget.registeredTotal)}
            </dd>
          </div>
          <div>
            <dt className="text-slate-600 dark:text-slate-300">購入済み</dt>
            <dd className="mt-1 font-semibold">
              {formatYen(budget.purchasedTotal)}
            </dd>
          </div>
          <div>
            <dt className="text-slate-600 dark:text-slate-300">残予算</dt>
            <dd className="mt-1 font-semibold">
              {budget.remainingBudget === null
                ? "未設定"
                : formatYen(budget.remainingBudget)}
            </dd>
          </div>
        </dl>
      </section>

      <section
        aria-labelledby="offline-progress-title"
        className="border-y border-slate-300 py-5 dark:border-slate-700"
      >
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-xl font-semibold" id="offline-progress-title">
            当日の進捗
          </h2>
          <p className="text-sm font-semibold">
            対応済み {progress.handled} / {progress.total}
          </p>
        </div>
        <dl className="mt-3 grid grid-cols-4 text-center text-xs">
          <div>
            <dt>未訪問</dt>
            <dd className="mt-1 text-lg font-semibold">{progress.unvisited}</dd>
          </div>
          <div>
            <dt>購入済み</dt>
            <dd className="mt-1 text-lg font-semibold">{progress.purchased}</dd>
          </div>
          <div>
            <dt>売り切れ</dt>
            <dd className="mt-1 text-lg font-semibold">{progress.sold_out}</dd>
          </div>
          <div>
            <dt>スキップ</dt>
            <dd className="mt-1 text-lg font-semibold">{progress.skipped}</dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="offline-circles-title" className="py-5">
        <h2 className="text-2xl font-semibold" id="offline-circles-title">
          当日のサークル一覧
        </h2>
        {snapshot.circles.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
            サークルは登録されていません。
          </p>
        ) : (
          <ol className="mt-4 space-y-3">
            {snapshot.circles.map((circle) => (
              <li
                className="rounded-lg border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
                key={circle.id}
              >
                <div className="flex gap-3">
                  <div className="w-20 shrink-0 border-r border-slate-200 pr-3 dark:border-slate-700">
                    <p className="text-xs font-semibold text-slate-500">SPACE</p>
                    <p className="mt-1 break-words text-lg font-bold">
                      {circle.spaceNumber ?? "未設定"}
                    </p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="break-words text-lg font-semibold">
                      {circle.name}
                    </h3>
                    <p className="mt-1 text-sm">担当: {circle.assignee ?? "未設定"}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm font-medium">
                  優先度: {priorityLabels[circle.priority]} / 訪問状態:{" "}
                  {visitStatusLabels[circle.visitStatus]}
                </p>
                <div className="mt-3 border-t border-slate-200 pt-3 dark:border-slate-700">
                  <p className="text-sm font-semibold">
                    頒布物 {circle.items.length}件 / 合計{" "}
                    {formatYen(circle.totalAmount)}
                  </p>
                  {circle.items.length > 0 ? (
                    <ul className="mt-2 space-y-1 text-sm">
                      {circle.items.map((item) => (
                        <li className="flex justify-between gap-3" key={item.id}>
                          <span className="break-words">{item.name}</span>
                          <span className="shrink-0">
                            {item.price === null
                              ? "価格未設定"
                              : formatYen(item.price)}{" "}
                            × {item.quantity}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
