import { cn } from "@/lib/utils";

/**
 * Same segmented-toggle pattern as GalleryLayoutToggle, made generic since
 * it's used twice here (title font, body font) with different option
 * sets. Each button previews its own font live via `previewVars` — the
 * CSS variable it points to is one of the ones next/font/google preloads
 * in layout.tsx, so no extra fetch is needed to show it.
 */
export function FontToggle<T extends string>({
  ariaLabel,
  options,
  labels,
  previewVars,
  value,
  onChange,
}: {
  ariaLabel: string;
  options: readonly T[];
  labels: Record<T, string>;
  previewVars: Record<T, string>;
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex w-fit flex-wrap gap-2" role="radiogroup" aria-label={ariaLabel}>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          role="radio"
          aria-checked={value === option}
          onClick={() => onChange(option)}
          style={{ fontFamily: `var(${previewVars[option]})` }}
          className={cn(
            "border border-border px-4 py-2.5 text-base transition-colors",
            value === option
              ? "bg-brand-accent text-brand-card-foreground"
              : "bg-secondary text-brand-ink hover:bg-muted",
          )}
        >
          {labels[option]}
        </button>
      ))}
    </div>
  );
}
