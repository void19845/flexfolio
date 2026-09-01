"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { ImageCard } from "@/components/admin/image-card";
import type { EditableImage } from "@/lib/types";

export function ImageList({
  images,
  onReorder,
  onPatch,
  onSetFeatured,
  onRemove,
}: {
  images: EditableImage[];
  onReorder: (images: EditableImage[]) => void;
  onPatch: (key: string, patch: Partial<EditableImage>) => void;
  onSetFeatured: (key: string) => void;
  onRemove: (key: string) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = images.findIndex((img) => img.key === active.id);
    const newIndex = images.findIndex((img) => img.key === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    onReorder(arrayMove(images, oldIndex, newIndex));
  }

  if (images.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-border p-6 text-center text-sm text-brand-ink-muted">
        Aucune image pour l&apos;instant.
      </p>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      {/* Grid mirrors the public gallery's own 3-column layout (see
          Gallery in components/gallery.tsx) so reordering here shows
          directly where each photo will land on the site — no more
          guessing how a 1-row list maps onto a multi-row grid. */}
      <SortableContext items={images.map((img) => img.key)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {images.map((image, index) => (
            <ImageCard
              key={image.key}
              image={image}
              position={index + 1}
              onPatch={onPatch}
              onSetFeatured={onSetFeatured}
              onRemove={onRemove}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
