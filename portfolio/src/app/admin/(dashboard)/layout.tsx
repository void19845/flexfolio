import Link from "next/link";
import { LogoutButton } from "@/components/admin/logout-button";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 sm:px-8">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/admin" className="font-medium hover:text-brand-accent">
            Projets
          </Link>
          <Link href="/admin/parametres" className="font-medium hover:text-brand-accent">
            Paramètres
          </Link>
          <Link href="/" className="text-brand-ink-muted hover:text-brand-accent" target="_blank">
            Voir le site ↗
          </Link>
        </nav>
        <LogoutButton />
      </div>
      {children}
    </div>
  );
}
