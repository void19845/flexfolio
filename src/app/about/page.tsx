import { createClient } from "@/lib/supabase/server";
import { AboutSection } from "@/components/about-section";
import type { SiteSettings } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  return (
    <AboutSection
      profileImageUrl={(settings as SiteSettings | null)?.profile_image_url ?? null}
    />
  );
}
