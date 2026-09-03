import type { ProjectImage } from "@/lib/types";

/** Featured image if one is flagged, else the first by sort_order. */
export function getFeaturedImage(images: ProjectImage[]): ProjectImage | null {
  if (images.length === 0) return null;
  return images.find((img) => img.is_featured) ?? sortedImages(images)[0];
}

export function sortedImages(images: ProjectImage[]): ProjectImage[] {
  return [...images].sort((a, b) => a.sort_order - b.sort_order);
}

/** "2025-09-15T00:00:00+00:00" → "septembre 2025", for the project-card
 *  hover. `fr-FR` already lowercases the month name, matching how dates
 *  are written in running French text (unlike the title above it). */
export function formatProjectDate(isoDate: string): string {
  return new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(
    new Date(isoDate),
  );
}
