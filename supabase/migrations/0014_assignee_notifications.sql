-- =============================================================
-- 0014: исполнитель задачи + email-уведомления
--   • tasks.assignee_id — исполнитель (владелец или редактор проекта)
--   • удалили участника / сделали клиентом — его задачи без исполнителя
--   • task_notifications — очередь писем «на вас назначили задачу»
--   • profiles: notify_assign, notify_comments, lang, comments_notified_at
--   • claim_* — забрать письма к отправке (только сервер, service_role)
-- Запустите в Supabase → SQL Editor → New query → Run (после 0013)
-- =============================================================

-- ---------- исполнитель ----------
alter table public.tasks
  add column if not exists assignee_id uuid references public.profiles(id) on delete set null;
create index if not exists tasks_assignee_idx on public.tasks(assignee_id);

-- исполнитель — только владелец или редактор этого проекта
-- (имя триггера на «v» — срабатывает после tasks_sync_project, когда project_id уже выставлен)
create or replace function public.validate_task_assignee()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.assignee_id is not null and (tg_op = 'INSERT' or new.assignee_id is distinct from old.assignee_id) then
    if not exists (
      select 1 from project_members
      where project_id = new.project_id and user_id = new.assignee_id and role in ('owner','editor')
    ) then
      raise exception 'Исполнителем может быть только владелец или редактор проекта';
    end if;
  end if;
  return new;
end $$;

drop trigger if exists tasks_validate_assignee on public.tasks;
create trigger tasks_validate_assignee before insert or update on public.tasks
for each row execute function public.validate_task_assignee();

-- участник ушёл из проекта или стал клиентом — снимаем его с задач
create or replace function public.unassign_left_member()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'UPDATE' then
    if new.role <> 'viewer' then
      return null;
    end if;
  end if;
  -- проект или пользователь удаляются целиком — задачи и так уйдут / очистятся
  if not exists (select 1 from projects where id = old.project_id)
     or not exists (select 1 from profiles where id = old.user_id) then
    return null;
  end if;
  update tasks set assignee_id = null
  where project_id = old.project_id and assignee_id = old.user_id;
  return null;
end $$;

drop trigger if exists members_unassign on public.project_members;
create trigger members_unassign after delete or update of role on public.project_members
for each row execute function public.unassign_left_member();

-- ---------- настройки писем ----------
alter table public.profiles add column if not exists notify_assign boolean not null default true;
alter table public.profiles add column if not exists notify_comments boolean not null default true;
alter table public.profiles add column if not exists lang text not null default 'ru';
-- до какого момента комментарии уже были в письме (старое не присылаем)
alter table public.profiles add column if not exists comments_notified_at timestamptz not null default now();
alter table public.profiles drop constraint if exists profiles_lang_check;
alter table public.profiles add constraint profiles_lang_check check (lang in ('ru','en','de'));

-- ---------- очередь «назначили задачу» ----------
create table if not exists public.task_notifications (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'assigned' check (kind in ('assigned')),
  user_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);
create index if not exists task_notifications_pending_idx
  on public.task_notifications(project_id) where sent_at is null;

-- доступ к очереди — только у сервера (service_role обходит RLS)
alter table public.task_notifications enable row level security;

create or replace function public.queue_assign_notification()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.assignee_id is null then
    return null;
  end if;
  if tg_op = 'UPDATE' and new.assignee_id is not distinct from old.assignee_id then
    return null;
  end if;
  -- переназначили, а письмо ещё не ушло — старое не отправляем
  delete from task_notifications where task_id = new.id and sent_at is null;
  -- назначил сам себя — письмо не нужно
  if new.assignee_id is distinct from auth.uid() then
    insert into task_notifications (user_id, project_id, task_id, actor_id)
    values (new.assignee_id, new.project_id, new.id, auth.uid());
  end if;
  return null;
end $$;

drop trigger if exists tasks_queue_assign on public.tasks;
create trigger tasks_queue_assign after insert or update of assignee_id on public.tasks
for each row execute function public.queue_assign_notification();

