"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { saveProject, deleteProjectImage } from "@/actions/projects";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/slug";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TagInput } from "@/components/admin/tag-input";
import { ImageUploader } from "@/components/admin/image-uploader";
import { ImageList } from "@/components/admin/image-list";
import type { EditableImage, Project } from "@/lib/types";

const BUCKET = "project-images";

export function ProjectForm({
  initialProject,
  initialImages = [],
}: {
  initialProject?: Project;
  initialImages?: EditableImage[];
}) {
  const router = useRouter();

  const [id, setId] = useState(initialProject?.id ?? "");
  useEffect(() => {
    if (!id) setId(crypto.randomUUID());
  }, [id]);

  const [title, setTitle] = useState(initialProject?.title ?? "");
  const [slug, setSlug] = useState(initialProject?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initialProject));
  const [descriptionShort, setDescriptionShort] = useState(
    initialProject?.description_short ?? "",
  );
  const [descriptionFull, setDescriptionFull] = useState(
    initialProject?.description_full ?? "",
  );
  const [githubUrl, setGithubUrl] = useState(initialProject?.github_url ?? "");
  const [liveUrl, setLiveUrl] = useState(initialProject?.live_url ?? "");
  const [techStack, setTechStack] = useState<string[]>(initialProject?.tech_stack ?? []);
  const [isVisible, setIsVisible] = useState(initialProject?.is_visible ?? true);
  const [createdAt, setCreatedAt] = useState(
    (initialProject?.created_at ?? new Date().toISOString()).slice(0, 10),
  );
  const [images, setImages] = useState<EditableImage[]>(initialImages);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(title));
  }, [title, slugTouched]);

  function patchImage(key: string, patch: Partial<EditableImage>) {
    setImages((prev) => prev.map((img) => (img.key === key ? { ...img, ...patch } : img)));
  }

  function setFeatured(key: string) {
    setImages((prev) => prev.map((img) => ({ ...img, isFeatured: img.key === key })));
  }

  function handleUploaded(image: EditableImage) {
    setImages((prev) => [...prev, { ...image, isFeatured: prev.length === 0 }]);
  }

  async function removeImage(key: string) {
    const target = images.find((img) => img.key === key);
    if (!target) return;

    setImages((prev) => prev.filter((img) => img.key !== key));

    const supabase = createClient();
    await supabase.storage.from(BUCKET).remove([target.storagePath]);

    if (target.dbId) {
      const { error } = await deleteProjectImage(target.dbId, target.storagePath);
      if (error) toast.error(error);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!title.trim()) {
      toast.error("Le titre est requis.");
      return;
    }
    if (images.length === 0) {
      toast.error("Au moins une image est requise.");
      return;
    }

    setSaving(true);
    const { error } = await saveProject({
      id,
      title,
      slug,
      descriptionShort,
      descriptionFull,
      githubUrl,
      liveUrl,
      techStack,
      isVisible,
      createdAt: new Date(createdAt).toISOString(),
      images: images.map((img) => ({
        dbId: img.dbId,
        storagePath: img.storagePath,
        publicUrl: img.publicUrl,
        caption: img.caption,
        isFeatured: img.isFeatured,
        orientation: img.orientation,
        position: img.position,
      })),
    });
    setSaving(false);

    if (error) {
      toast.error(error);
      return;
    }

    toast.success("Projet enregistré.");
    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-10 pb-16">
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.1em] text-brand-ink-muted">
          Infos projet
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Titre</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(slugify(e.target.value));
              }}
              required
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="description_short">Description courte</Label>
          <Textarea
            id="description_short"
            value={descriptionShort}
            onChange={(e) => setDescriptionShort(e.target.value)}
            rows={2}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="description_full">Description complète</Label>
          <Textarea
            id="description_full"
            value={descriptionFull}
            onChange={(e) => setDescriptionFull(e.target.value)}
            rows={6}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="github_url">Lien GitHub</Label>
            <Input
              id="github_url"
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/..."
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="live_url">Lien live</Label>
            <Input
              id="live_url"
              type="url"
              value={liveUrl}
              onChange={(e) => setLiveUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Stack</Label>
          <TagInput tags={techStack} onChange={setTechStack} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="created_at">Date création</Label>
            <Input
              id="created_at"
              type="date"
              value={createdAt}
              onChange={(e) => setCreatedAt(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 pt-6">
            <Switch id="is_visible" checked={isVisible} onCheckedChange={setIsVisible} />
            <Label htmlFor="is_visible">Visible sur le site</Label>
          </div>
        </div>
      </section>

      <Separator />

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.1em] text-brand-ink-muted">
          Images
        </h2>
        {id && <ImageUploader projectId={id} onUploaded={handleUploaded} />}
        <ImageList
          images={images}
          onReorder={setImages}
          onPatch={patchImage}
          onSetFeatured={setFeatured}
          onRemove={removeImage}
        />
      </section>

      <div className="flex gap-3">
        <Button type="submit" disabled={saving || !id}>
          {saving ? "Enregistrement..." : "Enregistrer"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/admin">Annuler</Link>
        </Button>
      </div>
    </form>
  );
}
