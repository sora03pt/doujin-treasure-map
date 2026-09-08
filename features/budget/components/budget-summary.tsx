import { calculateBudgetSummary } from "@/features/budget/calculation";
import { formatYen } from "@/features/budget/format";
import type { Circle } from "@/features/circles/types";
import type { Item } from "@/features/items/types";

type BudgetSummaryProps = {
  plannedBudget: number | null;
  circles: Circle[];
  items: Item[];
};

export function BudgetSummary({
  plannedBudget,
  circles,
  items,
}: BudgetSummaryProps) {
  const summary = calculateBudgetSummary(plannedBudget, circles, items);
  const isOverBudget =
    summary.remainingBudget !== null && summary.remainingBudget < 0;

  return (
    <section
      aria-labelledby="budget-summary-title"
      className="border-b border-slate-300 py-5 dark:border-slate-700"
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Budget
          </p>
          <h2 className="mt-1 text-xl font-semibold" id="budget-summary-title">
            予算サマリー
          </h2>
        </div>
        {isOverBudget ? (
          <p className="shrink-0 text-sm font-semibold text-red-700 dark:text-red-300">
            予算超過
          </p>
        ) : null}
      </div>

      <dl className="mt-4 grid grid-cols-2 overflow-hidden rounded-lg border border-slate-300 bg-slate-300 dark:border-slate-700 dark:bg-slate-700">
        <div className="bg-white p-3 dark:bg-slate-900">
          <dt className="text-xs text-slate-600 dark:text-slate-300">予定予算</dt>
          <dd className="mt-1 text-lg font-semibold">
            {summary.plannedBudget === null
              ? "未設定"
              : formatYen(summary.plannedBudget)}
          </dd>
        </div>
        <div className="border-l border-slate-300 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
          <dt className="text-xs text-slate-600 dark:text-slate-300">
            登録済みItem総額
          </dt>
          <dd className="mt-1 text-lg font-semibold">
            {formatYen(summary.registeredTotal)}
          </dd>
        </div>
        <div className="border-t border-slate-300 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
          <dt className="text-xs text-slate-600 dark:text-slate-300">
            購入済み総額
          </dt>
          <dd className="mt-1 text-lg font-semibold">
            {formatYen(summary.purchasedTotal)}
          </dd>
        </div>
        <div className="border-l border-t border-slate-300 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
          <dt className="text-xs text-slate-600 dark:text-slate-300">残予算</dt>
          <dd
            className={`mt-1 text-lg font-semibold ${
              isOverBudget ? "text-red-700 dark:text-red-300" : ""
            }`}
          >
            {summary.remainingBudget === null
              ? "未設定"
              : formatYen(summary.remainingBudget)}
          </dd>
        </div>
      </dl>
    </section>
  );
}
