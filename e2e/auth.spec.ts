import { expect, test } from "./fixtures";

test("未認証ユーザーをloginへredirectする", async ({ page }) => {
  await page.goto("/auth/complete");

  await expect(page).toHaveURL(/\/login\?next=%2Fauth%2Fcomplete$/);
  await expect(page.getByRole("heading", { name: "ログイン" })).toBeVisible();

  await page.goto("/events/new");

  await expect(page).toHaveURL(/\/login\?next=%2Fevents%2Fnew$/);
  await expect(page.getByRole("heading", { name: "ログイン" })).toBeVisible();
});

test("無効な確認codeでは登録完了画面へ進まない", async ({ page }) => {
  await page.goto("/auth/confirm?code=invalid-e2e-code");

  await expect(page).toHaveURL(/\/login\?message=/);
  await expect(page.getByRole("heading", { name: "ログイン" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "登録が完了しました" }),
  ).toHaveCount(0);
});

test("通常ユーザーがloginとlogoutを完了できる", async ({
  loginAsTestUser,
  page,
}) => {
  await loginAsTestUser();

  await page.goto("/auth/complete");
  await expect(
    page.getByRole("heading", { name: "登録が完了しました" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "はじめる" }).click();
  await expect(page).toHaveURL(/\/events$/);

  await page.goBack();
  await expect(page).toHaveURL(/\/auth\/complete$/);
  await expect(
    page.getByRole("heading", { name: "登録が完了しました" }),
  ).toBeVisible();
  await page.goForward();
  await expect(page).toHaveURL(/\/events$/);

  await page.getByRole("button", { name: "ログアウト" }).click();

  await expect(page).toHaveURL(/\/login$/);

  await page.goto("/events");
  await expect(page).toHaveURL(/\/login\?next=%2Fevents$/);
});
