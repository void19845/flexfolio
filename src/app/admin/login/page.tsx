import { LoginForm } from "@/components/admin/login-form";
import { ACCESS_DENIED } from "@/lib/admin-access";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; denied?: string }>;
}) {
  const { next, denied } = await searchParams;

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4">
      <h1 className="font-serif text-3xl text-brand-ink">Admin</h1>
      {/* Set by the proxy when a signed-in account lacks the Flexfolio admin role */}
      {denied && <p className="max-w-sm text-center text-sm text-destructive">{ACCESS_DENIED}</p>}
      <LoginForm next={next ?? "/admin"} />
    </div>
  );
}
