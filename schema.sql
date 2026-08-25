-- =============================================================================
-- Flashy — Phase 1 schema
-- Academic opportunity (scholarship) aggregator
--
-- Run this in the Supabase SQL editor (or `supabase db push`). It is written to
-- be safely re-runnable: types/tables/policies are guarded with IF NOT EXISTS /
-- DROP ... IF EXISTS.
-- =============================================================================

-- gen_random_uuid() lives in pgcrypto (preinstalled on Supabase).
create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
do $$
begin
  create type scholarship_status as enum ('draft', 'published', 'expired');
exception
  when duplicate_object then null;
end
$$;

-- -----------------------------------------------------------------------------
-- Tables
-- -----------------------------------------------------------------------------
create table if not exists public.scholarships (
  id                uuid primary key default gen_random_uuid(),
  title             text not null,
  slug              text not null unique,
  provider_name     text not null,
  provider_logo_url text,
  -- Eligibility criteria
  min_cgpa          numeric(3, 2) check (min_cgpa is null or (min_cgpa >= 0 and min_cgpa <= 5)),
  education_levels  text[] not null default '{}',
  target_disciplines text[] not null default '{}',
  target_countries  text[] not null default '{}',
  -- Funding
  fully_funded      boolean not null default false,
  award_value       text not null default '',
  -- Dates & links
  deadline          timestamptz,
  official_apply_url text not null,
  content_markdown  text not null default '',
  -- Lifecycle
  status            scholarship_status not null default 'draft',
  views_count       integer not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

comment on table public.scholarships is 'Aggregated academic opportunities shown on Flashy.';
comment on column public.scholarships.min_cgpa is 'Minimum CGPA on a 5.0 scale; NULL = no cut-off.';
comment on column public.scholarships.education_levels is 'e.g. {undergraduate,masters,phd,postdoc}. Empty = all levels.';

create table if not exists public.subscribers (
  id                 uuid primary key default gen_random_uuid(),
  email              text not null unique,
  target_disciplines text[] not null default '{}',
  channel            text not null default 'email',
  is_active          boolean not null default true,
  created_at         timestamptz not null default now()
);

comment on table public.subscribers is 'Opt-in alert subscribers (email / whatsapp / telegram).';

-- -----------------------------------------------------------------------------
-- Indexes
--   - GIN on the array columns powers fast overlap/contains queries when
--     filtering is eventually pushed server-side (&&, @>).
--   - B-tree on status/deadline powers the "published, soonest deadline first"
--     listing query. The UNIQUE constraint on slug already provides its index.
-- -----------------------------------------------------------------------------
create index if not exists scholarships_status_idx
  on public.scholarships (status);
create index if not exists scholarships_deadline_idx
  on public.scholarships (deadline);
create index if not exists scholarships_status_deadline_idx
  on public.scholarships (status, deadline);

create index if not exists scholarships_education_levels_gin
  on public.scholarships using gin (education_levels);
create index if not exists scholarships_target_disciplines_gin
  on public.scholarships using gin (target_disciplines);
create index if not exists scholarships_target_countries_gin
  on public.scholarships using gin (target_countries);

create index if not exists subscribers_disciplines_gin
  on public.subscribers using gin (target_disciplines);

-- -----------------------------------------------------------------------------
-- updated_at trigger
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists scholarships_set_updated_at on public.scholarships;
create trigger scholarships_set_updated_at
  before update on public.scholarships
  for each row
  execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Row Level Security
--
-- The service_role key BYPASSES RLS entirely, so all privileged writes (admin
-- dashboard, seed script) work without an explicit write policy. These policies
-- only constrain the public anon / authenticated roles:
--   - scholarships: read PUBLISHED rows only (drafts/expired stay hidden).
--   - subscribers:  insert-only (a visitor can subscribe but cannot read the
--                   list). Reads are service-role only.
-- -----------------------------------------------------------------------------
alter table public.scholarships enable row level security;
alter table public.subscribers  enable row level security;

drop policy if exists "Public can read published scholarships" on public.scholarships;
create policy "Public can read published scholarships"
  on public.scholarships
  for select
  to anon, authenticated
  using (status = 'published');

drop policy if exists "Anyone can subscribe" on public.subscribers;
create policy "Anyone can subscribe"
  on public.subscribers
  for insert
  to anon, authenticated
  with check (email is not null);

-- -----------------------------------------------------------------------------
-- Public view counter (SECURITY DEFINER)
--
-- Lets the anon key bump views_count WITHOUT granting table-level UPDATE. Runs
-- as the function owner, so RLS is bypassed inside; search_path is pinned to
-- avoid function-hijacking. Only ever touches published rows.
-- -----------------------------------------------------------------------------
create or replace function public.increment_scholarship_views(p_slug text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.scholarships
     set views_count = views_count + 1
   where slug = p_slug
     and status = 'published';
$$;

revoke all on function public.increment_scholarship_views(text) from public;
grant execute on function public.increment_scholarship_views(text) to anon, authenticated;
