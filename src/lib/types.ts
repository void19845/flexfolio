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
