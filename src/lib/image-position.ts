import type { ImagePosition } from "@/lib/types";

const OBJECT_POSITION: Record<ImagePosition, string> = {
  "top-left": "left top",
  "top-center": "center top",
  "top-right": "right top",
  "center-left": "left center",
  center: "center",
  "center-right": "right center",
  "bottom-left": "left bottom",
  "bottom-center": "center bottom",
  "bottom-right": "right bottom",
};

/** DB value ('top-left', ...) -> CSS `object-position` keyword pair. */
export function positionToObjectPosition(position: ImagePosition): string {
  return OBJECT_POSITION[position] ?? "center";
}

export const POSITION_GRID_LABELS: Record<ImagePosition, string> = {
  "top-left": "Haut gauche",
  "top-center": "Haut centre",
  "top-right": "Haut droite",
  "center-left": "Centre gauche",
  center: "Centre",
  "center-right": "Centre droite",
  "bottom-left": "Bas gauche",
  "bottom-center": "Bas centre",
  "bottom-right": "Bas droite",
};
