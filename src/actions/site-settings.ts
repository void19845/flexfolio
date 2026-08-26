"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateSiteSettings(input: {
  profileImageUrl?: string | null;
  heroImageUrl?: string | null;
}): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const patch: Record<string, string | null> = {};
  if (input.profileImageUrl !== undefined) patch.profile_image_url = input.profileImageUrl;
  if (input.heroImageUrl !== undefined) patch.hero_image_url = input.heroImageUrl;

  const { error } = await supabase.from("site_settings").update(patch).eq("id", 1);
  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/admin/parametres");
  return { error: null };
}
