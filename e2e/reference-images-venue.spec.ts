import type { Locator } from "@playwright/test";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";
import { expectNoSeriousAccessibilityViolations } from "./accessibility";
import { expect, test } from "./fixtures";

async function ensureDetailsOpen(details: Locator) {
  if ((await details.getAttribute("open")) === null) {
    await details.locator(":scope > summary").click();
  }
}

async function uploadImage(region: Locator, imageBuffer: Buffer) {
  await region.getByLabel(/画像を(登録|差し替え)/).setInputFiles({
    name: "reference.png",
    mimeType: "image/png",
    buffer: imageBuffer,
  });
  const button = region
    .getByRole("button")
    .filter({ hasText: /画像を(保存|差し替える)/ });
  await expect(button).toBeEnabled();
  await button.click();
  await expect(region.getByText("画像を保存しました。", { exact: true })).toBeVisible();
}

async function storageObjectExists(
  client: SupabaseClient<Database>,
  path: string,
) {
  const parts = path.split("/");
  const name = parts.pop();
  const { data, error } = await client.storage
    .from("reference-images")
    .list(parts.join("/"), { limit: 100 });

  if (error) {
    throw new Error(`Storage list failed with ${error.name}.`);
  }

  return (data ?? []).some((entry) => entry.id && entry.name === name);
}

