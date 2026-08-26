import Image from "next/image";
import type { ProjectImage } from "@/lib/types";
import { positionToObjectPosition } from "@/lib/image-position";
import { sortedImages } from "@/lib/project-helpers";

/**
 * Note on sizing: the brief specifies `max-h` for each orientation, but
 * `object-position` only has a visible effect once the box has a fixed
 * height to crop against — a soft `max-height` with `height: auto` never
 * overflows, so nothing gets cropped and the position picker would do
 * nothing. Using the given values as fixed heights (not caps) is what
 * makes the feature actually work.
 */
export function Gallery({ images }: { images: ProjectImage[] }) {
  const ordered = sortedImages(images);

  return (
    <div className="flex flex-col gap-8 px-4 sm:px-8">
      {ordered.map((img) => (
        <figure
          key={img.id}
          className={
            img.image_orientation === "landscape"
              ? "w-full"
              : "mx-auto w-full max-w-[600px]"
          }
        >
          <div
            className={
              img.image_orientation === "landscape"
                ? "relative h-[60vh] w-full overflow-hidden"
                : "relative h-[80vh] w-full overflow-hidden"
            }
          >
            <Image
              src={img.image_url}
              alt={img.caption ?? ""}
              fill
              sizes={img.image_orientation === "landscape" ? "100vw" : "600px"}
              style={{ objectPosition: positionToObjectPosition(img.image_position) }}
              className="object-cover"
            />
          </div>
          {img.caption && (
            <figcaption className="mt-2 text-sm text-brand-ink-muted">
              {img.caption}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}
