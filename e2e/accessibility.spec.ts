import { expectNoSeriousAccessibilityViolations } from "./accessibility";
import { test } from "./fixtures";

test("loginにcritical / seriousのaxe違反がない", async ({ page }) => {
  await page.goto("/login");
  await expectNoSeriousAccessibilityViolations(page);
});

test("Event一覧・作成・詳細・編集にcritical / seriousのaxe違反がない", async ({
  loginAsTestUser,
  page,
  seedEvent,
}) => {
  const event = await seedEvent({ plannedBudget: 10_000 });

  await loginAsTestUser();
  await expectNoSeriousAccessibilityViolations(page);

  await page.goto("/events/new");
  await expectNoSeriousAccessibilityViolations(page);

  await page.goto(`/events/${event.id}`);
  await expectNoSeriousAccessibilityViolations(page);

  await page.getByText("イベント情報を編集", { exact: true }).click();
  await expectNoSeriousAccessibilityViolations(page);
});
