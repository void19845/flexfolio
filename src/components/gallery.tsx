"use client";

import { useState } from "react";
import Image from "next/image";
import type { GalleryLayout, ProjectImage } from "@/lib/types";
import { positionToObjectPosition } from "@/lib/image-position";
import { sortedImages } from "@/lib/project-helpers";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

/**
 * Note on sizing: like the old single-column version, `object-position`
 * only crops visibly once the box has a real height to crop against — an
 * `aspect-*` box on the wrapper (rather than a soft max-height) is what
 * makes it overflow and lets the position picker actually do something.
 *
 * `layout` picks the grid's density: "3x3" is a square thumbnail, "3x2" a
 * 3:2 (classic photo) ratio — both stay at 3 columns, so a full row shows
 * 3 photos and a typical viewport shows ~6 to ~9 before scrolling.
 */
export function Gallery({ images, layout }: { images: ProjectImage[]; layout: GalleryLayout }) {
  const ordered = sortedImages(images);
  const [openImage, setOpenImage] = useState<ProjectImage | null>(null);

  const aspectClass = layout === "3x2" ? "aspect-[3/2]" : "aspect-square";

  return (
    <>
      <div className="grid grid-cols-3 gap-1 px-4 sm:gap-2 sm:px-8">
        {ordered.map((img) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setOpenImage(img)}
            aria-label={img.caption ? `Agrandir : ${img.caption}` : "Agrandir l'image"}
            className={`group relative ${aspectClass} w-full overflow-hidden bg-secondary`}
          >
            <Image
              src={img.image_url}
              alt={img.caption ?? ""}
              fill
              sizes="33vw"
              style={{ objectPosition: positionToObjectPosition(img.image_position) }}
              className="object-cover transition-transform duration-[400ms] ease-out group-hover:scale-[1.03]"
            />
            {img.caption && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span className="line-clamp-1 text-left text-[11px] text-white">
                  {img.caption}
                </span>
              </div>
            )}
          </button>
        ))}
      </div>

      <Dialog open={openImage !== null} onOpenChange={(open) => !open && setOpenImage(null)}>
        <DialogContent className="max-w-[95vw] border-none bg-transparent p-0 shadow-none sm:max-w-[95vw]">
          {openImage && (
            <figure className="flex flex-col items-center gap-3">
              <DialogTitle className="sr-only">
                {openImage.caption || "Image agrandie"}
              </DialogTitle>
              {/* Natural sizing, not `fill`: the image keeps its real aspect
                  ratio and is only ever scaled down (never cropped) to fit
                  inside the viewport bounds below. */}
              <Image
                src={openImage.image_url}
                alt={openImage.caption ?? ""}
                width={openImage.image_orientation === "portrait" ? 1000 : 1600}
                height={openImage.image_orientation === "portrait" ? 1600 : 1000}
                sizes="90vw"
                className="h-auto max-h-[85vh] w-auto max-w-full object-contain"
              />
              {openImage.caption && (
                <figcaption className="text-center text-sm text-white">
                  {openImage.caption}
                </figcaption>
              )}
            </figure>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
