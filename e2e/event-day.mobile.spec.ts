import { expectNoSeriousAccessibilityViolations } from "./accessibility";
import { expect, test } from "./fixtures";

test("mobile Event-day画面が横にはみ出さず主要操作を確保する", async ({
  loginAsTestUser,
  normalUserClient,
  page,
  seedEvent,
}) => {
  const event = await seedEvent({ plannedBudget: 8_000 });
  const {
    data: { user },
  } = await normalUserClient.auth.getUser();

  if (!user) {
    throw new Error("E2E user is unavailable.");
  }

  const circle = await normalUserClient
    .from("circles")
    .insert({
      event_id: event.id,
      user_id: user.id,
      name: "Mobile E2E Circle",
      priority: "must",
      visit_status: "unvisited",
      space_number: "A01",
    })
    .select("id")
    .single();

  if (circle.error || !circle.data) {
    throw new Error(`Mobile circle seed failed with code ${circle.error?.code}.`);
  }

  const item = await normalUserClient.from("items").insert({
    circle_id: circle.data.id,
    user_id: user.id,
    name: "Mobile E2E Item",
    price: 1_000,
    quantity: 2,
  });

  if (item.error) {
    throw new Error(`Mobile item seed failed with code ${item.error.code}.`);
  }

  await loginAsTestUser();
  await page.goto(`/events/${event.id}`);

  await expect(page.getByRole("heading", { name: "予算サマリー" })).toBeVisible();
  await expect(page.getByText("Mobile E2E Circle", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "購入済み" })).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);

  const quickButtons = await page
    .getByRole("group", { name: /訪問状態/ })
    .getByRole("button")
    .all();

  for (const button of quickButtons) {
    const box = await button.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  }

  await expectNoSeriousAccessibilityViolations(page);
});
