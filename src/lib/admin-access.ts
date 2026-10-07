import type { SupabaseClient } from "@supabase/supabase-js";

export const ACCESS_DENIED = "Ce compte n'a pas accès à l'administration du portfolio.";

/**
 * Whether the signed-in account may use the admin: Flexfolio admin role in the
 * suite-wide `app_roles` table, or suite super admin. The database decides
 * (see flexstaff and this repo's supabase/init.sql) and its RLS policies enforce the same
 * rule on every write; this check only keeps other accounts out of the UI.
 * Fails closed: an error reads as "no access".
 */
export async function isFlexfolioAdmin(supabase: SupabaseClient): Promise<boolean> {
  const { data, error } = await supabase.rpc("suite_has_app_role", {
    p_app: "flexfolio",
    p_roles: ["admin"],
  });
  return !error && data === true;
}
