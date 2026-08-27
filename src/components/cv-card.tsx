import type { ReactNode } from "react";
import type { CVEntry } from "@/lib/types";

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

export function CVCard({
  name,
  subtitle,
  experience,
  education,
  skills,
  software,
  languages,
}: {
  name: string;
  subtitle: string;
  experience: CVEntry[];
  education: CVEntry[];
  skills: string[];
  software: string[];
  languages: string[];
}) {
  return (
    <div className="flex flex-col gap-6 bg-brand-card p-6 text-brand-card-foreground sm:p-8">
      <div>
        <p className="font-serif text-2xl leading-tight">{name}</p>
        <p className="mt-1 text-xs uppercase tracking-[0.1em] text-brand-card-foreground/80">
          {subtitle}
        </p>
      </div>

      <CVSection title="Expériences professionnelles">
        <ul className="flex flex-col gap-3 text-[12px] leading-[1.5]">
          {experience.map((item, index) => (
            <li key={`${item.period}-${item.org}-${index}`}>
              <p className="text-brand-card-foreground/60">{item.period}</p>
              <p>{item.org}</p>
              <p className="text-brand-card-foreground/80">{item.role}</p>
            </li>
          ))}
        </ul>
      </CVSection>

      <CVSection title="Formation">
        <ul className="flex flex-col gap-3 text-[12px] leading-[1.5]">
          {education.map((item, index) => (
            <li key={`${item.period}-${item.org}-${index}`}>
              <p className="text-brand-card-foreground/60">{item.period}</p>
              <p>{item.org}</p>
              <p className="text-brand-card-foreground/80">{item.role}</p>
            </li>
          ))}
        </ul>
      </CVSection>

      <CVSection title="Compétences">
        <p className="text-[12px] leading-[1.5] text-brand-card-foreground/90">
          {skills.join(", ")}
        </p>
      </CVSection>

      <CVSection title="Logiciels">
        <p className="text-[12px] leading-[1.5] text-brand-card-foreground/90">
          {software.join(", ")}
        </p>
      </CVSection>

      <CVSection title="Langues">
        <p className="text-[12px] leading-[1.5] text-brand-card-foreground/90">
          {languages.join(", ")}
        </p>
      </CVSection>
    </div>
  );
}
