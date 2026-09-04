"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { PencilIcon, GripHorizontalIcon } from "lucide-react";
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
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { VisibilityToggle } from "@/components/admin/visibility-toggle";
import { DeleteProjectButton } from "@/components/admin/delete-project-button";
import { reorderProjects } from "@/actions/projects";
import { cn } from "@/lib/utils";
import type { ProjectWithImages } from "@/lib/types";

function SortableProjectRow({
  project,
  dragDisabled,
}: {
  project: ProjectWithImages;
  dragDisabled: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: project.id,
  });

  return (
    <TableRow
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(isDragging && "relative z-10 bg-secondary/60")}
    >
      <TableCell className="w-8 px-2">
        <button
          type="button"
          className="cursor-grab touch-none text-brand-ink-muted active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Réordonner"
          disabled={dragDisabled}
          {...attributes}
          {...listeners}
        >
          <GripHorizontalIcon className="h-4 w-4" />
        </button>
      </TableCell>
      <TableCell className="font-medium">{project.title}</TableCell>
      <TableCell className="text-brand-ink-muted">
        {new Date(project.created_at).toLocaleDateString("fr-FR")}
      </TableCell>
      <TableCell className="text-brand-ink-muted">{project.project_images.length}</TableCell>
      <TableCell>
        <VisibilityToggle id={project.id} isVisible={project.is_visible} />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          <Button type="button" variant="ghost" size="icon" asChild>
            <Link href={`/admin/projets/${project.id}/edit`} aria-label="Éditer">
              <PencilIcon className="h-4 w-4" />
            </Link>
          </Button>
          <DeleteProjectButton id={project.id} title={project.title} />
        </div>
      </TableCell>
    </TableRow>
  );
}

export function ProjectsTable({ projects: initialProjects }: { projects: ProjectWithImages[] }) {
  const [projects, setProjects] = useState(initialProjects);
  const [prevInitialProjects, setPrevInitialProjects] = useState(initialProjects);
  const [pending, startTransition] = useTransition();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  // Re-sync when the server gives us a fresh list (after a delete, a
  // revalidated reorder, etc.) — adjusted during render rather than in an
  // effect, per React's guidance for state derived from a changed prop.
  // This component only owns local state during an in-flight drag.
  if (initialProjects !== prevInitialProjects) {
    setPrevInitialProjects(initialProjects);
    setProjects(initialProjects);
  }

  if (initialProjects.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-brand-ink-muted">
        Aucun projet pour l&apos;instant — crée le premier.
      </p>
    );
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = projects.findIndex((p) => p.id === active.id);
    const newIndex = projects.findIndex((p) => p.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(projects, oldIndex, newIndex);
    setProjects(reordered);

    startTransition(async () => {
      const { error } = await reorderProjects(reordered.map((p) => p.id));
      if (error) {
        toast.error(error);
        setProjects(initialProjects);
      }
    });
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8 px-2" aria-hidden="true" />
            <TableHead>Titre</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Images</TableHead>
            <TableHead>Visible</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <SortableContext
            items={projects.map((p) => p.id)}
            strategy={verticalListSortingStrategy}
          >
            {projects.map((project) => (
              <SortableProjectRow key={project.id} project={project} dragDisabled={pending} />
            ))}
          </SortableContext>
        </TableBody>
      </Table>
    </DndContext>
  );
}
