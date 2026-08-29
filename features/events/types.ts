export type EventId = string;

export type Event = {
  id: EventId;
  userId: string;
  name: string;
  eventDate: string;
  venue: string | null;
  memo: string | null;
  createdAt: string;
  updatedAt: string;
};

export type EventSummary = Pick<
  Event,
  "id" | "name" | "eventDate" | "venue"
>;

export type EventFormValues = {
  name: string;
  eventDate: string;
  venue: string;
  memo: string;
};

export type EventFieldErrors = Partial<
  Record<keyof EventFormValues, string>
>;

export type EventFormState = {
  status: "idle" | "error";
  message: string;
  fieldErrors: EventFieldErrors;
  values: EventFormValues;
};

export type DeleteEventState = {
  status: "idle" | "error";
  message: string;
};

export type ValidatedEventInput = {
  name: string;
  eventDate: string;
  venue: string | null;
  memo: string | null;
};
