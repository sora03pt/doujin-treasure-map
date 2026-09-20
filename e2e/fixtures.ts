import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { expect, test as base } from "@playwright/test";

import type { Database } from "@/lib/supabase/database.types";

type TestFixtures = {
  e2ePrefix: string;
  loginAsTestUser: () => Promise<void>;
  normalUserClient: SupabaseClient<Database>;
  seedEvent: (overrides?: {
    name?: string;
    plannedBudget?: number | null;
  }) => Promise<{ id: string; name: string }>;
};

function getCredentials() {
  if (process.env.E2E_ALLOW_REMOTE_TESTS !== "true") {
    throw new Error(
      "E2E remote access is disabled. Set E2E_ALLOW_REMOTE_TESTS=true only for a dedicated test project.",
    );
  }

  const url =
    process.env.E2E_SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey =
    process.env.E2E_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const email = process.env.E2E_USER_EMAIL ?? process.env.TEST_USER_A_EMAIL;
  const password =
    process.env.E2E_USER_PASSWORD ?? process.env.TEST_USER_A_PASSWORD;

  if (!url || !publishableKey || !email || !password) {
    throw new Error(
      "E2E Supabase URL, publishable key, email, or password is missing.",
    );
  }

  return { url, publishableKey, email, password };
}

async function cleanupEvents(
  client: SupabaseClient<Database>,
  prefix: string,
) {
  const { data: events, error: loadError } = await client
    .from("events")
    .select("id,circles(image_path,items(image_path))")
    .like("name", `${prefix}%`);

  if (loadError) {
    throw new Error(`E2E cleanup load failed with code ${loadError.code}.`);
  }

  const imagePaths = (events ?? []).flatMap((event) =>
    event.circles.flatMap((circle) => [
      circle.image_path,
      ...circle.items.map((item) => item.image_path),
    ]),
  ).filter((path): path is string => Boolean(path));

  if (imagePaths.length > 0) {
    const { error: storageError } = await client.storage
      .from("reference-images")
      .remove(imagePaths);

    if (storageError) {
      throw new Error(`E2E Storage cleanup failed with ${storageError.name}.`);
    }
  }

  const { error } = await client
    .from("events")
    .delete()
    .like("name", `${prefix}%`);

  if (error) {
    throw new Error(`E2E cleanup failed with code ${error.code}.`);
  }
}

export const test = base.extend<TestFixtures>({
  normalUserClient: async ({}, provide) => {
    const { url, publishableKey, email, password } = getCredentials();
    const client = createClient<Database>(url, publishableKey, {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    });
    const { error } = await client.auth.signInWithPassword({ email, password });

    if (error) {
      throw new Error(`E2E user sign-in failed with code ${error.code}.`);
    }

    await provide(client);
    await client.auth.signOut({ scope: "local" });
  },

  e2ePrefix: async ({ normalUserClient }, provide, testInfo) => {
    const project = testInfo.project.name.replace(/[^a-z0-9-]/gi, "-");
    const prefix = `E2E-${project}-${process.pid}-${Date.now()}-`;

    await cleanupEvents(normalUserClient, prefix);
    await provide(prefix);
    await cleanupEvents(normalUserClient, prefix);
  },

  loginAsTestUser: async ({ page }, provide) => {
    const { email, password } = getCredentials();

    await provide(async () => {
      await page.goto("/login");
      await page.getByLabel("メールアドレス").fill(email);
      await page.getByLabel("パスワード").fill(password);
      await page.getByRole("button", { name: "ログイン" }).click();
      await expect(page).toHaveURL(/\/(?:events)?$/);
      await expect(
        page.getByRole("heading", { name: "イベント一覧" }),
      ).toBeVisible();
    });
  },

  seedEvent: async ({ e2ePrefix, normalUserClient }, provide) => {
    const {
      data: { user },
      error: userError,
    } = await normalUserClient.auth.getUser();

    if (userError || !user) {
      throw new Error("E2E user could not be read after sign-in.");
    }

    let sequence = 0;

    await provide(async (overrides = {}) => {
      sequence += 1;
      const name = overrides.name ?? `${e2ePrefix}Event-${sequence}`;
      const { data, error } = await normalUserClient
        .from("events")
        .insert({
          user_id: user.id,
          name,
          event_date: "2026-09-01",
          planned_budget: overrides.plannedBudget ?? null,
        })
        .select("id")
        .single();

      if (error || !data) {
        throw new Error(`E2E event seed failed with code ${error?.code}.`);
      }

      return { id: data.id, name };
    });
  },
});

export { expect } from "@playwright/test";
