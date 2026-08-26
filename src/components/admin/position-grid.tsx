import { POSITION_GRID_LABELS } from "@/lib/image-position";
import { IMAGE_POSITIONS, type ImagePosition } from "@/lib/types";
import { cn } from "@/lib/utils";

export function PositionGrid({
  value,
  onChange,
}: {
  value: ImagePosition;
  onChange: (position: ImagePosition) => void;
}) {
  return (
    <div className="grid w-fit grid-cols-3 gap-1" role="radiogroup" aria-label="Position de l'image">
      {IMAGE_POSITIONS.map((position) => (
        <button
          key={position}
          type="button"
          role="radio"
          aria-checked={value === position}
          title={POSITION_GRID_LABELS[position]}
          onClick={() => onChange(position)}
          className={cn(
            "h-6 w-6 border border-border transition-colors",
            value === position ? "bg-brand-accent" : "bg-secondary hover:bg-muted",
          )}
        />
      ))}
    </div>
  );
}
