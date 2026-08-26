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
  horizontalListSortingStrategy,
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
      <SortableContext items={images.map((img) => img.key)} strategy={horizontalListSortingStrategy}>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {images.map((image) => (
            <ImageCard
              key={image.key}
              image={image}
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
