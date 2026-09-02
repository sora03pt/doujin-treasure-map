import { expect, test } from "./fixtures";

test("未認証ユーザーをloginへredirectする", async ({ page }) => {
  await page.goto("/events/new");

  await expect(page).toHaveURL(/\/login\?next=%2Fevents%2Fnew$/);
  await expect(page.getByRole("heading", { name: "ログイン" })).toBeVisible();
});

test("通常ユーザーがloginとlogoutを完了できる", async ({
  loginAsTestUser,
  page,
}) => {
  await loginAsTestUser();
  await page.getByRole("button", { name: "ログアウト" }).click();

  await expect(page).toHaveURL(/\/login$/);

  await page.goto("/events");
  await expect(page).toHaveURL(/\/login\?next=%2Fevents$/);
});
