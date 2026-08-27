import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { Toaster } from "@/components/ui/sonner";
import { SITE } from "@/lib/site-config";
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

export async function generateMetadata(): Promise<Metadata> {
  const { name, role } = await getIdentity();
  return {
    title: `${name} — ${role}`,
    description: `Portfolio de ${name}, ${role.toLowerCase()}.`,
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { name } = await getIdentity();

  return (
    <html
      lang="fr"
      className={`${fontDisplay.variable} ${fontBody.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <footer className="label-eyebrow border-t border-border/60 px-6 py-8 text-center text-brand-ink-muted">
          © {new Date().getFullYear()} {name}
        </footer>
        <Toaster />
      </body>
    </html>
  );
}
