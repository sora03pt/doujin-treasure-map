import type { CircleId } from "@/features/circles/types";

export type ItemId = string;

export type Item = {
  id: ItemId;
  circleId: CircleId;
  userId: string;
  name: string;
  imagePath: string | null;
  imageUrl: string | null;
  price: number | null;
  quantity: number;
  memo: string | null;
  purchased: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ItemFormValues = {
  name: string;
  price: string;
  quantity: string;
  memo: string;
};

export type ItemFieldErrors = Partial<Record<keyof ItemFormValues, string>>;

export type ItemFormState = {
  status: "idle" | "error";
  message: string;
  fieldErrors: ItemFieldErrors;
  values: ItemFormValues;
};

export type DeleteItemState = {
  status: "idle" | "error";
  message: string;
};

export type ReferenceImageActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export type ValidatedItemInput = {
  name: string;
  price: number | null;
  quantity: number;
  memo: string | null;
};