test("会場、X投稿URL、Circle・Item画像を登録・差し替え・削除できる", async ({
  e2ePrefix,
  loginAsTestUser,
  normalUserClient,
  page,
  seedEvent,
}) => {
  const event = await seedEvent();
  const circleName = `${e2ePrefix}Reference Circle`;
  const itemName = `${e2ePrefix}Reference Item`;

  await loginAsTestUser();
  await page.goto(`/events/${event.id}`);
  const imageBuffer = Buffer.from(
    await page.evaluate(() => {
      const canvas = document.createElement("canvas");
      canvas.width = 8;
      canvas.height = 8;
      const context = canvas.getContext("2d");
      context?.fillRect(0, 0, 8, 8);
      return canvas.toDataURL("image/png").split(",")[1];
    }),
    "base64",
  );

  const eventDetails = page.locator("details").filter({ hasText: "イベント情報を編集" });
  await ensureDetailsOpen(eventDetails);
  await eventDetails
    .getByRole("combobox", { name: /^会場/ })
    .selectOption("東京ビッグサイト");
  await eventDetails.getByRole("button", { name: "変更を保存" }).click();
  await expect(page).toHaveURL(/\/events\?notice=updated$/);

  await page
    .locator("li")
    .filter({ hasText: event.name })
    .getByRole("link")
    .click();
  await expect(page.getByText("東京ビッグサイト", { exact: true })).toBeVisible();
  await ensureDetailsOpen(eventDetails);
  await eventDetails
    .getByRole("combobox", { name: /^会場/ })
    .selectOption("other");
  await eventDetails.getByLabel(/会場名/).fill("E2E展示ホール");
  await eventDetails.getByRole("button", { name: "変更を保存" }).click();
  await page
    .locator("li")
    .filter({ hasText: event.name })
    .getByRole("link")
    .click();
  await expect(page.getByText("E2E展示ホール", { exact: true })).toBeVisible();

  const addCircle = page.locator("details").filter({ hasText: "サークルを追加" });
  await ensureDetailsOpen(addCircle);
  await addCircle.getByLabel(/サークル名/).fill(circleName);
  await addCircle
    .getByLabel(/Xの頒布情報URL/)
    .fill("https://x.com/test_user/status/123456789?s=20");
  await addCircle.getByRole("button", { name: "サークルを保存" }).click();

  let circleCard = page.locator("li:has(article)").filter({ hasText: circleName });
  const xLink = circleCard.getByRole("link", { name: /頒布情報をXで見る/ });
  await expect(xLink).toHaveAttribute(
    "href",
    "https://x.com/test_user/status/123456789",
  );

  let management = circleCard.locator("details").filter({ hasText: "編集・頒布物管理" });
  await ensureDetailsOpen(management);
  let imageRegion = management.getByRole("region", { name: "参照画像" }).first();
  await uploadImage(imageRegion, imageBuffer);

  circleCard = page.locator("li:has(article)").filter({ hasText: circleName });
  const circleImageButton = circleCard.getByRole("button", {
    name: `${circleName}の参照画像を拡大表示`,
  }).first();
  await expect(circleImageButton).toBeVisible();
  await circleImageButton.click();
  await expect(page.getByRole("dialog", { name: `${circleName}の参照画像` })).toBeVisible();
  await expectNoSeriousAccessibilityViolations(page);
  await page.keyboard.press("Escape");
  await expect(circleImageButton).toBeFocused();

  management = circleCard.locator("details").filter({ hasText: "編集・頒布物管理" });
  await ensureDetailsOpen(management);
  imageRegion = management.getByRole("region", { name: "参照画像" }).first();
  await uploadImage(imageRegion, imageBuffer);

  const { data: circle } = await normalUserClient
    .from("circles")
    .select("id,image_path")
    .eq("event_id", event.id)
    .eq("name", circleName)
    .single();
  expect(circle?.image_path).toContain(`/circles/${circle?.id}/reference`);

  circleCard = page.locator("li:has(article)").filter({ hasText: circleName });
  management = circleCard.locator("details").filter({ hasText: "編集・頒布物管理" });
  await ensureDetailsOpen(management);
  const addItem = management.locator("details").filter({ hasText: "頒布物を追加" }).last();
  await ensureDetailsOpen(addItem);
  await addItem.getByLabel(/頒布物名/).fill(itemName);
  await addItem.getByRole("button", { name: "頒布物を保存" }).click();
  await expect(
    page.getByText("頒布物を追加しました。", { exact: true }),
  ).toBeVisible();

  circleCard = page.locator("li:has(article)").filter({ hasText: circleName });
  management = circleCard.locator("details").filter({ hasText: "編集・頒布物管理" });
  await ensureDetailsOpen(management);
  let itemRow = management.locator("li").filter({ hasText: itemName });
  const editItem = itemRow.locator("details").filter({ hasText: "頒布物を編集" });
  await ensureDetailsOpen(editItem);
  let itemImageRegion = editItem.getByRole("region", { name: "参照画像" });
  await uploadImage(itemImageRegion, imageBuffer);

  circleCard = page.locator("li:has(article)").filter({ hasText: circleName });
  management = circleCard.locator("details").filter({ hasText: "編集・頒布物管理" });
  await ensureDetailsOpen(management);
  itemRow = management.locator("li").filter({ hasText: itemName });
  await expect(
    itemRow
      .getByRole("button", { name: `${itemName}の参照画像を拡大表示` })
      .first(),
  ).toBeVisible();
  await ensureDetailsOpen(itemRow.locator("details").filter({ hasText: "頒布物を編集" }));
  itemImageRegion = itemRow.getByRole("region", { name: "参照画像" });
  await itemImageRegion.getByRole("button", { name: "登録画像を削除" }).click();
  await expect(itemImageRegion.getByText("画像を削除しました。", { exact: true })).toBeVisible();

  circleCard = page.locator("li:has(article)").filter({ hasText: circleName });
  management = circleCard.locator("details").filter({ hasText: "編集・頒布物管理" });
  await ensureDetailsOpen(management);
  imageRegion = management.getByRole("region", { name: "参照画像" }).first();
  await imageRegion.getByRole("button", { name: "登録画像を削除" }).click();
  await expect(imageRegion.getByText("画像を削除しました。", { exact: true })).toBeVisible();

  const [circleAfterDelete, itemAfterDelete] = await Promise.all([
    normalUserClient.from("circles").select("image_path").eq("id", circle?.id ?? "").single(),
    normalUserClient.from("items").select("image_path").eq("name", itemName).single(),
  ]);
  expect(circleAfterDelete.data?.image_path).toBeNull();
  expect(itemAfterDelete.data?.image_path).toBeNull();
});

