import { createCircle } from "@/features/circles/actions";
import {
  CircleForm,
  emptyCircleFormValues,
} from "@/features/circles/components/circle-form";
import { EventDayCircleCard } from "@/features/circles/components/event-day-circle-card";
import { EventDayFilters } from "@/features/circles/components/event-day-filters";
import { RecommendedRoute } from "@/features/circles/components/recommended-route";
import {
  buildRecommendedRoute,
  filterCirclesForEventDay,
  sortCirclesForEventDay,
  type EventDayFilters as EventDayFilterValues,
} from "@/features/circles/event-day";
import type { Circle } from "@/features/circles/types";
import type { Item } from "@/features/items/types";

type CircleListProps = {
  eventId: string;
  eventHalls: string[];
  circles: Circle[];
  filters: EventDayFilterValues;
  items: Item[];
};

export function CircleList({
  eventId,
  eventHalls,
  circles,
  filters,
  items,
}: CircleListProps) {
  const createCircleForEvent = createCircle.bind(null, eventId);
  const displayedCircles = sortCirclesForEventDay(
    filterCirclesForEventDay(circles, filters),
  );
  const itemsByCircle = new Map<string, Item[]>();
  const recommendedRoute = buildRecommendedRoute(circles, eventHalls, filters);

  items.forEach((item) => {
    const circleItems = itemsByCircle.get(item.circleId) ?? [];
    circleItems.push(item);
    itemsByCircle.set(item.circleId, circleItems);
  });

  return (
    <section aria-labelledby="circles-title" id="circles">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Circle
          </p>
          <h2 className="mt-1 text-2xl font-semibold" id="circles-title">
            当日のサークル一覧
          </h2>
        </div>
        <span className="shrink-0 text-sm text-slate-600 dark:text-slate-300">
          全{circles.length}件
        </span>
      </div>

      {circles.length > 0 ? (
        <>
          <EventDayFilters
            eventId={eventId}
            filters={filters}
            resultCount={displayedCircles.length}
            totalCount={circles.length}
          />
          <RecommendedRoute groups={recommendedRoute} />
        </>
      ) : null}

      <details className="group mt-4">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 [&::-webkit-details-marker]:hidden">
          サークルを追加
        </summary>
        <div className="mt-4 border-l-2 border-blue-500 pl-3 sm:pl-4">
          <CircleForm
            action={createCircleForEvent}
            availableHalls={eventHalls}
            initialValues={emptyCircleFormValues}
            submitLabel="サークルを保存"
          />
        </div>
      </details>

      {circles.length === 0 ? (
        <div className="mt-5 border-y border-slate-200 py-8 text-center dark:border-slate-800">
          <h3 className="font-semibold">サークルはまだ登録されていません</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            公式配置図を参照しながら、行きたいサークルを登録できます。
          </p>
        </div>
      ) : displayedCircles.length === 0 ? (
        <div className="mt-5 border-y border-slate-200 py-8 text-center dark:border-slate-800">
          <h3 className="font-semibold">条件に合うサークルはありません</h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            絞り込み条件を変更してください。
          </p>
        </div>
      ) : (
        <ol className="mt-5 space-y-3">
          {displayedCircles.map((circle) => (
            <EventDayCircleCard
              circle={circle}
              eventId={eventId}
              eventHalls={eventHalls}
              items={itemsByCircle.get(circle.id) ?? []}
              key={circle.id}
            />
          ))}
        </ol>
      )}
    </section>
  );
}
