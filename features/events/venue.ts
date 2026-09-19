export const VENUE_PRESETS = [
  "東京ビッグサイト",
  "インテックス大阪",
  "マリンメッセ福岡",
] as const;

export type VenuePreset = (typeof VENUE_PRESETS)[number] | "other";

export function getVenueFormSelection(venue: string | null | undefined): {
  preset: VenuePreset;
  custom: string;
} {
  if (venue && VENUE_PRESETS.includes(venue as (typeof VENUE_PRESETS)[number])) {
    return { preset: venue as VenuePreset, custom: "" };
  }

  return { preset: "other", custom: venue ?? "" };
}

export function resolveVenue(preset: string, custom: string) {
  if (VENUE_PRESETS.includes(preset as (typeof VENUE_PRESETS)[number])) {
    return preset;
  }

  return preset === "other" ? custom.trim() : null;
}