test("Item・Circle削除時に関連画像をStorageから削除する", async ({
  e2ePrefix,
  loginAsTestUser,
  normalUserClient,
  page,
  seedEvent,
}) => {
  const event = await seedEvent();
  const circleName = `${e2ePrefix}Cleanup Circle`;
  const deletedItemName = `${e2ePrefix}Deleted Item`;
  const cascadedItemName = `${e2ePrefix}Cascaded Item`;
  const {
    data: { user },
  } = await normalUserClient.auth.getUser();

  expect(user).not.toBeNull();

  const { data: circle, error: circleError } = await normalUserClient
    .from("circles")
    .insert({ event_id: event.id, name: circleName, user_id: user!.id })
    .select("id")
    .single();
  expect(circleError).toBeNull();

  const { data: items, error: itemsError } = await normalUserClient
    .from("items")
    .insert([
      { circle_id: circle!.id, name: deletedItemName, user_id: user!.id },
      { circle_id: circle!.id, name: cascadedItemName, user_id: user!.id },
    ])
    .select("id,name");
  expect(itemsError).toBeNull();

  const deletedItem = items!.find((item) => item.name === deletedItemName)!;
  const cascadedItem = items!.find((item) => item.name === cascadedItemName)!;
  const circlePath = `${user!.id}/circles/${circle!.id}/reference`;
  const deletedItemPath = `${user!.id}/items/${deletedItem.id}/reference`;
  const cascadedItemPath = `${user!.id}/items/${cascadedItem.id}/reference`;
  const imageBuffer = Buffer.from([
    137, 80, 78, 71, 13, 10, 26, 10,
  ]);
  const bucket = normalUserClient.storage.from("reference-images");

  for (const path of [circlePath, deletedItemPath, cascadedItemPath]) {
    const { error } = await bucket.upload(path, imageBuffer, {
      cacheControl: "0",
      contentType: "image/png",
      upsert: false,
    });
    expect(error).toBeNull();
  }

  const [circleImageUpdate, deletedItemImageUpdate, cascadedItemImageUpdate] =
    await Promise.all([
      normalUserClient
        .from("circles")
        .update({ image_path: circlePath })
        .eq("id", circle!.id),
      normalUserClient
        .from("items")
        .update({ image_path: deletedItemPath })
        .eq("id", deletedItem.id),
      normalUserClient
        .from("items")
        .update({ image_path: cascadedItemPath })
        .eq("id", cascadedItem.id),
    ]);
  expect(circleImageUpdate.error).toBeNull();
  expect(deletedItemImageUpdate.error).toBeNull();
  expect(cascadedItemImageUpdate.error).toBeNull();

  await loginAsTestUser();
  await page.goto(`/events/${event.id}`);

  let circleCard = page.locator("li:has(article)").filter({ hasText: circleName });
  let management = circleCard
    .locator("details")
    .filter({ hasText: "編集・頒布物管理" });
  await ensureDetailsOpen(management);
  const deletedItemRow = management
    .locator("li")
    .filter({ hasText: deletedItemName });
  await deletedItemRow.getByRole("button", { name: "頒布物を削除" }).click();
  await page
    .getByRole("dialog", { name: "頒布物を削除しますか？" })
    .getByRole("button", { name: "削除する" })
    .click();
  await expect(
    page.getByText("頒布物を削除しました。", { exact: true }),
  ).toBeVisible();
  expect(await storageObjectExists(normalUserClient, deletedItemPath)).toBe(
    false,
  );

  circleCard = page.locator("li:has(article)").filter({ hasText: circleName });
  management = circleCard
    .locator("details")
    .filter({ hasText: "編集・頒布物管理" });
  await ensureDetailsOpen(management);
  await management.getByRole("button", { name: "サークルを削除" }).click();
  await page
    .getByRole("dialog", { name: "サークルを削除しますか？" })
    .getByRole("button", { name: "削除する" })
    .click();
  await expect(
    page.getByText("サークルを削除しました。", { exact: true }),
  ).toBeVisible();
  expect(await storageObjectExists(normalUserClient, circlePath)).toBe(false);
  expect(await storageObjectExists(normalUserClient, cascadedItemPath)).toBe(
    false,
  );
});
