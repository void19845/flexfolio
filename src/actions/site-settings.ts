"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { CVEntry, GalleryLayout } from "@/lib/types";

export async function updateSiteSettings(input: {
  profileImageUrl?: string | null;
  heroImageUrl?: string | null;
  siteName?: string;
  siteRole?: string;
  labelTopLeft?: string;
  labelTopRight?: string;
  wordmark?: string;
  aboutHeading?: string;
  aboutParagraphs?: string[];
  aboutCtaLabel?: string;
  galleryLayout?: GalleryLayout;
  cvExperience?: CVEntry[];
  cvEducation?: CVEntry[];
  cvSkills?: string[];
  cvSoftware?: string[];
  cvLanguages?: string[];
}): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const patch: Record<string, unknown> = {};
  if (input.profileImageUrl !== undefined) patch.profile_image_url = input.profileImageUrl;
  if (input.heroImageUrl !== undefined) patch.hero_image_url = input.heroImageUrl;
  if (input.siteName !== undefined) patch.site_name = input.siteName;
  if (input.siteRole !== undefined) patch.site_role = input.siteRole;
  if (input.labelTopLeft !== undefined) patch.label_top_left = input.labelTopLeft;
  if (input.labelTopRight !== undefined) patch.label_top_right = input.labelTopRight;
  if (input.wordmark !== undefined) patch.wordmark = input.wordmark;
  if (input.aboutHeading !== undefined) patch.about_heading = input.aboutHeading;
  if (input.aboutParagraphs !== undefined) patch.about_paragraphs = input.aboutParagraphs;
  if (input.aboutCtaLabel !== undefined) patch.about_cta_label = input.aboutCtaLabel;
  if (input.galleryLayout !== undefined) patch.gallery_layout = input.galleryLayout;
  if (input.cvExperience !== undefined) patch.cv_experience = input.cvExperience;
  if (input.cvEducation !== undefined) patch.cv_education = input.cvEducation;
  if (input.cvSkills !== undefined) patch.cv_skills = input.cvSkills;
  if (input.cvSoftware !== undefined) patch.cv_software = input.cvSoftware;
  if (input.cvLanguages !== undefined) patch.cv_languages = input.cvLanguages;

  const { error } = await supabase.from("site_settings").update(patch).eq("id", 1);
  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/admin/parametres");
  return { error: null };
}
