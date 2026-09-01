-- Adds a PDF-based CV, contact info, social links, and an editable
-- 4-color brand palette to site_settings. Run once, after 0002.
--
-- The CV switches from structured entries (cv_experience / cv_education /
-- cv_skills / cv_software / cv_languages, added in 0002) to a single
-- uploaded PDF. Those older columns are left in place — unused by the
-- app from this migration onward, but not dropped, so no data is lost.

alter table public.site_settings
  add column if not exists cv_pdf_url text,
  add column if not exists contact_email text,
  add column if not exists contact_phone text,
  add column if not exists social_links jsonb not null default '[]'::jsonb;

-- Palette defaults mirror the brief-mandated hex values already hardcoded
-- in src/app/globals.css, so existing deployments render identically
-- until the admin picks new colors in /admin/parametres. The hex check
-- is a backstop — src/lib/palette.ts also validates before these values
-- ever reach a rendered <style>.
alter table public.site_settings
  add column if not exists palette_bg text not null default '#f5f5f0'
    check (palette_bg ~ '^#[0-9a-fA-F]{6}$'),
  add column if not exists palette_ink text not null default '#1a1a1a'
    check (palette_ink ~ '^#[0-9a-fA-F]{6}$'),
  add column if not exists palette_card text not null default '#3d2b2b'
    check (palette_card ~ '^#[0-9a-fA-F]{6}$'),
  add column if not exists palette_accent text not null default '#8b4513'
    check (palette_accent ~ '^#[0-9a-fA-F]{6}$');

-- No RLS changes needed: site_settings_select / site_settings_update from
-- 0001_init.sql already apply at row level, covering these new columns.
-- No storage changes needed either: the CV PDF uploads to the existing
-- public "project-images" bucket (see CvPdfField in site-settings-form.tsx),
-- same as the profile/hero photos.
