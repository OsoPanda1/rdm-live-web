-- Migration: ai_prompts_log — trazabilidad de prompts bajo Open Science
-- Almacena cada interacción IA para reproducibilidad y auditoría (F5)

create table if not exists ai_prompts_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null,
  session_id text null,
  federation text null,
  use_case text null,
  model_name text not null,
  provider text not null,
  prompt text not null,
  output text null,
  created_at timestamptz not null default now(),
  trace_id text not null,
  meta jsonb null
);

create index if not exists idx_ai_prompts_log_user_time
  on ai_prompts_log (user_id, created_at);

create index if not exists idx_ai_prompts_log_trace
  on ai_prompts_log (trace_id);

alter table ai_prompts_log enable row level security;

create policy "ai_prompts_log_admin_read"
  on ai_prompts_log for select
  to authenticated
  using (
    exists (select 1 from user_roles where user_roles.user_id = auth.uid() and user_roles.role = 'admin')
  );

create policy "ai_prompts_log_user_read_own"
  on ai_prompts_log for select
  to authenticated
  using (user_id = auth.uid());

create policy "ai_prompts_log_insert_service"
  on ai_prompts_log for insert
  to service_role
  with check (true);

-- También aseguramos que stripe_events tenga la columna processed_at si no existe
do $$ begin
  if not exists (select 1 from information_schema.columns where table_name = 'stripe_events' and column_name = 'processed_at') then
    alter table stripe_events add column processed_at timestamptz;
  end if;
end $$;
