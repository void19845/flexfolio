import Link from "next/link";
import { NAV_LINKS } from "@/lib/site-config";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-center border-b border-border/60 bg-background/90 py-4 backdrop-blur">
      <nav className="flex items-center gap-8">
        <Link href="/" aria-label="Accueil" className="text-lg leading-none">
          👀
        </Link>
        <ul className="flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="label-eyebrow hover:text-brand-accent">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
