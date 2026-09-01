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
  return [...circles].sort((left, right) => {
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
  });
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
