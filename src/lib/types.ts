export type ImageOrientation = "portrait" | "landscape";

export type ImagePosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "center-left"
  | "center"
  | "center-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export const IMAGE_POSITIONS: ImagePosition[] = [
  "top-left",
  "top-center",
  "top-right",
  "center-left",
  "center",
  "center-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
];

/** Gallery grid disposition on a project page: 3 columns either way,
 *  "3x2" uses a 3:2 (classic photo) aspect ratio per thumbnail, "3x3" a
 *  square one — see GALLERY_LAYOUT_LABELS for the admin-facing copy. */
export type GalleryLayout = "3x2" | "3x3";

export const GALLERY_LAYOUTS: GalleryLayout[] = ["3x2", "3x3"];

/** Title/body font pairing for the whole site — title role covers the nav
 *  name, page headings and the hero wordmark; body role covers running
 *  text, eyebrow labels, and (deliberately, per spec) the hero
 *  first/last name. Each option is preloaded via next/font/google in
 *  layout.tsx, since that API can't fetch an arbitrary font at runtime —
 *  see TITLE_FONT_VARS / BODY_FONT_VARS for the CSS variable each one
 *  resolves to. */
export type TitleFont = "playfair-display" | "give-you-glory";
export type BodyFont = "inter" | "quicksand";

export const TITLE_FONTS: TitleFont[] = ["playfair-display", "give-you-glory"];
export const BODY_FONTS: BodyFont[] = ["inter", "quicksand"];

export const TITLE_FONT_LABELS: Record<TitleFont, string> = {
  "playfair-display": "Playfair Display",
  "give-you-glory": "Give You Glory",
};

export const BODY_FONT_LABELS: Record<BodyFont, string> = {
  inter: "Inter",
  quicksand: "Quicksand",
};

/** Bare custom-property names (no `var()` wrapper) — must match the
 *  `variable:` option passed to each font loader in layout.tsx exactly. */
export const TITLE_FONT_VARS: Record<TitleFont, string> = {
  "playfair-display": "--font-display-playfair-display",
  "give-you-glory": "--font-display-give-you-glory",
};

export const BODY_FONT_VARS: Record<BodyFont, string> = {
  inter: "--font-body-inter",
  quicksand: "--font-body-quicksand",
};

export interface SocialLink {
  label: string;
  url: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  description_short: string | null;
  description_full: string | null;
  github_url: string | null;
  live_url: string | null;
  tech_stack: string[];
  created_at: string;
  updated_at: string;
  is_visible: boolean;
  display_order: number;
}

export interface ProjectImage {
  id: string;
  project_id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
  is_featured: boolean;
  image_orientation: ImageOrientation;
  image_position: ImagePosition;
  created_at: string;
}

export interface ProjectWithImages extends Project {
  project_images: ProjectImage[];
}

export interface SiteSettings {
  id: number;
  profile_image_url: string | null;
  hero_image_url: string | null;
  site_name: string;
  site_role: string;
  label_top_left: string;
  label_top_right: string;
  wordmark: string;
  about_heading: string;
  about_paragraphs: string[];
  about_cta_label: string;
  gallery_layout: GalleryLayout;
  cv_pdf_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  social_links: SocialLink[];
  palette_bg: string;
  palette_ink: string;
  palette_card: string;
  palette_accent: string;
  font_title: TitleFont;
  font_body: BodyFont;
  updated_at: string;
}

/** Shape used by the admin form while an image is being staged, before or
 *  after it has a matching `project_images` row. */
export interface EditableImage {
  /** Client-side key, stable across the editing session (dnd-kit id, React key). */
  key: string;
  /** Present once the row exists in `project_images`. */
  dbId?: string;
  storagePath: string;
  publicUrl: string;
  fileName: string;
  caption: string;
  isFeatured: boolean;
  orientation: ImageOrientation;
  position: ImagePosition;
}
