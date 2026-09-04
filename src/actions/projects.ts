"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ImageOrientation, ImagePosition } from "@/lib/types";

const BUCKET = "project-images";

export interface SaveProjectImageInput {
  dbId?: string;
  storagePath: string;
  publicUrl: string;
  caption: string;
  isFeatured: boolean;
  orientation: ImageOrientation;
  position: ImagePosition;
}

export interface SaveProjectInput {
  id: string;
  title: string;
  slug: string;
  descriptionShort: string;
  descriptionFull: string;
  githubUrl: string;
  liveUrl: string;
  techStack: string[];
  isVisible: boolean;
  createdAt: string;
  images: SaveProjectImageInput[];
}

export async function saveProject(
  input: SaveProjectInput,
): Promise<{ error: string | null }> {
  const title = input.title.trim();
  const slug = input.slug.trim();

  if (!title) return { error: "Le titre est requis." };
  if (!slug) return { error: "Le slug est requis." };
  if (input.images.length === 0) {
    return { error: "Au moins une image est requise." };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Session expirée, reconnecte-toi." };

  const featuredIndex = Math.max(
    0,
    input.images.findIndex((img) => img.isFeatured),
  );

  const { error: projectError } = await supabase.from("projects").upsert({
    id: input.id,
    title,
    slug,
    description_short: input.descriptionShort.trim() || null,
    description_full: input.descriptionFull.trim() || null,
    github_url: input.githubUrl.trim() || null,
    live_url: input.liveUrl.trim() || null,
    tech_stack: input.techStack,
    is_visible: input.isVisible,
    created_at: input.createdAt,
  });

  if (projectError) {
    if (projectError.code === "23505") {
      return { error: "Ce slug est déjà utilisé par un autre projet." };
    }
    return { error: `Erreur lors de l'enregistrement : ${projectError.message}` };
  }

  // Clear every "featured" flag first so the one-featured-per-project
  // unique index is never transiently violated while we reassign it.
  const { error: clearError } = await supabase
    .from("project_images")
    .update({ is_featured: false })
    .eq("project_id", input.id);
  if (clearError) {
    return { error: `Erreur lors de la mise à jour des images : ${clearError.message}` };
  }

  // Safety-net reconciliation: remove any DB row no longer present in the
  // submitted list (normally already handled by the immediate per-image
  // delete action, but this keeps `save` correct on its own).
  const keptDbIds = input.images.map((img) => img.dbId).filter(Boolean) as string[];
  const { data: existingRows } = await supabase
    .from("project_images")
    .select("id")
    .eq("project_id", input.id);
  const staleIds = (existingRows ?? [])
    .map((row) => row.id as string)
    .filter((id) => !keptDbIds.includes(id));
  if (staleIds.length > 0) {
    await supabase.from("project_images").delete().in("id", staleIds);
  }

  for (const [index, img] of input.images.entries()) {
    const row = {
      project_id: input.id,
      image_url: img.publicUrl,
      caption: img.caption.trim() || null,
      sort_order: index,
      is_featured: index === featuredIndex,
      image_orientation: img.orientation,
      image_position: img.position,
    };

    const { error } = img.dbId
      ? await supabase.from("project_images").update(row).eq("id", img.dbId)
      : await supabase.from("project_images").insert(row);

    if (error) return { error: `Erreur sur une image : ${error.message}` };
  }

  revalidatePath("/");
  revalidatePath(`/projets/${slug}`);
  revalidatePath("/admin");

  return { error: null };
}

export async function deleteProject(id: string): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const { data: files } = await supabase.storage.from(BUCKET).list(`projects/${id}`);
  if (files && files.length > 0) {
    await supabase.storage
      .from(BUCKET)
      .remove(files.map((f) => `projects/${id}/${f.name}`));
  }

  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/admin");
  return { error: null };
}

/** Persists a new project order after a drag-and-drop reorder in the admin
 *  table. `orderedIds` is the full list of project ids in their new
 *  display order — index in the array becomes the new `display_order`. */
export async function reorderProjects(orderedIds: string[]): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Session expirée, reconnecte-toi." };

  const updates = orderedIds.map((id, index) =>
    supabase.from("projects").update({ display_order: index }).eq("id", id),
  );
  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);
  if (failed?.error) return { error: `Erreur lors du réordonnancement : ${failed.error.message}` };

  revalidatePath("/");
  revalidatePath("/admin");
  return { error: null };
}

export async function toggleVisibility(
  id: string,
  isVisible: boolean,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .update({ is_visible: isVisible })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/admin");
  return { error: null };
}

/** Removes one already-persisted image (storage object + row) immediately,
 *  independent of the form's save/cancel flow. */
export async function deleteProjectImage(
  dbId: string,
  storagePath: string,
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  await supabase.storage.from(BUCKET).remove([storagePath]);

  const { error } = await supabase.from("project_images").delete().eq("id", dbId);
  if (error) return { error: error.message };

  revalidatePath("/admin");
  return { error: null };
}
