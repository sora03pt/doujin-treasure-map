export type EventId = string;

export type Event = {
  id: EventId;
  userId: string;
  name: string;
  eventDate: string;
  venue: string | null;
  memo: string | null;
  plannedBudget: number | null;
  createdAt: string;
  updatedAt: string;
};
