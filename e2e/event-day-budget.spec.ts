import type { Locator } from "@playwright/test";

import { expect, test } from "./fixtures";

async function ensureDetailsOpen(details: Locator) {
  if ((await details.getAttribute("open")) === null) {
    await details.locator(":scope > summary").click();
  }

  await expect(details).toHaveAttribute("open", "");
}

test("Circle・Item CRUD、filter、quick update、Budgetを連携できる", async ({
  e2ePrefix,
  loginAsTestUser,
  normalUserClient,
  page,
  seedEvent,
}) => {
  const event = await seedEvent({ plannedBudget: 5_000 });
  const circleName = `${e2ePrefix}Circle A`;
  const editedCircleName = `${circleName} edited`;
  const secondCircleName = `${e2ePrefix}Circle B`;
  const itemName = `${e2ePrefix}Item`;
  const editedItemName = `${itemName} edited`;
  const {
    data: { user },
  } = await normalUserClient.auth.getUser();

  if (!user) {
    throw new Error("E2E user is unavailable.");
  }

  const secondCircle = await normalUserClient
    .from("circles")
    .insert({
      event_id: event.id,
      user_id: user.id,
      name: secondCircleName,
      priority: "want",
      visit_status: "unvisited",
      space_number: "A10",
    })
    .select("id")
    .single();

  if (secondCircle.error) {
    throw new Error(
      `E2E second circle seed failed with code ${secondCircle.error.code}.`,
    );
  }

  await loginAsTestUser();
  await page.goto(`/events/${event.id}`);
  const addCircleDetails = page
    .locator("details")
    .filter({ hasText: "サークルを追加" });
  await ensureDetailsOpen(addCircleDetails);
  await addCircleDetails.getByLabel(/サークル名/).fill(circleName);
  await addCircleDetails.getByLabel(/スペース番号/).fill("A2");
  await addCircleDetails.getByLabel("優先度").selectOption("must");
  await addCircleDetails
    .getByRole("button", { name: "サークルを保存" })
    .click();

  await expect(page.getByText(circleName, { exact: true })).toBeVisible();
  let circleCard = page.locator("li").filter({ hasText: circleName });
  let managementDetails = circleCard
    .locator("details")
    .filter({ hasText: "編集・頒布物管理" });
  await ensureDetailsOpen(managementDetails);
  await circleCard.getByLabel(/サークル名/).fill(editedCircleName);
  await circleCard.getByRole("button", { name: "サークルを更新" }).click();

  await expect(page.getByText(editedCircleName, { exact: true })).toBeVisible();
  circleCard = page.locator("li").filter({ hasText: editedCircleName });
  managementDetails = circleCard
    .locator("details")
    .filter({ hasText: "編集・頒布物管理" });
  await ensureDetailsOpen(managementDetails);
  const addItemDetails = circleCard
    .locator("details")
    .filter({ hasText: "頒布物を追加" })
    .last();
  await ensureDetailsOpen(addItemDetails);
  await circleCard.getByLabel(/頒布物名/).fill(itemName);
  await circleCard.getByLabel(/価格/).fill("500");
  await circleCard.getByLabel(/数量/).fill("3");
  await circleCard.getByRole("button", { name: "頒布物を保存" }).click();

  const budgetSummary = page.locator("section").filter({
    has: page.getByRole("heading", { name: "予算サマリー" }),
  });
  await expect(
    budgetSummary.getByText("¥1,500", { exact: true }),
  ).toBeVisible();
  await expect(
    budgetSummary.getByText("¥0", { exact: true }),
  ).toBeVisible();

  circleCard = page.locator("li").filter({ hasText: editedCircleName });
  await circleCard.getByRole("button", { name: "購入済み" }).click();
  await expect(circleCard.getByText("訪問状態: 購入済み")).toBeVisible();
  await expect(
    budgetSummary.getByText("¥3,500", { exact: true }),
  ).toBeVisible();

  const statusFilters = page.getByRole("navigation", {
    name: "訪問状態で絞り込む",
  });
  await statusFilters.getByRole("link", { name: "購入済み" }).click();
  await expect(page).toHaveURL(
    new RegExp(`/events/${event.id}\\?status=purchased#circles$`),
  );
  await expect(page.getByText(editedCircleName, { exact: true })).toBeVisible();
  await expect(page.getByText(secondCircleName, { exact: true })).toHaveCount(0);

  await statusFilters.getByRole("link", { name: "未訪問" }).click();
  await expect(page).toHaveURL(
    new RegExp(`/events/${event.id}\\?status=unvisited#circles$`),
  );
  await expect(page.getByText(secondCircleName, { exact: true })).toBeVisible();
  await expect(page.getByText(editedCircleName, { exact: true })).toHaveCount(0);

  await statusFilters.getByRole("link", { name: "すべて" }).click();
  await expect(page).toHaveURL(new RegExp(`/events/${event.id}#circles$`));
  const priorityFilters = page.getByRole("navigation", {
    name: "優先度で絞り込む",
  });
  await priorityFilters.getByRole("link", { name: "最優先" }).click();
  await expect(page).toHaveURL(
    new RegExp(`/events/${event.id}\\?priority=must#circles$`),
  );
  await expect(page.getByText(editedCircleName, { exact: true })).toBeVisible();
  await expect(page.getByText(secondCircleName, { exact: true })).toHaveCount(0);
  await priorityFilters.getByRole("link", { name: "すべて" }).click();
  await expect(page).toHaveURL(new RegExp(`/events/${event.id}#circles$`));

  circleCard = page.locator("li").filter({ hasText: editedCircleName });
  managementDetails = circleCard
    .locator("details")
    .filter({ hasText: "編集・頒布物管理" });
  await ensureDetailsOpen(managementDetails);
  const itemRow = circleCard.locator("li").filter({ hasText: itemName });
  const editItemDetails = itemRow
    .locator("details")
    .filter({ hasText: "頒布物を編集" });
  await ensureDetailsOpen(editItemDetails);
  await itemRow.getByLabel(/頒布物名/).fill(editedItemName);
  await itemRow.getByLabel(/価格/).fill("600");
  await itemRow.getByLabel(/数量/).fill("2");
  await itemRow.getByRole("button", { name: "頒布物を更新" }).click();

  await expect(
    budgetSummary.getByText("¥1,200", { exact: true }),
  ).toHaveCount(2);
  await expect(
    budgetSummary.getByText("¥3,800", { exact: true }),
  ).toBeVisible();

  circleCard = page.locator("li").filter({ hasText: editedCircleName });
  managementDetails = circleCard
    .locator("details")
    .filter({ hasText: "編集・頒布物管理" });
  await ensureDetailsOpen(managementDetails);
  const editedItemRow = circleCard
    .locator("li")
    .filter({ hasText: editedItemName });
  await editedItemRow.getByRole("button", { name: "頒布物を削除" }).click();
  await page
    .getByRole("dialog", { name: "頒布物を削除しますか？" })
    .getByRole("button", { name: "削除する" })
    .click();
  await expect(page.getByText(editedItemName, { exact: true })).toHaveCount(0);

  circleCard = page.locator("li").filter({ hasText: editedCircleName });
  managementDetails = circleCard
    .locator("details")
    .filter({ hasText: "編集・頒布物管理" });
  await ensureDetailsOpen(managementDetails);
  await circleCard.getByRole("button", { name: "サークルを削除" }).click();
  await page
    .getByRole("dialog", { name: "サークルを削除しますか？" })
    .getByRole("button", { name: "削除する" })
    .click();
  await expect(page.getByText(editedCircleName, { exact: true })).toHaveCount(0);
});
