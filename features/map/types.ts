import type { CircleId } from "@/features/circles/types";
import type { EventId } from "@/features/events/types";

export type MapAssetId = string;

export type MapAsset = {
  id: MapAssetId;
  eventId: EventId;
  userId: string;
  filePath: string;
  width: number | null;
  height: number | null;
  createdAt: string;
};

export type MapPin = {
  id: string;
  mapAssetId: MapAssetId;
  circleId: CircleId;
  x: number;
  y: number;
};
