import { createClient } from "@/lib/supabase/server";
import { HeroSection } from "@/components/hero-section";
import { ProjectGrid } from "@/components/project-grid";
import { SITE } from "@/lib/site-config";
import type { ProjectWithImages, SiteSettings } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: projects }, { data: settingsData }] = await Promise.all([
    supabase
      .from("projects")
      .select("*, project_images(*)")
      .eq("is_visible", true)
      .order("created_at", { ascending: true })
      .order("display_order", { ascending: true }),
    supabase.from("site_settings").select("*").eq("id", 1).maybeSingle(),
  ]);

  const settings = settingsData as SiteSettings | null;

  return (
    <>
      <HeroSection
        labelLeft={settings?.label_top_left ?? SITE.labelTopLeft}
        labelRight={settings?.label_top_right ?? SITE.labelTopRight}
        wordmark={settings?.wordmark ?? SITE.wordmark}
        name={settings?.site_name ?? SITE.name}
        imageUrl={settings?.hero_image_url ?? null}
      />
      <ProjectGrid projects={(projects as ProjectWithImages[] | null) ?? []} />
    </>
  );
}
