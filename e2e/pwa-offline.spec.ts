import { expect, test } from "./fixtures";

async function readOfflineStorage(page: import("@playwright/test").Page) {
  return page.evaluate(async () => {
    const activeUser = localStorage.getItem(
      "doujin-treasure-map:offline-user",
    );
    const count = await new Promise<number>((resolve, reject) => {
      const request = indexedDB.open("doujin-treasure-map-offline", 1);
      request.addEventListener("error", () => reject(request.error));
      request.addEventListener("upgradeneeded", () => {
        if (!request.result.objectStoreNames.contains("event_snapshots")) {
          request.result.createObjectStore("event_snapshots", {
            keyPath: "key",
          });
        }
      });
      request.addEventListener("success", () => {
        const database = request.result;
        const transaction = database.transaction(
          "event_snapshots",
          "readonly",
        );
        const countRequest = transaction.objectStore("event_snapshots").count();
        countRequest.addEventListener("success", () => {
          database.close();
          resolve(countRequest.result);
        });
        countRequest.addEventListener("error", () => reject(countRequest.error));
      });
    });

    return { activeUser, count };
  });
}

test("Event-day snapshotを安全にoffline表示しlogoutで削除する", async ({
  context,
  loginAsTestUser,
  normalUserClient,
  page,
  seedEvent,
}) => {
  const event = await seedEvent({ plannedBudget: 5_000 });
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
      name: "Offline Circle",
      priority: "must",
      visit_status: "unvisited",
      space_number: "A01",
      assignee: "担当A",
    })
    .select("id")
    .single();

  if (circle.error || !circle.data) {
    throw new Error(`PWA circle seed failed with code ${circle.error?.code}.`);
  }

  const item = await normalUserClient.from("items").insert({
    circle_id: circle.data.id,
    user_id: user.id,
    name: "Offline Item",
    price: 700,
    quantity: 2,
  });

  if (item.error) {
    throw new Error(`PWA item seed failed with code ${item.error.code}.`);
  }

  await loginAsTestUser();
  await page.goto(`/events/${event.id}`);
  await expect(page.getByText(/オフライン保存:/)).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(async () => {
        const registration = await navigator.serviceWorker.getRegistration();
        return {
          controlled: Boolean(navigator.serviceWorker.controller),
          state: registration?.active?.state ?? null,
        };
      }),
    )
    .toEqual({ controlled: true, state: "activated" });
  await expect.poll(async () => (await readOfflineStorage(page)).count).toBe(1);

  await page.evaluate(async () => {
    await fetch("/icons/app-icon-192.png?runtime-cache-test=1");
  });
  const cacheAudit = await page.evaluate(async () => {
    const cacheNames = await caches.keys();

    return Promise.all(
      cacheNames.map(async (name) => ({
        name,
        urls: (await (await caches.open(name)).keys()).map(
          (request) => request.url,
        ),
      })),
    );
  });
  const runtimeCache = cacheAudit.find(
    (cache) => cache.name === "doujin-treasure-map-static-v1",
  );

  expect(runtimeCache).toBeDefined();
  expect(runtimeCache?.urls.length).toBeGreaterThan(0);
  expect(
    runtimeCache?.urls.every((url) => {
      const pathname = new URL(url).pathname;
      return (
        pathname.startsWith("/_next/static/") ||
        pathname.startsWith("/icons/")
      );
    }),
  ).toBe(true);

  const cachedUrls = cacheAudit.flatMap((cache) => cache.urls);
  expect(
    cachedUrls.some((url) => {
      const parsedUrl = new URL(url);
      return (
        parsedUrl.origin !== new URL(page.url()).origin ||
        parsedUrl.pathname.startsWith("/api/") ||
        parsedUrl.pathname.startsWith("/auth/") ||
        parsedUrl.pathname === "/login" ||
        parsedUrl.pathname.startsWith("/events")
      );
    }),
  ).toBe(false);

  await context.setOffline(true);
  await expect(page.getByText("接続: オフライン", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "購入済み" }).first(),
  ).toBeDisabled();
  await expect(page.getByText("訪問状態: 未訪問", { exact: true })).toBeVisible();

  await page.reload();
  await expect(page.getByText("オフラインデータ", { exact: true })).toBeVisible();
  await expect(page.getByText(event.name, { exact: true })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Offline Circle" }),
  ).toBeVisible();
  await expect(page.getByText("Offline Item", { exact: true })).toBeVisible();
  await expect(page.getByText("¥1,400", { exact: true })).toBeVisible();
  await expect(
    page.getByText("頒布物 1件 / 合計 ¥1,400", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("現在オフラインです", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "購入済み" })).toHaveCount(0);

  await context.setOffline(false);
  await expect(
    page.getByRole("button", { name: "接続を確認して再試行" }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "接続を確認して再試行" }).click();
  await expect(page.getByText("接続: オンライン", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Offline Circle" }),
  ).toBeVisible();

  await page.getByRole("link", { name: "イベント一覧へ戻る" }).click();
  await page.getByRole("button", { name: "ログアウト" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect.poll(async () => (await readOfflineStorage(page)).count).toBe(0);
  expect((await readOfflineStorage(page)).activeUser).toBeNull();
});
