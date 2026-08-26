import { createClient } from "@/lib/supabase/server";
import { HeroSection } from "@/components/hero-section";
import { ProjectGrid } from "@/components/project-grid";
import { SITE } from "@/lib/site-config";
import type { ProjectWithImages, SiteSettings } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: projects }, { data: settings }] = await Promise.all([
    supabase
      .from("projects")
      .select("*, project_images(*)")
      .eq("is_visible", true)
      .order("created_at", { ascending: true })
      .order("display_order", { ascending: true }),
    supabase.from("site_settings").select("*").eq("id", 1).maybeSingle(),
  ]);

  return (
    <>
      <HeroSection
        labelLeft={SITE.labelTopLeft}
        labelRight={SITE.labelTopRight}
        wordmark={SITE.wordmark}
        name={SITE.name}
        imageUrl={(settings as SiteSettings | null)?.hero_image_url ?? null}
      />
      <ProjectGrid projects={(projects as ProjectWithImages[] | null) ?? []} />
    </>
  );
}
