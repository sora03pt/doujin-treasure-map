import { expect, test } from "./fixtures";

test("Eventを作成・一覧表示・編集・削除できる", async ({
  e2ePrefix,
  loginAsTestUser,
  page,
}) => {
  const eventName = `${e2ePrefix}Event CRUD`;
  const editedName = `${eventName} edited`;

  await loginAsTestUser();
  await page.getByRole("link", { name: "イベントを作成" }).click();
  await page.getByLabel(/イベント名/).fill(eventName);
  await page.getByLabel(/開催日/).fill("2026-09-15");
  await page.getByLabel(/予定予算/).fill("12000");
  await page.getByLabel(/会場/).fill("E2E Hall");
  await page.getByRole("button", { name: "イベントを作成" }).click();

  await expect(page).toHaveURL(/\/events\?notice=created$/);
  await expect(page.getByText(eventName, { exact: true })).toBeVisible();

  await page.getByText(eventName, { exact: true }).click();
  await page.getByText("イベント情報を編集", { exact: true }).click();
  await page.getByLabel(/イベント名/).fill(editedName);
  await page.getByLabel(/予定予算/).fill("15000");
  await page.getByRole("button", { name: "変更を保存" }).click();

  await expect(page).toHaveURL(/\/events\?notice=updated$/);
  await expect(page.getByText(editedName, { exact: true })).toBeVisible();

  await page.getByText(editedName, { exact: true }).click();
  await page.waitForLoadState("networkidle");
  const deleteRegion = page.getByRole("region", { name: "イベントの削除" });
  const deleteTrigger = deleteRegion.getByRole("button", {
    name: "イベントを削除",
  });
  await deleteTrigger.click();
  const dialog = page.getByRole("dialog", {
    name: "イベントを削除しますか？",
  });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "キャンセル" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(deleteTrigger).toBeFocused();

  await deleteTrigger.click();
  await dialog.getByRole("button", { name: "削除する" }).click();

  await expect(page).toHaveURL(/\/events\?notice=deleted$/);
  await expect(page.getByText(editedName, { exact: true })).toHaveCount(0);
});
