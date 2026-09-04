import { MfaVerifyForm } from "@/components/admin/mfa-verify-form";

export default async function AdminMfaPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="font-serif text-3xl text-brand-ink">Vérification en deux étapes</h1>
        <p className="max-w-sm text-sm text-brand-ink-muted">
          Ouvre ton application d&apos;authentification et entre le code affiché pour ce
          site.
        </p>
      </div>
      <MfaVerifyForm next={next ?? "/admin"} />
    </div>
  );
}
