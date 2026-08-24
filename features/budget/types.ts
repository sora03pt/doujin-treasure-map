import type { Event } from "@/features/events/types";
import type { Item } from "@/features/items/types";

export type BudgetSummary = {
  plannedAmount: number;
  purchasedAmount: number;
  remainingAmount: number;
};

export function summarizeBudget(event: Event, items: Item[]): BudgetSummary {
  const plannedAmount = event.plannedBudget ?? 0;
  const purchasedAmount = items
    .filter((item) => item.purchased)
    .reduce((total, item) => total + item.price * item.quantity, 0);

  return {
    plannedAmount,
    purchasedAmount,
    remainingAmount: plannedAmount - purchasedAmount,
  };
}
