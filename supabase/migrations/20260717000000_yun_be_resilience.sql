-- YUN BE™ sovereign resilience journal
-- Mirrors the Neon/Prisma operational schema and can run safely in Supabase/Postgres.

create table if not exists public.yunbe_events (
  event_id text primary key,
  user_id uuid null,
  source_system text not null,
  payload jsonb not null default '{}'::jsonb,
  risk_class text not null check (risk_class in ('low', 'medium', 'high', 'critical')),
  yun_event_type text null,
  federation text null,
  idempotency_key text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.yunbe_journal (
  journal_id uuid primary key,
  event_id text not null references public.yunbe_events(event_id) on delete cascade,
  user_id uuid null,
  source_system text not null,
  operation_type text not null,
  payload jsonb not null default '{}'::jsonb,
  risk_class text not null check (risk_class in ('low', 'medium', 'high', 'critical')),
  status text not null check (status in ('pending', 'completed', 'replay_ready', 'replaying', 'blocked', 'discarded', 'failed')),
  attempts integer not null default 0,
  next_replay_at timestamptz null,
  completed_at timestamptz null,
  last_error text null,
  eoct_score numeric(5,4) null,
  idempotency_key text not null unique,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.yunbe_recovery_reports (
  report_id uuid primary key,
  started_at timestamptz not null,
  finished_at timestamptz not null,
  previous_state text not null,
  final_state text not null,
  replayed integer not null default 0,
  blocked integer not null default 0,
  failed integer not null default 0,
  completed integer not null default 0,
  degraded_federations jsonb not null default '[]'::jsonb,
  summary text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_yunbe_journal_replayable
  on public.yunbe_journal (status, next_replay_at, created_at)
  where status in ('pending', 'replay_ready');

create index if not exists idx_yunbe_events_user_created
  on public.yunbe_events (user_id, created_at desc);

alter table public.yunbe_events enable row level security;
alter table public.yunbe_journal enable row level security;
alter table public.yunbe_recovery_reports enable row level security;

drop policy if exists "Service role manages yunbe_events" on public.yunbe_events;
create policy "Service role manages yunbe_events"
  on public.yunbe_events
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "Service role manages yunbe_journal" on public.yunbe_journal;
create policy "Service role manages yunbe_journal"
  on public.yunbe_journal
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "Service role manages yunbe_recovery_reports" on public.yunbe_recovery_reports;
create policy "Service role manages yunbe_recovery_reports"
  on public.yunbe_recovery_reports
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
