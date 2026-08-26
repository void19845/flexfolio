import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProjectForm } from "@/components/admin/project-form";
import { extractStoragePath, fileNameFromStoragePath } from "@/lib/storage-path";
import type { EditableImage, ProjectWithImages } from "@/lib/types";

export const dynamic = "force-dynamic";

const BUCKET = "project-images";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("*, project_images(*)")
    .eq("id", id)
    .maybeSingle();

  if (!project) notFound();

  const p = project as ProjectWithImages;
  const initialImages: EditableImage[] = [...p.project_images]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((img) => {
      const storagePath = extractStoragePath(img.image_url, BUCKET);
      return {
        key: img.id,
        dbId: img.id,
        storagePath,
        publicUrl: img.image_url,
        fileName: fileNameFromStoragePath(storagePath),
        caption: img.caption ?? "",
        isFeatured: img.is_featured,
        orientation: img.image_orientation,
        position: img.image_position,
      };
    });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif text-2xl text-brand-ink">Éditer « {p.title} »</h1>
      <ProjectForm initialProject={p} initialImages={initialImages} />
    </div>
  );
}
