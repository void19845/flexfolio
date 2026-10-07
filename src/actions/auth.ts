"use server";

import { redirect } from "next/navigation";
import { ACCESS_DENIED, isFlexfolioAdmin } from "@/lib/admin-access";
import { createClient } from "@/lib/supabase/server";

export async function signIn(
  _prevState: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");

  if (!email || !password) {
    return { error: "Email et mot de passe requis." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Identifiants incorrects." };
  }

  // The Supabase project is shared across Flex Suite apps: a valid account is
  // not enough, it needs the Flexfolio admin role (or suite super admin).
  if (!(await isFlexfolioAdmin(supabase))) {
    await supabase.auth.signOut();
    return { error: ACCESS_DENIED };
  }

  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
