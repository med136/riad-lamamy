-- Dar LaMamy Content Studio
-- Editable translations + page section settings.

create table if not exists public.cms_translations (
  id uuid primary key default gen_random_uuid(),
  translation_key text not null,
  language text not null check (language in ('fr','en')),
  value text not null,
  namespace text not null default 'general',
  page_key text,
  section_key text,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (translation_key, language)
);

create index if not exists cms_translations_namespace_idx on public.cms_translations(namespace);
create index if not exists cms_translations_page_section_idx on public.cms_translations(page_key, section_key);

create table if not exists public.cms_page_sections (
  id uuid primary key default gen_random_uuid(),
  page_key text not null,
  section_key text not null,
  label text not null,
  position integer not null default 0,
  is_visible boolean not null default true,
  settings jsonb not null default '{}'::jsonb,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (page_key, section_key)
);

create index if not exists cms_page_sections_page_idx on public.cms_page_sections(page_key, position);

create or replace function public.cms_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists cms_translations_touch_updated_at on public.cms_translations;
create trigger cms_translations_touch_updated_at
before update on public.cms_translations
for each row execute function public.cms_touch_updated_at();

drop trigger if exists cms_page_sections_touch_updated_at on public.cms_page_sections;
create trigger cms_page_sections_touch_updated_at
before update on public.cms_page_sections
for each row execute function public.cms_touch_updated_at();

alter table public.cms_translations enable row level security;
alter table public.cms_page_sections enable row level security;

-- Public website can only read published CMS values.
drop policy if exists "Public can read CMS translations" on public.cms_translations;
create policy "Public can read CMS translations"
on public.cms_translations for select
using (true);

drop policy if exists "Public can read CMS page sections" on public.cms_page_sections;
create policy "Public can read CMS page sections"
on public.cms_page_sections for select
using (true);

-- Writes are intentionally handled by authenticated /api/admin/* routes using
-- the service role after verifying the current user is an admin.

insert into public.cms_page_sections (page_key, section_key, label, position, is_visible)
values
  ('home','hero','Hero',10,true),
  ('home','booking','Réservation rapide',20,true),
  ('home','about','Présentation',30,true),
  ('home','rooms','Chambres mises en avant',40,true),
  ('home','services','Services',50,true),
  ('home','experience','Expérience / Fès',60,true),
  ('home','gallery','Galerie',70,true),
  ('home','testimonials','Témoignages',80,true),
  ('about','hero','Hero',10,true),
  ('about','values','Valeurs',20,true),
  ('about','team','Esprit de la maison',30,true),
  ('contact','hero','Hero',10,true),
  ('contact','form','Formulaire',20,true),
  ('contact','info','Coordonnées',30,true),
  ('contact','faq','FAQ',40,true),
  ('guest','home','Accueil Guest App',10,true),
  ('guest','breakfast','Petit-déjeuner',20,true),
  ('guest','transfer','Transfert',30,true),
  ('guest','services','Services',40,true),
  ('guest','discover','Découvrir Fès',50,true),
  ('guest','guide','Guide du riad',60,true),
  ('guest','contact','Contact',70,true),
  ('global','navigation','Navigation',10,true),
  ('global','footer','Footer',20,true),
  ('global','cookies','Cookies',30,true),
  ('global','whatsapp','WhatsApp',40,true)
on conflict (page_key, section_key) do nothing;
