import type { EventId } from "@/features/events/types";

export type CircleId = string;

export type CirclePriority = "must_go" | "want_to_go" | "if_time";

export type VisitStatus = "not_visited" | "purchased" | "sold_out" | "skipped";

export type Circle = {
  id: CircleId;
  eventId: EventId;
  userId: string;
  name: string;
  spaceNumber: string;
  xUrl: string | null;
  webUrl: string | null;
  memo: string | null;
  priority: CirclePriority;
  assignee: string | null;
  visitStatus: VisitStatus;
  createdAt: string;
  updatedAt: string;
};
