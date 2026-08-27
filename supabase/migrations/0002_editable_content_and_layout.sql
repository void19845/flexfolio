-- Extends site_settings with the full identity / About / CV content
-- (previously hardcoded in src/lib/site-config.ts) plus a gallery layout
-- preference. Run once in the Supabase SQL editor, after 0001_init.sql.
--
-- Defaults below mirror the placeholder content that used to live in
-- site-config.ts, so existing deployments render identically until the
-- admin edits something in /admin/parametres.

alter table public.site_settings
  add column if not exists site_name text not null default 'Prénom Nom',
  add column if not exists site_role text not null default 'Styliste Photo & Direction Artistique',
  add column if not exists label_top_left text not null default 'Direction artistique',
  add column if not exists label_top_right text not null default 'Scénographie',
  add column if not exists wordmark text not null default 'Portfolio',
  add column if not exists about_heading text not null default 'Salut !',
  add column if not exists about_cta_label text not null default 'Voir le portfolio →',
  add column if not exists gallery_layout text not null default '3x3'
    check (gallery_layout in ('3x2', '3x3'));

alter table public.site_settings
  add column if not exists about_paragraphs jsonb not null default $json$["Styliste photo et directrice artistique, je construis des ambiances avant de construire des images. Chaque projet démarre par une question simple : quelle histoire cet objet, ce vêtement, ce lieu a-t-il envie de raconter ?","Mon travail se situe à la croisée du styling, de la scénographie et de la direction artistique — je pense la composition, la matière et la lumière comme un tout, du brief jusqu'au dernier réglage sur le plateau.","Les pages qui suivent rassemblent une sélection de projets récents, entre commandes éditoriales et collaborations plus personnelles."]$json$::jsonb;

alter table public.site_settings
  add column if not exists cv_experience jsonb not null default $json$[{"period":"2023 — Aujourd'hui","org":"[Nom du studio / agence]","role":"Styliste photo freelance"},{"period":"2021 — 2023","org":"[Nom de la maison]","role":"Assistante direction artistique"},{"period":"2019 — 2021","org":"[Nom du studio]","role":"Styliste junior"}]$json$::jsonb;

alter table public.site_settings
  add column if not exists cv_education jsonb not null default $json$[{"period":"2018 — 2019","org":"[Nom de l'école]","role":"Formation styling & direction artistique"},{"period":"2015 — 2018","org":"[Nom de l'école]","role":"Diplôme en design de mode"}]$json$::jsonb;

alter table public.site_settings
  add column if not exists cv_skills jsonb not null default $json$["Direction artistique","Styling","Scénographie","Recherche d'ambiance","Direction de shooting","Storyboard"]$json$::jsonb;

alter table public.site_settings
  add column if not exists cv_software jsonb not null default $json$["Adobe Photoshop","Adobe InDesign","Adobe Lightroom","Suite Office"]$json$::jsonb;

alter table public.site_settings
  add column if not exists cv_languages jsonb not null default $json$["Français (natif)","Anglais (courant)"]$json$::jsonb;

-- No RLS changes needed: site_settings_select / site_settings_update from
-- 0001_init.sql already apply at row level, covering these new columns.
