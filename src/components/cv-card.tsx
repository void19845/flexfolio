import { DownloadIcon, MailIcon, PhoneIcon } from "lucide-react";
import type { SocialLink } from "@/lib/types";

export function CVCard({
  name,
  subtitle,
  contactEmail,
  contactPhone,
  socialLinks,
  cvPdfUrl,
}: {
  name: string;
  subtitle: string;
  contactEmail: string | null;
  contactPhone: string | null;
  socialLinks: SocialLink[];
  cvPdfUrl: string | null;
}) {
  return (
    <div className="flex flex-col gap-6 bg-brand-card p-6 text-brand-card-foreground sm:p-8">
      <div>
        <p className="font-serif text-2xl leading-tight">{name}</p>
        <p className="mt-1 text-xs uppercase tracking-[0.1em] text-brand-card-foreground/80">
          {subtitle}
        </p>
      </div>

      {(contactEmail || contactPhone) && (
        <div className="flex flex-col gap-2 text-[12px] leading-[1.5]">
          {contactEmail && (
            <a
              href={`mailto:${contactEmail}`}
              className="flex items-center gap-2 text-brand-card-foreground/90 hover:text-brand-card-foreground"
            >
              <MailIcon className="h-3.5 w-3.5 shrink-0" />
              {contactEmail}
            </a>
          )}
          {contactPhone && (
            <a
              href={`tel:${contactPhone.replace(/\s+/g, "")}`}
              className="flex items-center gap-2 text-brand-card-foreground/90 hover:text-brand-card-foreground"
            >
              <PhoneIcon className="h-3.5 w-3.5 shrink-0" />
              {contactPhone}
            </a>
          )}
        </div>
      )}

      {socialLinks.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-card-foreground/70">
            Réseaux
          </h3>
          <ul className="flex flex-col gap-1.5 text-[12px] leading-[1.5]">
            {socialLinks.map((link, index) => (
              <li key={`${link.label}-${index}`}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-brand-card-foreground/90 hover:text-brand-card-foreground"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {cvPdfUrl ? (
        <a
          href={cvPdfUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="mt-2 flex w-fit items-center gap-2 border border-brand-card-foreground/40 px-4 py-2 font-sans text-xs uppercase tracking-[0.1em] text-brand-card-foreground transition-colors hover:border-brand-card-foreground hover:bg-brand-card-foreground/10"
        >
          <DownloadIcon className="h-3.5 w-3.5" />
          Télécharger le CV
        </a>
      ) : (
        <p className="text-[12px] text-brand-card-foreground/60">CV à venir.</p>
      )}
    </div>
  );
}
