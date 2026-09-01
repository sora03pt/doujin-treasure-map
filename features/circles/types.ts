import type { EventId } from "@/features/events/types";

export type CircleId = string;

export type CirclePriority = "must" | "want" | "if_time";

export type VisitStatus = "unvisited" | "purchased" | "sold_out" | "skipped";

export type Circle = {
  id: CircleId;
  eventId: EventId;
  userId: string;
  name: string;
  spaceNumber: string | null;
  xUrl: string | null;
  webUrl: string | null;
  memo: string | null;
  priority: CirclePriority;
  assignee: string | null;
  visitStatus: VisitStatus;
  createdAt: string;
  updatedAt: string;
};

export type CircleFormValues = {
  name: string;
  spaceNumber: string;
  priority: CirclePriority;
  visitStatus: VisitStatus;
  memo: string;
  assignee: string;
};

export type CircleFieldErrors = Partial<
  Record<keyof CircleFormValues, string>
>;

export type CircleFormState = {
  status: "idle" | "error";
  message: string;
  fieldErrors: CircleFieldErrors;
  values: CircleFormValues;
};

export type DeleteCircleState = {
  status: "idle" | "error";
  message: string;
};

export type QuickVisitStatusState = {
  status: "idle" | "success" | "error";
  message: string;
  visitStatus: VisitStatus;
};

export type ValidatedCircleInput = {
  name: string;
  spaceNumber: string | null;
  priority: CirclePriority;
  visitStatus: VisitStatus;
  memo: string | null;
  assignee: string | null;
};
