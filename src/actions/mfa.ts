"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface MfaFactorSummary {
  id: string;
  friendlyName: string | null;
  createdAt: string;
}

/** Verified TOTP factors for the current user — what the settings page
 *  shows to decide between "activer" and "désactiver". */
export async function listVerifiedMfaFactors(): Promise<MfaFactorSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.mfa.listFactors();
  if (error || !data) return [];

  return data.totp
    .filter((factor) => factor.status === "verified")
    .map((factor) => ({
      id: factor.id,
      friendlyName: factor.friendly_name ?? null,
      createdAt: factor.created_at,
    }));
}

export type StartMfaEnrollmentResult =
  | { error: string }
  | { error: null; factorId: string; qrCode: string; secret: string };

/** Starts TOTP enrollment and returns the QR code (SVG data URI) + secret
 *  to show the user. Clears out any stale unverified factor first — an
 *  abandoned previous attempt would otherwise block a new enroll() call. */
export async function startMfaEnrollment(): Promise<StartMfaEnrollmentResult> {
  const supabase = await createClient();

  const { data: existing } = await supabase.auth.mfa.listFactors();
  const stale =
    existing?.all.filter(
      (factor) => factor.factor_type === "totp" && factor.status === "unverified",
    ) ?? [];
  for (const factor of stale) {
    await supabase.auth.mfa.unenroll({ factorId: factor.id });
  }

  const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" });
  if (error || !data) {
    return { error: error?.message ?? "Impossible de démarrer l'activation." };
  }

  return {
    error: null,
    factorId: data.id,
    qrCode: data.totp.qr_code,
    secret: data.totp.secret,
  };
}

/** Verifies the 6-digit code from the authenticator app to activate a
 *  freshly-enrolled factor. Promotes the current session to aal2. */
export async function confirmMfaEnrollment(
  factorId: string,
  code: string,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code });
  if (error) return { error: "Code invalide, réessaie." };

  revalidatePath("/admin/parametres");
  return { error: null };
}

/** Removes a factor — used both to abandon an in-progress enrollment and
 *  to fully disable 2FA from the settings page. */
export async function cancelMfaEnrollment(factorId: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.auth.mfa.unenroll({ factorId });
  if (error) return { error: error.message };

  revalidatePath("/admin/parametres");
  return { error: null };
}

/** Login-time challenge: verifies the code against the account's verified
 *  TOTP factor and, on success, redirects on to `next` (the admin page the
 *  user was headed to before the Proxy intercepted them for 2FA). */
export async function verifyMfaLogin(
  _prevState: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const code = String(formData.get("code") ?? "").trim();
  const next = String(formData.get("next") ?? "/admin");

  if (!/^\d{6}$/.test(code)) {
    return { error: "Entre les 6 chiffres du code." };
  }

  const supabase = await createClient();
  const { data, error: factorsError } = await supabase.auth.mfa.listFactors();
  const factor = data?.totp.find((f) => f.status === "verified");
  if (factorsError || !factor) {
    return { error: "Aucune application d'authentification n'est configurée." };
  }

  const { error } = await supabase.auth.mfa.challengeAndVerify({
    factorId: factor.id,
    code,
  });
  if (error) return { error: "Code invalide, réessaie." };

  redirect(next.startsWith("/admin") ? next : "/admin");
}
