-- 004_add_email_contact.sql
alter table if exists public.users
  add column if not exists email_contact text;
