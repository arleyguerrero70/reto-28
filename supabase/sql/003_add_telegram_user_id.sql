-- 003_add_telegram_user_id.sql
alter table if exists public.users
  add column if not exists telegram_user_id text;
