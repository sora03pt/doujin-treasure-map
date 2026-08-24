import type { CircleId } from "@/features/circles/types";

export type ItemId = string;

export type Item = {
  id: ItemId;
  circleId: CircleId;
  userId: string;
  name: string;
  price: number;
  quantity: number;
  memo: string | null;
  purchased: boolean;
  createdAt: string;
  updatedAt: string;
};
