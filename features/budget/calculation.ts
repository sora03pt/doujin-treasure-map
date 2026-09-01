import type { BudgetSummary } from "@/features/budget/types";
import type { Circle } from "@/features/circles/types";
import type { Item } from "@/features/items/types";

type BudgetCircle = Pick<Circle, "id" | "visitStatus">;
type BudgetItem = Pick<Item, "circleId" | "price" | "quantity">;

export function calculateBudgetSummary(
  plannedBudget: number | null,
  circles: BudgetCircle[],
  items: BudgetItem[],
): BudgetSummary {
  const circleStatuses = new Map(
    circles.map((circle) => [circle.id, circle.visitStatus]),
  );
  let registeredTotal = 0;
  let purchasedTotal = 0;

  items.forEach((item) => {
    const visitStatus = circleStatuses.get(item.circleId);

    if (!visitStatus || item.price === null) {
      return;
    }

    const subtotal = item.price * item.quantity;
    registeredTotal += subtotal;

    if (visitStatus === "purchased") {
      purchasedTotal += subtotal;
    }
  });

  return {
    plannedBudget,
    registeredTotal,
    purchasedTotal,
    remainingBudget:
      plannedBudget === null ? null : plannedBudget - purchasedTotal,
  };
}
