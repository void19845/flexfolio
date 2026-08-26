import { createClient } from "@/lib/supabase/server";
import { SiteSettingsForm } from "@/components/admin/site-settings-form";
import type { SiteSettings } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function SiteSettingsPage() {
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif text-2xl text-brand-ink">Paramètres</h1>
      <SiteSettingsForm settings={settings as SiteSettings | null} />
    </div>
  );
}
