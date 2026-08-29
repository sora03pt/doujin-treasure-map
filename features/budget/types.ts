import type { Item } from "@/features/items/types";

export type BudgetSummary = {
  plannedAmount: number;
  purchasedAmount: number;
  remainingAmount: number;
};

export function summarizeBudget(
  plannedAmount: number,
  items: Item[],
): BudgetSummary {
  const purchasedAmount = items
    .filter((item) => item.purchased)
    .reduce((total, item) => total + (item.price ?? 0) * item.quantity, 0);

  return {
    plannedAmount,
    purchasedAmount,
    remainingAmount: plannedAmount - purchasedAmount,
  };
}
