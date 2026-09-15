import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabaseConfig, hasSupabaseConfig } from "@/lib/supabase/config";
import type { Database } from "@/lib/supabase/database.types";

const PUBLIC_PATHS = [
  "/login",
  "/auth/confirm",
  "/api/connectivity",
  "/manifest.webmanifest",
  "/sw.js",
  "/~offline",
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

function withPendingAuthCookies(
  response: NextResponse,
  pendingCookies: Parameters<NonNullable<CookieMethodsServer["setAll"]>>[0],
  pendingHeaders: Record<string, string>,
) {
  pendingCookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });

  Object.entries(pendingHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Supabase falls back to Site URL when a requested redirect is not allow-listed.
  // Preserve those already-issued PKCE links by forwarding them to the callback.
  if (pathname === "/" && request.nextUrl.searchParams.has("code")) {
    const callbackUrl = request.nextUrl.clone();
    callbackUrl.pathname = "/auth/confirm";
    return NextResponse.redirect(callbackUrl);
  }

  if (!hasSupabaseConfig()) {
    if (isPublicPath(pathname)) {
      return NextResponse.next({ request });
    }

    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  const { url, publishableKey } = getSupabaseConfig();
  const pendingCookies: Parameters<
    NonNullable<CookieMethodsServer["setAll"]>
  >[0] = [];
  const pendingHeaders: Record<string, string> = {};

  const supabase = createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        pendingCookies.push(...cookiesToSet);
        Object.assign(pendingHeaders, headers);
      },
    },
  });

  const { data, error } = await supabase.auth.getClaims();
  const isAuthenticated = Boolean(data?.claims && !error);

  if (pathname === "/login" && isAuthenticated) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/";
      redirectUrl.search = "";
      return withPendingAuthCookies(
        NextResponse.redirect(redirectUrl),
        pendingCookies,
        pendingHeaders,
      );
    }
  }

  if (!isPublicPath(pathname) && !isAuthenticated) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", pathname);
    return withPendingAuthCookies(
      NextResponse.redirect(redirectUrl),
      pendingCookies,
      pendingHeaders,
    );
  }

  return withPendingAuthCookies(
    NextResponse.next({ request }),
    pendingCookies,
    pendingHeaders,
  );
}