-- Забрать письма «назначили задачу» (p_project = null — по всем проектам).
-- Помечает отправленными; если письмо не ушло, сервер снимает отметку.
create or replace function public.claim_assign_notifications(p_project uuid default null)
returns table (
  n_id uuid,
  email text,
  lang text,
  recipient_name text,
  project_id uuid,
  project_name text,
  task_id uuid,
  task_name text,
  deadline date,
  actor_name text
)
language sql volatile security definer set search_path = public as $$
  with claimed as (
    update task_notifications n set sent_at = now()
    where n.id in (
      select x.id from task_notifications x
      where x.sent_at is null and (p_project is null or x.project_id = p_project)
      order by x.created_at
      limit 200
      for update skip locked
    )
    returning n.*
  )
  select c.id, u.email, u.lang, coalesce(nullif(u.full_name, ''), u.email),
         c.project_id, pr.name, c.task_id, t.name, t.deadline,
         coalesce(nullif(a.full_name, ''), a.email)
  from claimed c
  join profiles u on u.id = c.user_id
  join tasks t on t.id = c.task_id
  join projects pr on pr.id = c.project_id
  left join profiles a on a.id = c.actor_id
  where u.notify_assign
    and t.assignee_id = c.user_id   -- всё ещё исполнитель
    -- почта долго не была подключена — старые назначения не рассылаем (просто помечаем)
    and c.created_at > now() - interval '1 day'
$$;

-- Забрать непрочитанные комментарии для писем-сводок.
-- Попадают комментарии других людей старше p_delay_minutes (успели бы прочитать в планере),
-- которых ещё не было в письме. Отметка comments_notified_at сдвигается.
create or replace function public.claim_comment_digests(p_delay_minutes int default 10)
returns table (
  user_id uuid,
  email text,
  lang text,
  recipient_name text,
  project_id uuid,
  project_name text,
  task_id uuid,
  task_name text,
  author_name text,
  body text,
  created_at timestamptz
)
language sql volatile security definer set search_path = public as $$
  -- два запуска одновременно не пришлют одно и то же дважды
  select pg_advisory_xact_lock(140142);

  with cand as (
    select m.user_id as uid, u.email, u.lang,
           coalesce(nullif(u.full_name, ''), u.email) as recipient_name,
           c.project_id, pr.name as project_name, c.task_id, t.name as task_name,
           coalesce(nullif(a.full_name, ''), a.email) as author_name,
           left(c.body, 600) as body, c.created_at
    from comments c
    join project_members m on m.project_id = c.project_id
    join profiles u on u.id = m.user_id
    join tasks t on t.id = c.task_id
    join projects pr on pr.id = c.project_id
    left join profiles a on a.id = c.author_id
    left join comment_reads r on r.task_id = c.task_id and r.user_id = m.user_id
    where u.notify_comments
      and c.author_id <> m.user_id
      and c.created_at > coalesce(r.last_read_at, m.created_at)
      and c.created_at > u.comments_notified_at
      -- почта долго не была подключена — в сводку только последние сутки
      and c.created_at > now() - interval '1 day'
      and c.created_at <= now() - make_interval(mins => p_delay_minutes)
  ),
  mark as (
    update profiles p set comments_notified_at = x.mx
    from (select uid, max(created_at) as mx from cand group by uid) x
    where p.id = x.uid
    returning p.id
  )
  select uid, email, lang, recipient_name, project_id, project_name,
         task_id, task_name, author_name, body, created_at
  from cand
  order by uid, project_id, created_at
$$;

-- ---------- права ----------
grant select, insert, update, delete on public.task_notifications to service_role;
grant select, update on public.profiles to service_role;
revoke all on function public.claim_assign_notifications(uuid) from public, anon, authenticated;
revoke all on function public.claim_comment_digests(int) from public, anon, authenticated;
grant execute on function public.claim_assign_notifications(uuid) to service_role;
grant execute on function public.claim_comment_digests(int) to service_role;

-- Проверка: должна вернуть 4 колонки настроек
select column_name from information_schema.columns
where table_schema = 'public' and table_name = 'profiles'
  and column_name in ('notify_assign','notify_comments','lang','comments_notified_at');
