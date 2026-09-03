"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CVCard } from "@/components/cv-card";
import type { SocialLink } from "@/lib/types";

/** Photo height stays clamped even if the text block above it is very
 *  short or very long — same idea as the old h-[45vh]/h-[50vh] fixed
 *  sizing, just bounded instead of fixed. */
const MIN_PHOTO_HEIGHT = 280;
const MAX_PHOTO_HEIGHT = 720;

export function AboutSection({
  profileImageUrl,
  heading,
  paragraphs,
  ctaLabel,
  ctaHref,
  cvName,
  cvSubtitle,
  contactEmail,
  contactPhone,
  socialLinks,
  cvPdfUrl,
}: {
  profileImageUrl: string | null;
  heading: string;
  paragraphs: string[];
  ctaLabel: string;
  ctaHref: string;
  cvName: string;
  cvSubtitle: string;
  contactEmail: string | null;
  contactPhone: string | null;
  socialLinks: SocialLink[];
  cvPdfUrl: string | null;
}) {
  const textRef = useRef<HTMLDivElement>(null);
  const [photoHeight, setPhotoHeight] = useState<number | null>(null);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const height = entries[0]?.contentRect.height;
      if (height) {
        setPhotoHeight(Math.min(Math.max(height, MIN_PHOTO_HEIGHT), MAX_PHOTO_HEIGHT));
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-12 sm:px-8 lg:flex-row lg:gap-16 lg:py-20">
      <div className="flex flex-col gap-6 lg:w-[60%]">
        <div ref={textRef} className="flex flex-col gap-6">
          <h1 className="font-serif text-4xl text-brand-ink sm:text-5xl">{heading}</h1>

          <div className="flex flex-col gap-5 text-base leading-relaxed text-brand-ink sm:text-[15px]">
            {paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>

        {profileImageUrl && (
          <div
            className="relative mt-2 h-[45vh] w-full max-w-[420px] overflow-hidden rounded-[4px] sm:h-[50vh]"
            style={photoHeight ? { height: `${photoHeight}px` } : undefined}
          >
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
          href={ctaHref}
          className="label-eyebrow mt-2 w-fit border-b border-brand-ink pb-1 hover:text-brand-accent hover:border-brand-accent"
        >
          {ctaLabel}
        </Link>
      </div>

      <div className="lg:w-[40%]">
        <CVCard
          name={cvName}
          subtitle={cvSubtitle}
          contactEmail={contactEmail}
          contactPhone={contactPhone}
          socialLinks={socialLinks}
          cvPdfUrl={cvPdfUrl}
        />
      </div>
    </section>
  );
}
