import type { BudgetSummary } from "@/features/budget/types";
import type {
  CirclePriority,
  VisitStatus,
} from "@/features/circles/types";
import type { EventDayProgress } from "@/features/circles/event-day";

export const OFFLINE_SNAPSHOT_VERSION = 1 as const;

export type OfflineEvent = {
  id: string;
  name: string;
  eventDate: string;
  venue: string | null;
  plannedBudget: number | null;
};

export type OfflineItem = {
  id: string;
  name: string;
  price: number | null;
  quantity: number;
};

export type OfflineCircle = {
  id: string;
  name: string;
  spaceNumber: string | null;
  priority: CirclePriority;
  visitStatus: VisitStatus;
  assignee: string | null;
  items: OfflineItem[];
  totalAmount: number;
};

export type EventDaySnapshot = {
  version: typeof OFFLINE_SNAPSHOT_VERSION;
  userId: string;
  event: OfflineEvent;
  circles: OfflineCircle[];
  budgetSummary: BudgetSummary;
  progressSummary: EventDayProgress;
  savedAt: string;
};

export type StoredSnapshotRecord = {
  key: string;
  userId: string;
  eventId: string;
  savedAt: string;
  serialized: string;
};

export type ConnectivityState = "online" | "offline" | "checking";
