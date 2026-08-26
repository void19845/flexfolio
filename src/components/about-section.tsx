import Image from "next/image";
import Link from "next/link";
import { ABOUT_CONTENT } from "@/lib/site-config";
import { CVCard } from "@/components/cv-card";

export function AboutSection({ profileImageUrl }: { profileImageUrl: string | null }) {
  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-12 sm:px-8 lg:flex-row lg:gap-16 lg:py-20">
      <div className="flex flex-col gap-6 lg:w-[60%]">
        <h1 className="font-serif text-4xl text-brand-ink sm:text-5xl">
          {ABOUT_CONTENT.heading}
        </h1>

        <div className="flex flex-col gap-5 text-base leading-relaxed text-brand-ink sm:text-[15px]">
          {ABOUT_CONTENT.paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        {profileImageUrl && (
          <div className="relative mt-2 h-[45vh] w-full max-w-[420px] overflow-hidden rounded-[4px] sm:h-[50vh]">
            <Image
              src={profileImageUrl}
              alt="Photo préférée du moment"
              fill
              sizes="420px"
              className="object-cover"
            />
          </div>
        )}

        <Link
          href={ABOUT_CONTENT.ctaHref}
          className="label-eyebrow mt-2 w-fit border-b border-brand-ink pb-1 hover:text-brand-accent hover:border-brand-accent"
        >
          {ABOUT_CONTENT.ctaLabel}
        </Link>
      </div>

      <div className="lg:w-[40%]">
        <CVCard />
      </div>
    </section>
  );
}
