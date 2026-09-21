import Link from "next/link";

import { priorityLabels } from "@/features/circles/display";
import type { RecommendedRouteGroup } from "@/features/circles/event-day";

type RecommendedRouteProps = {
  groups: RecommendedRouteGroup[];
};

export function RecommendedRoute({ groups }: RecommendedRouteProps) {
  const total = groups.reduce((count, group) => count + group.entries.length, 0);

  return (
    <section
      aria-labelledby="recommended-route-title"
      className="mt-5 border-y border-slate-300 py-4 dark:border-slate-700"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-lg font-semibold" id="recommended-route-title">
          おすすめ巡回順
        </h3>
        <span className="shrink-0 text-sm text-slate-600 dark:text-slate-300">
          未訪問 {total}件
        </span>
      </div>

      {groups.length === 0 ? (
        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
          現在の絞り込み条件に合う未訪問サークルはありません。
        </p>
      ) : (
        <div className="mt-3 space-y-4">
          {groups.map((group) => (
            <section
              aria-labelledby={`route-hall-${group.hall ?? "uncategorized"}`}
              key={group.hall ?? "uncategorized"}
            >
              <h4
                className="border-l-4 border-blue-600 pl-2 text-sm font-bold"
                id={`route-hall-${group.hall ?? "uncategorized"}`}
              >
                {group.label}
              </h4>
              <ol className="mt-1 divide-y divide-slate-200 dark:divide-slate-800">
                {group.entries.map(({ circle, position }) => (
                  <li key={circle.id}>
                    <Link
                      className="grid min-h-11 grid-cols-[2rem_minmax(3.5rem,auto)_1fr] items-center gap-2 py-2 text-sm hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:hover:bg-slate-900"
                      href={`#circle-${circle.id}`}
                    >
                      <span className="text-right font-bold tabular-nums">
                        {position}.
                      </span>
                      <span className="font-semibold">
                        {circle.spaceNumber ?? "未設定"}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">{circle.name}</span>
                        <span className="block text-xs text-slate-600 dark:text-slate-300">
                          {priorityLabels[circle.priority]}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      )}
    </section>
  );
}
