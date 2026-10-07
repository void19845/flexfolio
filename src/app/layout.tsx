import type { CSSProperties } from "react";
import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { Toaster } from "@/components/ui/sonner";
import { SITE, PALETTE, TYPOGRAPHY } from "@/lib/site-config";
import { sanitizeHex } from "@/lib/palette";
import { sanitizeFontFamily, googleFontsHref, fontFamilyCssValue } from "@/lib/typography";
import {
  fetchDesignTheme,
  designThemeFontFaces,
  designThemeStyle,
  type DesignTheme,
} from "@/lib/design-theme";
import { createClient } from "@/lib/supabase/server";
import type { SiteSettings } from "@/lib/types";
import { Analytics } from "@vercel/analytics/next";

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

async function getTypography(): Promise<{
  style: CSSProperties;
  titleFont: string;
  bodyFont: string;
}> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("font_title, font_body")
    .eq("id", 1)
    .maybeSingle();
  const settings = data as Pick<SiteSettings, "font_title" | "font_body"> | null;

  const titleFont = sanitizeFontFamily(settings?.font_title, TYPOGRAPHY.titleFont);
  const bodyFont = sanitizeFontFamily(settings?.font_body, TYPOGRAPHY.bodyFont);

  // Same inline-style-on-<html> override as getPalette() above — --font-
  // display / --font-body (read everywhere via --font-serif / --font-sans
  // in globals.css) go straight to the chosen family name now, loaded at
  // runtime via the <link> below instead of a preloaded next/font import.
  return {
    style: {
      "--font-display": fontFamilyCssValue(titleFont, "serif"),
      "--font-body": fontFamilyCssValue(bodyFont, "sans-serif"),
    } as CSSProperties,
    titleFont,
    bodyFont,
  };
}

/** Linked Flexdesign theme, if any — null keeps the palette and
 *  typography above (see src/lib/design-theme.ts). */
async function getDesignTheme(): Promise<DesignTheme | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("design_theme_id")
    .eq("id", 1)
    .maybeSingle();
  const themeId = (data as Pick<SiteSettings, "design_theme_id"> | null)?.design_theme_id;
  return themeId ? fetchDesignTheme(supabase, themeId) : null;
}

export async function generateMetadata(): Promise<Metadata> {
  const { name, role } = await getIdentity();
  return {
    title: `${name} — ${role}`,
    description: `Portfolio de ${name}, ${role.toLowerCase()}.`,
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [{ name }, paletteStyle, typography, designTheme] = await Promise.all([
    getIdentity(),
    getPalette(),
    getTypography(),
    getDesignTheme(),
  ]);

  // A linked theme's fonts come from Flexdesign's bucket; Google Fonts is
  // only asked for the roles the theme leaves to the site's own typography.
  const googleFamilies = [
    ...(designTheme?.heading ? [] : [typography.titleFont]),
    ...(designTheme?.body ? [] : [typography.bodyFont]),
  ];
  const themeFontFaces = designTheme
    ? designThemeFontFaces(designTheme, process.env.NEXT_PUBLIC_SUPABASE_URL!)
    : "";

  return (
    <html
      lang="fr"
      className="h-full antialiased"
      style={{
        ...paletteStyle,
        ...typography.style,
        ...(designTheme ? designThemeStyle(designTheme) : {}),
      }}
    >
      {/* Rendered outside a literal <head> on purpose: React 19 hoists
          <link>/<meta>/<title> found anywhere in the tree into the real
          document <head>, which is how next/font itself injects its own
          preload tags — this just does the same for a runtime family. */}
      {googleFamilies.length > 0 ? (
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="stylesheet" href={googleFontsHref(googleFamilies)} precedence="default" />
        </>
      ) : null}
      {themeFontFaces ? (
        <style href="flexdesign-theme-fonts" precedence="default">
          {themeFontFaces}
        </style>
      ) : null}
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <SiteHeader name={name} />
        <main className="flex-1">{children}</main>
        <footer className="label-eyebrow flex flex-col items-center gap-2 border-t border-border/60 px-6 py-8 text-center text-brand-ink-muted">
          <span>© {new Date().getFullYear()} {name}</span>
          <Link href="/mentions-legales" className="hover:text-brand-accent">
            Crédits, mentions légales & RGPD
          </Link>
        </footer>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
