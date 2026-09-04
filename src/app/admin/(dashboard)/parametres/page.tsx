import { createClient } from "@/lib/supabase/server";
import { SiteSettingsForm } from "@/components/admin/site-settings-form";
import { TwoFactorSettings } from "@/components/admin/two-factor-settings";
import { Separator } from "@/components/ui/separator";
import { listVerifiedMfaFactors } from "@/actions/mfa";
import type { SiteSettings } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function SiteSettingsPage() {
  const supabase = await createClient();
  const [{ data: settings }, mfaFactors] = await Promise.all([
    supabase.from("site_settings").select("*").eq("id", 1).maybeSingle(),
    listVerifiedMfaFactors(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif text-2xl text-brand-ink">Paramètres</h1>
      <SiteSettingsForm settings={settings as SiteSettings | null} />

      <Separator />

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.1em] text-brand-ink-muted">
          Sécurité
        </h2>
        <TwoFactorSettings factors={mfaFactors} />
      </section>
    </div>
  );
}
