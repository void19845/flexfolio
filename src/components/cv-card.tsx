import type { ReactNode } from "react";
import { CV } from "@/lib/site-config";

function CVSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-card-foreground/70">
        {title}
      </h3>
      {children}
    </div>
  );
}

export function CVCard() {
  return (
    <div className="flex flex-col gap-6 bg-brand-card p-6 text-brand-card-foreground sm:p-8">
      <div>
        <p className="font-serif text-2xl leading-tight">{CV.name}</p>
        <p className="mt-1 text-xs uppercase tracking-[0.1em] text-brand-card-foreground/80">
          {CV.subtitle}
        </p>
      </div>

      <CVSection title="Expériences professionnelles">
        <ul className="flex flex-col gap-3 text-[12px] leading-[1.5]">
          {CV.experience.map((item) => (
            <li key={`${item.period}-${item.org}`}>
              <p className="text-brand-card-foreground/60">{item.period}</p>
              <p>{item.org}</p>
              <p className="text-brand-card-foreground/80">{item.role}</p>
            </li>
          ))}
        </ul>
      </CVSection>

      <CVSection title="Formation">
        <ul className="flex flex-col gap-3 text-[12px] leading-[1.5]">
          {CV.education.map((item) => (
            <li key={`${item.period}-${item.org}`}>
              <p className="text-brand-card-foreground/60">{item.period}</p>
              <p>{item.org}</p>
              <p className="text-brand-card-foreground/80">{item.role}</p>
            </li>
          ))}
        </ul>
      </CVSection>

      <CVSection title="Compétences">
        <p className="text-[12px] leading-[1.5] text-brand-card-foreground/90">
          {CV.skills.join(", ")}
        </p>
      </CVSection>

      <CVSection title="Logiciels">
        <p className="text-[12px] leading-[1.5] text-brand-card-foreground/90">
          {CV.software.join(", ")}
        </p>
      </CVSection>

      <CVSection title="Langues">
        <p className="text-[12px] leading-[1.5] text-brand-card-foreground/90">
          {CV.languages.join(", ")}
        </p>
      </CVSection>
    </div>
  );
}
