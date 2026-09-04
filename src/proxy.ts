import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "./lib/supabase/proxy";

// Footer link ("Crédits, mentions légales & RGPD") points at this short
// path; the Proxy redirects it to the real static page at /legal so the
// route the site links to is decoupled from where the content actually
// lives.
const LEGAL_REDIRECT_FROM = "/mentions-legales";
const LEGAL_REDIRECT_TO = "/legal";

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === LEGAL_REDIRECT_FROM) {
    return NextResponse.redirect(new URL(LEGAL_REDIRECT_TO, request.url));
  }

  return await updateSession(request);
}

export const config = {
  matcher: ["/admin/:path*", "/mentions-legales"],
};
