-- =============================================================
-- 0009: непрочитанные комментарии + проверка Realtime
--   • comment_reads — до какого момента пользователь прочитал
--     комментарии задачи (одна строка на пользователя и задачу)
--   • my_unread_comments / my_unread_projects — что не прочитано мной
--   • все существующие комментарии считаются прочитанными
--   • таблицы доски явно добавляются в Realtime
-- Запустите в Supabase → SQL Editor → New query → Run (после 0008)
-- =============================================================

create table if not exists public.comment_reads (
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  last_read_at timestamptz not null default now(),
  primary key (user_id, task_id)
);
create index if not exists comment_reads_project_idx on public.comment_reads(user_id, project_id);

alter table public.comment_reads enable row level security;

drop policy if exists comment_reads_own on public.comment_reads;
create policy comment_reads_own on public.comment_reads for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and public.is_project_member(project_id));

-- всё, что уже написано, считаем прочитанным всеми участниками
insert into public.comment_reads (user_id, task_id, project_id, last_read_at)
select m.user_id, t.id, t.project_id, now()
from public.tasks t
join public.project_members m on m.project_id = t.project_id
on conflict (user_id, task_id) do update set last_read_at = excluded.last_read_at;

-- Непрочитанные мной комментарии. Без отметки о прочтении — всё, что написано
-- после того, как я стал участником проекта. Свои комментарии не считаются.
create or replace function public.my_unread_comments(p_project uuid)
returns table (
  id uuid,
  task_id uuid,
  task_name text,
  body text,
  created_at timestamptz,
  author_id uuid,
  author_name text
)
language sql stable security invoker set search_path = public as $$
  select c.id, c.task_id, t.name, c.body, c.created_at, c.author_id,
         coalesce(nullif(p.full_name, ''), p.email)
  from comments c
  join tasks t on t.id = c.task_id
  join project_members m on m.project_id = c.project_id and m.user_id = auth.uid()
  left join comment_reads r on r.task_id = c.task_id and r.user_id = auth.uid()
  left join profiles p on p.id = c.author_id
  where c.project_id = p_project
    and c.author_id <> auth.uid()
    and c.created_at > coalesce(r.last_read_at, m.created_at)
  order by c.created_at desc
  limit 100
$$;

-- В каких проектах есть непрочитанное (для списка проектов).
create or replace function public.my_unread_projects()
returns table (project_id uuid, unread int)
language sql stable security invoker set search_path = public as $$
  select c.project_id, count(*)::int
  from comments c
  join project_members m on m.project_id = c.project_id and m.user_id = auth.uid()
  left join comment_reads r on r.task_id = c.task_id and r.user_id = auth.uid()
  where c.author_id <> auth.uid()
    and c.created_at > coalesce(r.last_read_at, m.created_at)
  group by c.project_id
$$;

grant execute on function public.my_unread_comments(uuid) to authenticated;
grant execute on function public.my_unread_projects() to authenticated;

-- ---------- Realtime: таблицы доски должны быть в публикации ----------
do $$
declare t text;
begin
  foreach t in array array['phases','tasks','comments','projects'] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;

-- Проверка: должно вернуть 4 строки (phases, tasks, comments, projects)
select tablename from pg_publication_tables
where pubname = 'supabase_realtime' and schemaname = 'public'
order by tablename;
