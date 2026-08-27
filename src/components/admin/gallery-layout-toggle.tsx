import { GALLERY_LAYOUTS, type GalleryLayout } from "@/lib/types";
import { cn } from "@/lib/utils";

const LABELS: Record<GalleryLayout, string> = {
  "3x2": "3 × 2 — vignettes 3:2",
  "3x3": "3 × 3 — vignettes carrées",
};

export function GalleryLayoutToggle({
  value,
  onChange,
}: {
  value: GalleryLayout;
  onChange: (layout: GalleryLayout) => void;
}) {
  return (
    <div className="flex w-fit gap-2" role="radiogroup" aria-label="Disposition de la galerie">
      {GALLERY_LAYOUTS.map((layout) => (
        <button
          key={layout}
          type="button"
          role="radio"
          aria-checked={value === layout}
          onClick={() => onChange(layout)}
          className={cn(
            "border border-border px-4 py-2 text-sm transition-colors",
            value === layout
              ? "bg-brand-accent text-brand-card-foreground"
              : "bg-secondary text-brand-ink hover:bg-muted",
          )}
        >
          {LABELS[layout]}
        </button>
      ))}
    </div>
  );
}
