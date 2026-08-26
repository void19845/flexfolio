import { LoginForm } from "@/components/admin/login-form";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4">
      <h1 className="font-serif text-3xl text-brand-ink">Admin</h1>
      <LoginForm next={next ?? "/admin"} />
    </div>
  );
}
