import type { CSSProperties } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Optional link to a Flexdesign theme (site_settings.design_theme_id, off
 *  by default). While linked, the theme's light-mode colors and its
 *  heading/body fonts replace the palette and typography set in
 *  /admin/parametres — those stay saved and come back as soon as the theme
 *  is unlinked, deleted, or can't be read. Themes live in Flexdesign's
 *  public design_* tables: Flexfolio only ever reads them. */

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

// Same rules as the CHECK constraints on Flexdesign's tables, re-checked
// here because these values end up in an inline style and a <style> tag.
const HEX_PATTERN = /^#[0-9a-f]{6}$/;
const FAMILY_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 ]{0,62}$/;
const FONT_PATH_PATTERN = /^[0-9a-f-]{36}\/[a-z0-9-]{1,80}\.(woff2|woff|ttf|otf)$/;
const UNICODE_RANGE_PATTERN =
  /^U\+[0-9A-Fa-f?]{1,6}(-[0-9A-Fa-f]{1,6})?(,U\+[0-9A-Fa-f?]{1,6}(-[0-9A-Fa-f]{1,6})?)*$/;
const FALLBACKS = new Set(["sans-serif", "serif", "monospace", "cursive", "system-ui"]);
const FORMATS = new Set(["woff2", "woff", "truetype", "opentype"]);

/** Flexfolio CSS variable (globals.css) -> Flexdesign color role. The
 *  dark CV card takes the theme's primary/onPrimary pair. */
const COLOR_VARS: [string, string][] = [
  ["--brand-bg", "background"],
  ["--brand-ink", "text"],
  ["--brand-ink-muted", "muted"],
  ["--brand-card", "primary"],
  ["--brand-card-foreground", "onPrimary"],
  ["--brand-accent", "accent"],
  ["--card", "surface"],
  ["--popover", "surface"],
  ["--border", "border"],
  ["--input", "border"],
  ["--destructive", "danger"],
];

interface FontFileRow {
  weight: number;
  style: string;
  unicode_range: string | null;
  format: string;
  path: string;
}

interface ThemeRow {
  name: string;
  design_theme_colors: { mode: string; kind: string; name: string; hex: string }[];
  design_theme_fonts: {
    role: string;
    fallback: string;
    design_fonts: { family: string; design_font_files: FontFileRow[] } | null;
  }[];
}

export interface DesignThemeFont {
  family: string;
  fallback: string;
  files: FontFileRow[];
}

export interface DesignTheme {
  name: string;
  /** Light-mode role colors, role name -> #rrggbb */
  colors: Record<string, string>;
  heading: DesignThemeFont | null;
  body: DesignThemeFont | null;
}

export function isDesignThemeId(value: string): boolean {
  return UUID_PATTERN.test(value);
}

function isValidFile(f: FontFileRow): boolean {
  return (
    Number.isInteger(f.weight) &&
    f.weight >= 100 &&
    f.weight <= 900 &&
    (f.style === "normal" || f.style === "italic") &&
    FORMATS.has(f.format) &&
    FONT_PATH_PATTERN.test(f.path) &&
    (f.unicode_range === null || UNICODE_RANGE_PATTERN.test(f.unicode_range))
  );
}

function toFont(row: ThemeRow, role: string): DesignThemeFont | null {
  const font = row.design_theme_fonts.find((f) => f.role === role);
  if (!font?.design_fonts) return null;
  if (!FAMILY_PATTERN.test(font.design_fonts.family) || !FALLBACKS.has(font.fallback)) return null;
  return {
    family: font.design_fonts.family,
    fallback: font.fallback,
    files: font.design_fonts.design_font_files.filter(isValidFile),
  };
}

/** Reads one theme from Flexdesign's tables. null when it doesn't exist
 *  (deleted) or can't be read (Flexdesign not installed, network error):
 *  the caller then keeps the site's own palette and typography. */
export async function fetchDesignTheme(
  supabase: SupabaseClient,
  id: string,
): Promise<DesignTheme | null> {
  const { data, error } = await supabase
    .from("design_themes")
    .select(
      "name, design_theme_colors(mode, kind, name, hex), design_theme_fonts(role, fallback, design_fonts(family, design_font_files(weight, style, unicode_range, format, path)))",
    )
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;

  const row = data as unknown as ThemeRow;
  const colors: Record<string, string> = {};
  for (const c of row.design_theme_colors) {
    if (c.mode === "light" && c.kind === "role" && HEX_PATTERN.test(c.hex)) colors[c.name] = c.hex;
  }
  return { name: row.name, colors, heading: toFont(row, "heading"), body: toFont(row, "body") };
}

/** Inline style for <html>, layered over the site's own palette and
 *  typography: any role or font the theme lacks keeps the site's value. */
export function designThemeStyle(theme: DesignTheme): CSSProperties {
  const style: Record<string, string> = {};
  for (const [name, role] of COLOR_VARS) {
    if (theme.colors[role]) style[name] = theme.colors[role];
  }
  if (theme.heading) style["--font-display"] = `"${theme.heading.family}", ${theme.heading.fallback}`;
  if (theme.body) style["--font-body"] = `"${theme.body.family}", ${theme.body.fallback}`;
  return style as CSSProperties;
}

/** @font-face rules for the theme's fonts, served from the public
 *  design-fonts bucket (browsers never contact Google for these). */
export function designThemeFontFaces(theme: DesignTheme, supabaseUrl: string): string {
  const base = `${supabaseUrl.replace(/\/+$/, "")}/storage/v1/object/public/design-fonts/`;
  const fonts = [theme.heading, theme.body].filter((f): f is DesignThemeFont => f !== null);
  const seen = new Set<string>();
  const rules: string[] = [];
  for (const font of fonts) {
    if (seen.has(font.family)) continue;
    seen.add(font.family);
    for (const f of font.files) {
      rules.push(
        `@font-face { font-family: "${font.family}"; src: url("${base}${f.path}") format("${f.format}"); font-weight: ${f.weight}; font-style: ${f.style}; font-display: swap;${f.unicode_range ? ` unicode-range: ${f.unicode_range};` : ""} }`,
      );
    }
  }
  return rules.join("\n");
}
