import type {
  Circle,
  CirclePriority,
  VisitStatus,
} from "@/features/circles/types";
import type { Item } from "@/features/items/types";

export type VisitStatusFilter = "all" | VisitStatus;
export type PriorityFilter = "all" | CirclePriority;

export type EventDayFilters = {
  visitStatus: VisitStatusFilter;
  priority: PriorityFilter;
};

export type EventDayProgress = Record<VisitStatus, number> & {
  total: number;
  handled: number;
};

export type RecommendedRouteEntry = {
  circle: Circle;
  position: number;
};

export type RecommendedRouteGroup = {
  hall: string | null;
  label: string;
  entries: RecommendedRouteEntry[];
};

const priorityOrder: Record<CirclePriority, number> = {
  must: 0,
  want: 1,
  if_time: 2,
};

const visitStatusValues: VisitStatus[] = [
  "unvisited",
  "purchased",
  "sold_out",
  "skipped",
];

const priorityValues: CirclePriority[] = ["must", "want", "if_time"];

const spaceNumberCollator = new Intl.Collator("ja-JP", {
  numeric: true,
  sensitivity: "base",
});

function compareByPriorityAndSpace(left: Circle, right: Circle) {
  const priorityDifference =
    priorityOrder[left.priority] - priorityOrder[right.priority];

  if (priorityDifference !== 0) {
    return priorityDifference;
  }

  if (left.spaceNumber && right.spaceNumber) {
    const spaceDifference = spaceNumberCollator.compare(
      left.spaceNumber,
      right.spaceNumber,
    );

    if (spaceDifference !== 0) {
      return spaceDifference;
    }
  } else if (left.spaceNumber) {
    return -1;
  } else if (right.spaceNumber) {
    return 1;
  }

  return spaceNumberCollator.compare(left.name, right.name);
}

function firstQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function parseEventDayFilters(query: {
  status?: string | string[];
  priority?: string | string[];
}): EventDayFilters {
  const visitStatus = firstQueryValue(query.status);
  const priority = firstQueryValue(query.priority);

  return {
    visitStatus: visitStatusValues.includes(visitStatus as VisitStatus)
      ? (visitStatus as VisitStatus)
      : "all",
    priority: priorityValues.includes(priority as CirclePriority)
      ? (priority as CirclePriority)
      : "all",
  };
}

export function sortCirclesForEventDay(circles: Circle[]) {
  return [...circles].sort(compareByPriorityAndSpace);
}

export function buildRecommendedRoute(
  circles: Circle[],
  eventHalls: readonly string[],
  filters: EventDayFilters,
): RecommendedRouteGroup[] {
  const hallOrder = new Map(
    [...new Set(eventHalls)].map((hall, index) => [hall, index]),
  );
  const unclassifiedIndex = hallOrder.size;
  const routeCircles = filterCirclesForEventDay(circles, filters)
    .filter((circle) => circle.visitStatus === "unvisited")
    .sort((left, right) => {
      const leftHall = left.hall && hallOrder.has(left.hall) ? left.hall : null;
      const rightHall =
        right.hall && hallOrder.has(right.hall) ? right.hall : null;
      const hallDifference =
        (leftHall === null
          ? unclassifiedIndex
          : hallOrder.get(leftHall) ?? unclassifiedIndex) -
        (rightHall === null
          ? unclassifiedIndex
          : hallOrder.get(rightHall) ?? unclassifiedIndex);

      return hallDifference || compareByPriorityAndSpace(left, right);
    });
  const groups: RecommendedRouteGroup[] = [];

  routeCircles.forEach((circle, index) => {
    const hall = circle.hall && hallOrder.has(circle.hall) ? circle.hall : null;
    const previousGroup = groups.at(-1);
    const entry = { circle, position: index + 1 };

    if (previousGroup?.hall === hall) {
      previousGroup.entries.push(entry);
      return;
    }

    groups.push({
      hall,
      label: hall ?? "未分類",
      entries: [entry],
    });
  });

  return groups;
}

export function filterCirclesForEventDay(
  circles: Circle[],
  filters: EventDayFilters,
) {
  return circles.filter((circle) => {
    const matchesVisitStatus =
      filters.visitStatus === "all" ||
      circle.visitStatus === filters.visitStatus;
    const matchesPriority =
      filters.priority === "all" || circle.priority === filters.priority;

    return matchesVisitStatus && matchesPriority;
  });
}

export function summarizeEventDay(circles: Circle[]): EventDayProgress {
  const progress: EventDayProgress = {
    total: circles.length,
    handled: 0,
    unvisited: 0,
    purchased: 0,
    sold_out: 0,
    skipped: 0,
  };

  circles.forEach((circle) => {
    progress[circle.visitStatus] += 1;
  });
  progress.handled = progress.total - progress.unvisited;

  return progress;
}

export function summarizeCircleItems(items: Item[]) {
  const pricedItems = items.filter((item) => item.price !== null);
  const totalAmount = pricedItems.reduce(
    (total, item) => total + (item.price ?? 0) * item.quantity,
    0,
  );

  return {
    itemCount: items.length,
    pricedItemCount: pricedItems.length,
    totalAmount,
    names: items.slice(0, 3).map((item) => item.name),
    remainingCount: Math.max(items.length - 3, 0),
  };
}
