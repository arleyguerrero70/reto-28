-- 001_extend_users_challenges.sql
alter table if exists public.users
  add column if not exists full_name text,
  add column if not exists mentor_ids text[] default '{}'::text[],
  add column if not exists motivation text,
  add column if not exists expectation text,
  add column if not exists timezone text;

alter table if exists public.challenges
  add column if not exists starts_at timestamptz,
  add column if not exists goal_description text,
  add column if not exists timezone text,
  add column if not exists status text default 'active',
  add column if not exists current_day int default 1;
\nalter table if exists public.users alter column id set default gen_random_uuid();\nalter table if exists public.challenges alter column id set default gen_random_uuid();
