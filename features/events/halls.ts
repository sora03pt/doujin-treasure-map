export const TOKYO_BIG_SIGHT_HALLS = [
  "東1",
  "東2",
  "東3",
  "東4",
  "東5",
  "東6",
  "東7",
  "東8",
  "西1",
  "西2",
  "西3",
  "西4",
  "南1",
  "南2",
  "南3",
  "南4",
] as const;

const venueHalls: Readonly<Record<string, readonly string[]>> = {
  "東京ビッグサイト": TOKYO_BIG_SIGHT_HALLS,
};

export function getHallOptionsForVenue(venue: string | null) {
  if (!venue || !Object.hasOwn(venueHalls, venue)) {
    return [];
  }

  return [...(venueHalls[venue as keyof typeof venueHalls] ?? [])];
}

export function normalizeEventHalls(
  venue: string | null,
  selectedHalls: readonly string[],
) {
  const selected = new Set(selectedHalls);
  return getHallOptionsForVenue(venue).filter((hall) => selected.has(hall));
}

export function hasOnlyAllowedEventHalls(
  venue: string | null,
  selectedHalls: readonly string[],
) {
  const allowed = new Set(getHallOptionsForVenue(venue));
  return selectedHalls.every((hall) => allowed.has(hall));
}
