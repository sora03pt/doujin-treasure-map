"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export type AuthFormState = {
  status: "idle" | "error" | "success";
  message: string;
};

type CredentialsResult =
  | {
      ok: true;
      email: string;
      password: string;
    }
  | {
      ok: false;
      message: string;
    };

function readCredentials(formData: FormData): CredentialsResult {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return {
      ok: false,
      message: "メールアドレスとパスワードを入力してください。",
    };
  }

  if (password.length < 6) {
    return {
      ok: false,
      message: "パスワードは6文字以上で入力してください。",
    };
  }

  return { ok: true, email, password };
}

export async function authenticate(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const intent = formData.get("intent");
  const credentials = readCredentials(formData);

  if (!credentials.ok) {
    return { status: "error", message: credentials.message };
  }

  if (!hasSupabaseConfig()) {
    return {
      status: "error",
      message:
        "Supabase環境変数が未設定です。.env.localを設定してから再実行してください。",
    };
  }

  const supabase = await createClient();

  if (intent === "signup") {
    const headerStore = await headers();
    const origin = headerStore.get("origin");
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: origin
        ? {
            emailRedirectTo: `${origin}/auth/confirm`,
          }
        : undefined,
    });

    if (error) {
      return { status: "error", message: error.message };
    }

    if (data.session) {
      revalidatePath("/", "layout");
      redirect("/");
    }

    return {
      status: "success",
      message:
        "登録確認メールを送信しました。メール内のリンクから認証を完了してください。",
    };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  });

  if (error) {
    return { status: "error", message: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function logout() {
  const supabase = await createClient();

  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
