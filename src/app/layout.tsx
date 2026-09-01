import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { Toaster } from "@/components/ui/sonner";
import { SITE, PALETTE } from "@/lib/site-config";
import { sanitizeHex } from "@/lib/palette";
import { createClient } from "@/lib/supabase/server";
import type { SiteSettings } from "@/lib/types";

const fontDisplay = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "900"],
});

const fontBody = Inter({
  variable: "--font-body",
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

export async function generateMetadata(): Promise<Metadata> {
  const { name, role } = await getIdentity();
  return {
    title: `${name} — ${role}`,
    description: `Portfolio de ${name}, ${role.toLowerCase()}.`,
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [{ name }, paletteStyle] = await Promise.all([getIdentity(), getPalette()]);

  return (
    <html
      lang="fr"
      className={`${fontDisplay.variable} ${fontBody.variable} h-full antialiased`}
      style={paletteStyle}
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
