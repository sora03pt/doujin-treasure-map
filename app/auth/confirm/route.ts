import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

function redirectWithinApp(location: string) {
  return new NextResponse(null, {
    status: 303,
    headers: { location },
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const flowId = searchParams.get("sb_flow_id");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(
      code,
      flowId ? { flowId } : undefined,
    );

    if (!error) {
      return redirectWithinApp("/auth/complete");
    }
  } else if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });

    if (!error) {
      return redirectWithinApp("/auth/complete");
    }
  }

  const query = new URLSearchParams({
    message: "メール認証リンクを確認できませんでした。",
  });
  return redirectWithinApp(`/login?${query}`);
}
