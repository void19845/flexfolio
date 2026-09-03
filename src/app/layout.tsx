import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { Playfair_Display, Inter, Give_You_Glory, Quicksand } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { Toaster } from "@/components/ui/sonner";
import { SITE, PALETTE, TYPOGRAPHY } from "@/lib/site-config";
import { sanitizeHex } from "@/lib/palette";
import { createClient } from "@/lib/supabase/server";
import { TITLE_FONT_VARS, BODY_FONT_VARS, type SiteSettings } from "@/lib/types";

// Both options for each role are preloaded here — the admin picks one in
// /admin/parametres and getTypography() below aliases --font-display /
// --font-body to it. `variable:` must be a string literal (next/font is a
// build-time transform), so these have to stay in sync by hand with
// TITLE_FONT_VARS / BODY_FONT_VARS in src/lib/types.ts.
const fontDisplayPlayfair = Playfair_Display({
  variable: "--font-display-playfair-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "900"],
});

const fontDisplayGiveYouGlory = Give_You_Glory({
  variable: "--font-display-give-you-glory",
  subsets: ["latin"],
  weight: "400",
});

const fontBodyInter = Inter({
  variable: "--font-body-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const fontBodyQuicksand = Quicksand({
  variable: "--font-body-quicksand",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

async function getIdentity() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("site_name, site_role")
    .eq("id", 1)
    .maybeSingle();
  const settings = data as Pick<SiteSettings, "site_name" | "site_role"> | null;
  return {
    name: settings?.site_name ?? SITE.name,
    role: settings?.site_role ?? SITE.role,
  };
}

async function getPalette(): Promise<CSSProperties> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("palette_bg, palette_ink, palette_card, palette_accent")
    .eq("id", 1)
    .maybeSingle();
  const settings = data as Pick<
    SiteSettings,
    "palette_bg" | "palette_ink" | "palette_card" | "palette_accent"
  > | null;

  // Inline style on <html> (== :root) beats the stylesheet defaults and
  // still lets every derived token (--background, --ring, --color-brand-*,
  // all `var()`-chained in globals.css) pick up the override automatically.
  return {
    "--brand-bg": sanitizeHex(settings?.palette_bg, PALETTE.bg),
    "--brand-ink": sanitizeHex(settings?.palette_ink, PALETTE.ink),
    "--brand-card": sanitizeHex(settings?.palette_card, PALETTE.card),
    "--brand-accent": sanitizeHex(settings?.palette_accent, PALETTE.accent),
  } as CSSProperties;
}

async function getTypography(): Promise<CSSProperties> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("font_title, font_body")
    .eq("id", 1)
    .maybeSingle();
  const settings = data as Pick<SiteSettings, "font_title" | "font_body"> | null;

  const titleFont = settings?.font_title ?? TYPOGRAPHY.titleFont;
  const bodyFont = settings?.font_body ?? TYPOGRAPHY.bodyFont;

  // Same inline-style-on-<html> override as getPalette() above — aliases
  // --font-display / --font-body (read everywhere via --font-serif /
  // --font-sans in globals.css) to whichever preloaded variable the
  // admin picked.
  return {
    "--font-display": `var(${TITLE_FONT_VARS[titleFont]})`,
    "--font-body": `var(${BODY_FONT_VARS[bodyFont]})`,
  } as CSSProperties;
}

export async function generateMetadata(): Promise<Metadata> {
  const { name, role } = await getIdentity();
  return {
    title: `${name} — ${role}`,
    description: `Portfolio de ${name}, ${role.toLowerCase()}.`,
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [{ name }, paletteStyle, typographyStyle] = await Promise.all([
    getIdentity(),
    getPalette(),
    getTypography(),
  ]);

  return (
    <html
      lang="fr"
      className={`${fontDisplayPlayfair.variable} ${fontDisplayGiveYouGlory.variable} ${fontBodyInter.variable} ${fontBodyQuicksand.variable} h-full antialiased`}
      style={{ ...paletteStyle, ...typographyStyle }}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <SiteHeader name={name} />
        <main className="flex-1">{children}</main>
        <footer className="label-eyebrow border-t border-border/60 px-6 py-8 text-center text-brand-ink-muted">
          © {new Date().getFullYear()} {name}
        </footer>
        <Toaster />
      </body>
    </html>
  );
}
