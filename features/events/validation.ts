import type {
  EventFieldErrors,
  EventFormValues,
  ValidatedEventInput,
} from "@/features/events/types";

const EVENT_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const NAME_MAX_LENGTH = 120;
const VENUE_MAX_LENGTH = 200;
const MEMO_MAX_LENGTH = 2000;

type EventValidationResult =
  | {
      ok: true;
      input: ValidatedEventInput;
      values: EventFormValues;
    }
  | {
      ok: false;
      fieldErrors: EventFieldErrors;
      values: EventFormValues;
    };

function readText(formData: FormData, name: string) {
  const value = formData.get(name);

  return typeof value === "string" ? value.trim() : "";
}

function isValidDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function isEventId(value: string) {
  return EVENT_ID_PATTERN.test(value);
}

export function validateEventForm(formData: FormData): EventValidationResult {
  const values: EventFormValues = {
    name: readText(formData, "name"),
    eventDate: readText(formData, "event_date"),
    venue: readText(formData, "venue"),
    memo: readText(formData, "memo"),
  };
  const fieldErrors: EventFieldErrors = {};

  if (!values.name) {
    fieldErrors.name = "イベント名を入力してください。";
  } else if (values.name.length > NAME_MAX_LENGTH) {
    fieldErrors.name = `イベント名は${NAME_MAX_LENGTH}文字以内で入力してください。`;
  }

  if (!values.eventDate) {
    fieldErrors.eventDate = "開催日を入力してください。";
  } else if (!isValidDate(values.eventDate)) {
    fieldErrors.eventDate = "開催日を正しい日付で入力してください。";
  }

  if (values.venue.length > VENUE_MAX_LENGTH) {
    fieldErrors.venue = `会場は${VENUE_MAX_LENGTH}文字以内で入力してください。`;
  }

  if (values.memo.length > MEMO_MAX_LENGTH) {
    fieldErrors.memo = `メモは${MEMO_MAX_LENGTH}文字以内で入力してください。`;
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors, values };
  }

  return {
    ok: true,
    input: {
      name: values.name,
      eventDate: values.eventDate,
      venue: values.venue || null,
      memo: values.memo || null,
    },
    values,
  };
}
