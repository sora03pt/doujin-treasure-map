import { calculateBudgetSummary } from "../budget/calculation.ts";
import {
  sortCirclesForEventDay,
  summarizeCircleItems,
  summarizeEventDay,
} from "../circles/event-day.ts";
import type { Circle } from "@/features/circles/types";
import type { Event } from "@/features/events/types";
import type { Item } from "@/features/items/types";
import {
  OFFLINE_SNAPSHOT_VERSION,
  type EventDaySnapshot,
  type StoredSnapshotRecord,
} from "./types.ts";

export const MAX_OFFLINE_EVENTS_PER_USER = 5;
export const OFFLINE_SNAPSHOT_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

const priorities = new Set(["must", "want", "if_time"]);
const visitStatuses = new Set([
  "unvisited",
  "purchased",
  "sold_out",
  "skipped",
]);

export function getSnapshotKey(userId: string, eventId: string) {
  return `${userId}:${eventId}`;
}

export function createEventDaySnapshot(
  userId: string,
  event: Event,
  circles: Circle[],
  items: Item[],
  savedAt = new Date().toISOString(),
): EventDaySnapshot {
  const itemsByCircle = new Map<string, Item[]>();

  items.forEach((item) => {
    const circleItems = itemsByCircle.get(item.circleId) ?? [];
    circleItems.push(item);
    itemsByCircle.set(item.circleId, circleItems);
  });

  return {
    version: OFFLINE_SNAPSHOT_VERSION,
    userId,
    event: {
      id: event.id,
      name: event.name,
      eventDate: event.eventDate,
      venue: event.venue,
      plannedBudget: event.plannedBudget,
    },
    circles: sortCirclesForEventDay(circles).map((circle) => {
      const circleItems = itemsByCircle.get(circle.id) ?? [];

      return {
        id: circle.id,
        name: circle.name,
        spaceNumber: circle.spaceNumber,
        priority: circle.priority,
        visitStatus: circle.visitStatus,
        assignee: circle.assignee,
        items: circleItems.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        totalAmount: summarizeCircleItems(circleItems).totalAmount,
      };
    }),
    budgetSummary: calculateBudgetSummary(
      event.plannedBudget,
      circles,
      items,
    ),
    progressSummary: summarizeEventDay(circles),
    savedAt,
  };
}

export function serializeSnapshot(snapshot: EventDaySnapshot) {
  return JSON.stringify(snapshot);
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isNullableInteger(value: unknown): value is number | null {
  return value === null || (Number.isInteger(value) && Number(value) >= 0);
}

function isInteger(value: unknown): value is number {
  return Number.isInteger(value);
}

function isValidSnapshot(value: unknown): value is EventDaySnapshot {
  if (!value || typeof value !== "object") {
    return false;
  }

  const snapshot = value as Partial<EventDaySnapshot>;

  if (
    snapshot.version !== OFFLINE_SNAPSHOT_VERSION ||
    typeof snapshot.userId !== "string" ||
    typeof snapshot.savedAt !== "string" ||
    !snapshot.event ||
    !snapshot.budgetSummary ||
    !snapshot.progressSummary ||
    !Array.isArray(snapshot.circles)
  ) {
    return false;
  }

  const event = snapshot.event;

  if (
    typeof event.id !== "string" ||
    typeof event.name !== "string" ||
    typeof event.eventDate !== "string" ||
    !isNullableString(event.venue) ||
    !isNullableInteger(event.plannedBudget)
  ) {
    return false;
  }

  const budget = snapshot.budgetSummary;
  const progress = snapshot.progressSummary;

  if (
    !isNullableInteger(budget.plannedBudget) ||
    !isInteger(budget.registeredTotal) ||
    budget.registeredTotal < 0 ||
    !isInteger(budget.purchasedTotal) ||
    budget.purchasedTotal < 0 ||
    (budget.remainingBudget !== null &&
      !isInteger(budget.remainingBudget)) ||
    !isInteger(progress.total) ||
    !isInteger(progress.handled) ||
    !isInteger(progress.unvisited) ||
    !isInteger(progress.purchased) ||
    !isInteger(progress.sold_out) ||
    !isInteger(progress.skipped)
  ) {
    return false;
  }

  return snapshot.circles.every(
    (circle) =>
      typeof circle.id === "string" &&
      typeof circle.name === "string" &&
      isNullableString(circle.spaceNumber) &&
      priorities.has(circle.priority) &&
      visitStatuses.has(circle.visitStatus) &&
      isNullableString(circle.assignee) &&
      Number.isInteger(circle.totalAmount) &&
      circle.totalAmount >= 0 &&
      Array.isArray(circle.items) &&
      circle.items.every(
        (item) =>
          typeof item.id === "string" &&
          typeof item.name === "string" &&
          isNullableInteger(item.price) &&
          Number.isInteger(item.quantity) &&
          item.quantity >= 1,
      ),
  );
}

export function restoreSnapshot(
  serialized: string,
  expectedUserId: string,
  expectedEventId: string,
  now = Date.now(),
): EventDaySnapshot | null {
  try {
    const value: unknown = JSON.parse(serialized);

    if (!isValidSnapshot(value)) {
      return null;
    }

    const savedAt = Date.parse(value.savedAt);

    if (
      value.userId !== expectedUserId ||
      value.event.id !== expectedEventId ||
      !Number.isFinite(savedAt) ||
      savedAt > now ||
      now - savedAt > OFFLINE_SNAPSHOT_MAX_AGE_MS
    ) {
      return null;
    }

    return value;
  } catch {
    return null;
  }
}

export function getRecordsToDelete(
  records: StoredSnapshotRecord[],
  userId: string,
  now = Date.now(),
) {
  const userRecords = records.filter((record) => record.userId === userId);
  const expiredRecords = userRecords.filter((record) => {
    const savedAt = Date.parse(record.savedAt);
    return (
      !Number.isFinite(savedAt) ||
      savedAt > now ||
      now - savedAt > OFFLINE_SNAPSHOT_MAX_AGE_MS
    );
  });
  const retainedCandidates = userRecords
    .filter((record) => !expiredRecords.includes(record))
    .sort((left, right) => Date.parse(right.savedAt) - Date.parse(left.savedAt));

  return [
    ...expiredRecords.map((record) => record.key),
    ...retainedCandidates
      .slice(MAX_OFFLINE_EVENTS_PER_USER)
      .map((record) => record.key),
  ];
}
