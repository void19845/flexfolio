"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { updateSiteSettings } from "@/actions/site-settings";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { SiteSettings } from "@/lib/types";

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

export function SiteSettingsForm({ settings }: { settings: SiteSettings | null }) {
  return (
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
  );
}
