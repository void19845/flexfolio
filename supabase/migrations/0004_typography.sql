-- Adds an editable title/body font pair to site_settings — same
-- "preloaded set, admin picks one" approach as gallery_layout in 0002,
-- since next/font/google self-hosts each option at build time and can't
-- fetch an arbitrary font name at runtime.
--
-- Defaults switch the site from the original Playfair Display / Inter
-- pairing to Give You Glory / Quicksand. See TITLE_FONT_VARS /
-- BODY_FONT_VARS in src/lib/types.ts for how each key maps to the
-- next/font CSS variable applied in src/app/layout.tsx.

alter table public.site_settings
  add column if not exists font_title text not null default 'give-you-glory'
    check (font_title in ('playfair-display', 'give-you-glory')),
  add column if not exists font_body text not null default 'quicksand'
    check (font_body in ('inter', 'quicksand'));

-- No RLS changes needed: site_settings_select / site_settings_update from
-- 0001_init.sql already apply at row level, covering these new columns.
