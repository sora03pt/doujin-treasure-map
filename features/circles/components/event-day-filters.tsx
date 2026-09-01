import Link from "next/link";

import {
  priorityOptions,
  visitStatusOptions,
} from "@/features/circles/display";
import type {
  EventDayFilters,
  PriorityFilter,
  VisitStatusFilter,
} from "@/features/circles/event-day";

type EventDayFiltersProps = {
  eventId: string;
  filters: EventDayFilters;
  resultCount: number;
  totalCount: number;
};

const filterLinkClassName =
  "flex min-h-11 shrink-0 items-center justify-center rounded-lg border px-3 text-sm font-semibold transition focus-visible:z-10";

export function EventDayFilters({
  eventId,
  filters,
  resultCount,
  totalCount,
}: EventDayFiltersProps) {
  function buildHref(
    visitStatus: VisitStatusFilter,
    priority: PriorityFilter,
  ) {
    const params = new URLSearchParams();

    if (visitStatus !== "all") {
      params.set("status", visitStatus);
    }

    if (priority !== "all") {
      params.set("priority", priority);
    }

    const query = params.toString();
    return `/events/${eventId}${query ? `?${query}` : ""}#circles`;
  }

  return (
    <section aria-labelledby="event-day-filter-title" className="mt-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold" id="event-day-filter-title">
          絞り込み
        </h3>
        <p
          aria-live="polite"
          className="text-sm text-slate-600 dark:text-slate-300"
          role="status"
        >
          {resultCount} / {totalCount}件
        </p>
      </div>

      <nav aria-label="訪問状態で絞り込む" className="mt-3">
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
          訪問状態
        </p>
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {[
            { value: "all" as const, label: "すべて" },
            ...visitStatusOptions,
          ].map(({ value, label }) => {
            const isSelected = filters.visitStatus === value;

            return (
              <Link
                aria-current={isSelected ? "page" : undefined}
                className={`${filterLinkClassName} ${
                  isSelected
                    ? "border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950"
                    : "border-slate-300 bg-white text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                }`}
                href={buildHref(value, filters.priority)}
                key={value}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </nav>

      <nav aria-label="優先度で絞り込む" className="mt-3">
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
          優先度
        </p>
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {[
            { value: "all" as const, label: "すべて" },
            ...priorityOptions,
          ].map(({ value, label }) => {
            const isSelected = filters.priority === value;

            return (
              <Link
                aria-current={isSelected ? "page" : undefined}
                className={`${filterLinkClassName} ${
                  isSelected
                    ? "border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950"
                    : "border-slate-300 bg-white text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                }`}
                href={buildHref(filters.visitStatus, value)}
                key={value}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </section>
  );
}
