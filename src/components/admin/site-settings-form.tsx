"use client";

import { useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { updateSiteSettings } from "@/actions/site-settings";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { TagInput } from "@/components/admin/tag-input";
import { GalleryLayoutToggle } from "@/components/admin/gallery-layout-toggle";
import { CVEntryList } from "@/components/admin/cv-entry-list";
import { SITE, ABOUT_CONTENT, CV } from "@/lib/site-config";
import type { CVEntry, GalleryLayout, SiteSettings } from "@/lib/types";

const BUCKET = "project-images";

function PhotoField({
  label,
  currentUrl,
  field,
}: {
  label: string;
  currentUrl: string | null;
  field: "profileImageUrl" | "heroImageUrl";
}) {
  const [url, setUrl] = useState(currentUrl);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    const supabase = createClient();
    const path = `site/${field}-${crypto.randomUUID()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: "3600",
    });

    if (uploadError) {
      toast.error(uploadError.message);
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(path);

    const { error } = await updateSiteSettings({ [field]: publicUrl });
    setUploading(false);

    if (error) {
      toast.error(error);
      return;
    }

    setUrl(publicUrl);
    toast.success(`${label} mise à jour.`);
  }

  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <div className="relative h-40 w-full max-w-xs overflow-hidden bg-secondary">
        {url ? (
          <Image src={url} alt={label} fill sizes="320px" className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-brand-ink-muted">
            Aucune photo
          </div>
        )}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-fit"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? "Envoi..." : "Remplacer"}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-semibold uppercase tracking-[0.1em] text-brand-ink-muted">
      {children}
    </h2>
  );
}

export function SiteSettingsForm({ settings }: { settings: SiteSettings | null }) {
  const [siteName, setSiteName] = useState(settings?.site_name ?? SITE.name);
  const [siteRole, setSiteRole] = useState(settings?.site_role ?? SITE.role);
  const [wordmark, setWordmark] = useState(settings?.wordmark ?? SITE.wordmark);
  const [labelTopLeft, setLabelTopLeft] = useState(settings?.label_top_left ?? SITE.labelTopLeft);
  const [labelTopRight, setLabelTopRight] = useState(
    settings?.label_top_right ?? SITE.labelTopRight,
  );

  const [aboutHeading, setAboutHeading] = useState(
    settings?.about_heading ?? ABOUT_CONTENT.heading,
  );
  const [aboutParagraphs, setAboutParagraphs] = useState(
    (settings?.about_paragraphs ?? ABOUT_CONTENT.paragraphs).join("\n\n"),
  );
  const [aboutCtaLabel, setAboutCtaLabel] = useState(
    settings?.about_cta_label ?? ABOUT_CONTENT.ctaLabel,
  );

  const [galleryLayout, setGalleryLayout] = useState<GalleryLayout>(
    settings?.gallery_layout ?? "3x3",
  );

  const [experience, setExperience] = useState<CVEntry[]>(
    settings?.cv_experience ?? CV.experience,
  );
  const [education, setEducation] = useState<CVEntry[]>(settings?.cv_education ?? CV.education);
  const [skills, setSkills] = useState<string[]>(settings?.cv_skills ?? CV.skills);
  const [software, setSoftware] = useState<string[]>(settings?.cv_software ?? CV.software);
  const [languages, setLanguages] = useState<string[]>(settings?.cv_languages ?? CV.languages);

  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);

    const { error } = await updateSiteSettings({
      siteName,
      siteRole,
      wordmark,
      labelTopLeft,
      labelTopRight,
      aboutHeading,
      aboutParagraphs: aboutParagraphs
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean),
      aboutCtaLabel,
      galleryLayout,
      cvExperience: experience,
      cvEducation: education,
      cvSkills: skills,
      cvSoftware: software,
      cvLanguages: languages,
    });

    setSaving(false);

    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Paramètres enregistrés.");
  }

  return (
    <div className="flex flex-col gap-10 pb-16">
      <section className="flex flex-col gap-4">
        <SectionHeading>Photos</SectionHeading>
        <div className="grid gap-8 sm:grid-cols-2">
          <PhotoField
            label="Photo de profil (page About)"
            currentUrl={settings?.profile_image_url ?? null}
            field="profileImageUrl"
          />
          <PhotoField
            label="Photo hero (page d'accueil)"
            currentUrl={settings?.hero_image_url ?? null}
            field="heroImageUrl"
          />
        </div>
      </section>

      <Separator />

      <form onSubmit={handleSubmit} className="flex flex-col gap-10">
        <section className="flex flex-col gap-4">
          <SectionHeading>Identité</SectionHeading>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="site_name">Prénom Nom</Label>
              <Input id="site_name" value={siteName} onChange={(e) => setSiteName(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="site_role">Rôle / activité</Label>
              <Input id="site_role" value={siteRole} onChange={(e) => setSiteRole(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="wordmark">Wordmark (grand titre accueil)</Label>
              <Input id="wordmark" value={wordmark} onChange={(e) => setWordmark(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="label_top_left">Label haut gauche (hero)</Label>
              <Input
                id="label_top_left"
                value={labelTopLeft}
                onChange={(e) => setLabelTopLeft(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="label_top_right">Label haut droite (hero)</Label>
              <Input
                id="label_top_right"
                value={labelTopRight}
                onChange={(e) => setLabelTopRight(e.target.value)}
              />
            </div>
          </div>
        </section>

        <Separator />

        <section className="flex flex-col gap-4">
          <SectionHeading>About</SectionHeading>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="about_heading">Titre</Label>
            <Input
              id="about_heading"
              value={aboutHeading}
              onChange={(e) => setAboutHeading(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="about_paragraphs">
              Texte (un paragraphe par bloc, séparés par une ligne vide)
            </Label>
            <Textarea
              id="about_paragraphs"
              value={aboutParagraphs}
              onChange={(e) => setAboutParagraphs(e.target.value)}
              rows={10}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="about_cta_label">Texte du lien vers le portfolio</Label>
            <Input
              id="about_cta_label"
              value={aboutCtaLabel}
              onChange={(e) => setAboutCtaLabel(e.target.value)}
            />
          </div>
        </section>

        <Separator />

        <section className="flex flex-col gap-4">
          <SectionHeading>Disposition de la galerie projet</SectionHeading>
          <p className="text-sm text-brand-ink-muted">
            S&apos;applique à la galerie de chaque page projet — 3 colonnes dans les deux cas,
            change le format et la densité des vignettes.
          </p>
          <GalleryLayoutToggle value={galleryLayout} onChange={setGalleryLayout} />
        </section>

        <Separator />

        <section className="flex flex-col gap-6">
          <div>
            <SectionHeading>CV (carte About)</SectionHeading>
            <p className="mt-1 text-sm text-brand-ink-muted">
              Utilise le Prénom Nom et le rôle définis dans « Identité » ci-dessus.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Expériences professionnelles</Label>
            <CVEntryList
              entries={experience}
              onChange={setExperience}
              addLabel="Ajouter une expérience"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Formation</Label>
            <CVEntryList entries={education} onChange={setEducation} addLabel="Ajouter une formation" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Compétences</Label>
            <TagInput tags={skills} onChange={setSkills} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Logiciels</Label>
            <TagInput tags={software} onChange={setSoftware} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Langues</Label>
            <TagInput tags={languages} onChange={setLanguages} />
          </div>
        </section>

        <div>
          <Button type="submit" disabled={saving}>
            {saving ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </form>
    </div>
  );
}
