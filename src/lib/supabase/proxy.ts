import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Required: this call refreshes the auth token and must not be removed
  // or reordered relative to the response construction above.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isLoginPage = pathname === "/admin/login";
  const isMfaPage = pathname === "/admin/mfa";
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute && !isLoginPage && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // 2FA gate: a signed-in user whose session hasn't cleared a TOTP
  // challenge yet (nextLevel is aal2 but currentLevel isn't) has to pass
  // through /admin/mfa before reaching any other /admin route.
  let needsMfaChallenge = false;
  if (user) {
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    needsMfaChallenge = !!aal && aal.nextLevel === "aal2" && aal.currentLevel !== aal.nextLevel;
  }

  if (isAdminRoute && !isLoginPage && !isMfaPage && needsMfaChallenge) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/mfa";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Nothing left to verify — don't strand the user on the challenge screen
  // (no factor enrolled, already at aal2, or not even logged in).
  if (isMfaPage && !needsMfaChallenge) {
    const url = request.nextUrl.clone();
    url.pathname = user ? "/admin" : "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (isLoginPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = needsMfaChallenge ? "/admin/mfa" : "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
