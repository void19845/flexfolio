import Link from "next/link";
import { PencilIcon } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { VisibilityToggle } from "@/components/admin/visibility-toggle";
import { DeleteProjectButton } from "@/components/admin/delete-project-button";
import type { ProjectWithImages } from "@/lib/types";

export function ProjectsTable({ projects }: { projects: ProjectWithImages[] }) {
  if (projects.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-brand-ink-muted">
        Aucun projet pour l&apos;instant — crée le premier.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Titre</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Images</TableHead>
          <TableHead>Visible</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.map((project) => (
          <TableRow key={project.id}>
            <TableCell className="font-medium">{project.title}</TableCell>
            <TableCell className="text-brand-ink-muted">
              {new Date(project.created_at).toLocaleDateString("fr-FR")}
            </TableCell>
            <TableCell className="text-brand-ink-muted">
              {project.project_images.length}
            </TableCell>
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
        ))}
      </TableBody>
    </Table>
  );
}
