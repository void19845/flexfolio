-- Portfolio schema: projects, project_images, site_settings, storage.
-- Run this once in the Supabase SQL editor on a fresh project.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- projects
-- ---------------------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description_short text,
  description_full text,
  github_url text,
  live_url text,
  tech_stack text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  is_visible boolean not null default true,
  display_order int not null default 0
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_projects_updated_at on public.projects;
create trigger trg_projects_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- project_images
-- ---------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'image_orientation') then
    create type public.image_orientation as enum ('portrait', 'landscape');
  end if;
end
$$;

create table if not exists public.project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  image_url text not null,
  caption text,
  sort_order int not null default 0,
  is_featured boolean not null default false,
  image_orientation public.image_orientation not null default 'landscape',
  image_position text not null default 'center'
    check (image_position in (
      'top-left', 'top-center', 'top-right',
      'center-left', 'center', 'center-right',
      'bottom-left', 'bottom-center', 'bottom-right'
    )),
  created_at timestamptz not null default now()
);

-- Business rule: at most one featured image per project.
create unique index if not exists one_featured_image_per_project
  on public.project_images (project_id)
  where is_featured;

create index if not exists project_images_project_id_sort_order_idx
  on public.project_images (project_id, sort_order);

-- ---------------------------------------------------------------------
-- site_settings (singleton row — profile & hero photo, admin-editable)
-- ---------------------------------------------------------------------
create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  profile_image_url text,
  hero_image_url text,
  updated_at timestamptz not null default now()
);

insert into public.site_settings (id)
values (1)
on conflict (id) do nothing;

drop trigger if exists trg_site_settings_updated_at on public.site_settings;
create trigger trg_site_settings_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------
alter table public.projects enable row level security;
alter table public.project_images enable row level security;
alter table public.site_settings enable row level security;

-- projects: public sees only visible rows; logged-in admin sees everything.
drop policy if exists "projects_select" on public.projects;
create policy "projects_select" on public.projects
  for select using (is_visible = true or auth.uid() is not null);

drop policy if exists "projects_insert" on public.projects;
create policy "projects_insert" on public.projects
  for insert to authenticated with check (true);

drop policy if exists "projects_update" on public.projects;
create policy "projects_update" on public.projects
  for update to authenticated using (true) with check (true);

drop policy if exists "projects_delete" on public.projects;
create policy "projects_delete" on public.projects
  for delete to authenticated using (true);

-- project_images: follows the visibility of the parent project.
drop policy if exists "project_images_select" on public.project_images;
create policy "project_images_select" on public.project_images
  for select using (
    exists (
      select 1 from public.projects p
      where p.id = project_images.project_id
        and (p.is_visible = true or auth.uid() is not null)
    )
  );

drop policy if exists "project_images_insert" on public.project_images;
create policy "project_images_insert" on public.project_images
  for insert to authenticated with check (true);

drop policy if exists "project_images_update" on public.project_images;
create policy "project_images_update" on public.project_images
  for update to authenticated using (true) with check (true);

drop policy if exists "project_images_delete" on public.project_images;
create policy "project_images_delete" on public.project_images
  for delete to authenticated using (true);

-- site_settings: public read (needed to render the public site), admin write.
drop policy if exists "site_settings_select" on public.site_settings;
create policy "site_settings_select" on public.site_settings
  for select using (true);

drop policy if exists "site_settings_update" on public.site_settings;
create policy "site_settings_update" on public.site_settings
  for update to authenticated using (true) with check (true);

-- ---------------------------------------------------------------------
-- Storage: public bucket for all project + site images
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('project-images', 'project-images', true)
on conflict (id) do nothing;

drop policy if exists "project_images_bucket_public_read" on storage.objects;
create policy "project_images_bucket_public_read" on storage.objects
  for select using (bucket_id = 'project-images');

drop policy if exists "project_images_bucket_auth_insert" on storage.objects;
create policy "project_images_bucket_auth_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'project-images');

drop policy if exists "project_images_bucket_auth_update" on storage.objects;
create policy "project_images_bucket_auth_update" on storage.objects
  for update to authenticated using (bucket_id = 'project-images');

drop policy if exists "project_images_bucket_auth_delete" on storage.objects;
create policy "project_images_bucket_auth_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'project-images');
