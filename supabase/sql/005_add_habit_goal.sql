-- 005_add_habit_goal.sql
alter table if exists public.users
  add column if not exists habit_goal text;
