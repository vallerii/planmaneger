-- =============================================================
-- 0002: статусы задач + публичная ссылка на задачу
-- Запустите в Supabase → SQL Editor → New query → Run (после 0001)
-- =============================================================

-- ---------- статус задачи ----------
alter table public.tasks add column if not exists status text not null default 'todo';

do $$ begin
  alter table public.tasks add constraint tasks_status_check
    check (status in ('todo','in_progress','discuss','done','cancelled'));
exception when duplicate_object then null; end $$;

-- перенос старого флажка «нужно обсудить» и 100% прогресса
update public.tasks set status = 'discuss' where needs_discussion and status = 'todo';
update public.tasks set status = 'done' where progress >= 100 and status = 'todo';

-- ---------- публичная ссылка ----------
alter table public.tasks add column if not exists share_token uuid unique;

-- Возвращает задачу по токену ссылки. Доступно без входа (anon),
-- отдаёт только нужные поля, без комментариев и данных участников.
drop function if exists public.get_shared_task(uuid);
create or replace function public.get_shared_task(p_token uuid)
returns table (
  name text,
  description text,
  size text,
  status text,
  progress int,
  deadline date,
  phase_name text,
  project_name text,
  size_days jsonb,
  updated_at timestamptz
)
language sql stable security definer set search_path = public as $$
  select t.name, t.description, t.size, t.status, t.progress, t.deadline,
         ph.name, pr.name, pr.size_days, t.updated_at
  from tasks t
  join phases ph on ph.id = t.phase_id
  join projects pr on pr.id = t.project_id
  where p_token is not null and t.share_token = p_token
  limit 1;
$$;

revoke all on function public.get_shared_task(uuid) from public;
grant execute on function public.get_shared_task(uuid) to anon, authenticated;
