import type { ProjectImage } from "@/lib/types";

/** Featured image if one is flagged, else the first by sort_order. */
export function getFeaturedImage(images: ProjectImage[]): ProjectImage | null {
  if (images.length === 0) return null;
  return images.find((img) => img.is_featured) ?? sortedImages(images)[0];
}

export function sortedImages(images: ProjectImage[]): ProjectImage[] {
  return [...images].sort((a, b) => a.sort_order - b.sort_order);
}
