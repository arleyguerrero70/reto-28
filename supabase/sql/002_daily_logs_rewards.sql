-- 002_daily_logs_rewards.sql
create table if not exists public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid references public.challenges(id) on delete cascade,
  log_date date not null,
  completed boolean default false,
  minutes_spent int default 0,
  mood_before text,
  mood_after text,
  note text,
  shared_in_group boolean default false,
  shared_message_id text,
  created_at timestamptz default now()
);

create table if not exists public.rewards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  type text default 'shield',
  granted_day int,
  consumed boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.penalties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  reason text,
  amount numeric default 0,
  created_at timestamptz default now()
);
