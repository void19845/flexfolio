import { createClient } from "@/lib/supabase/server";
import { AboutSection } from "@/components/about-section";
import { SITE, ABOUT_CONTENT, CV } from "@/lib/site-config";
import type { SiteSettings } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
  const settings = data as SiteSettings | null;

  return (
    <AboutSection
      profileImageUrl={settings?.profile_image_url ?? null}
      heading={settings?.about_heading ?? ABOUT_CONTENT.heading}
      paragraphs={settings?.about_paragraphs ?? ABOUT_CONTENT.paragraphs}
      ctaLabel={settings?.about_cta_label ?? ABOUT_CONTENT.ctaLabel}
      ctaHref={ABOUT_CONTENT.ctaHref}
      cvName={settings?.site_name ?? SITE.name}
      cvSubtitle={settings?.site_role ?? SITE.role}
      experience={settings?.cv_experience ?? CV.experience}
      education={settings?.cv_education ?? CV.education}
      skills={settings?.cv_skills ?? CV.skills}
      software={settings?.cv_software ?? CV.software}
      languages={settings?.cv_languages ?? CV.languages}
    />
  );
}
