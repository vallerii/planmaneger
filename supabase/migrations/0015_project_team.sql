-- =============================================================
-- 0015: команда проекта — внешние исполнители без регистрации
--   • project_team — программисты, дизайнеры и т.д. (свой список у каждого проекта)
--   • видят и меняют владелец и редакторы; клиент (viewer) — только роль, без имени и контакта
--   • удалять нельзя — только архивировать (старые задачи сохраняют исполнителя)
--   • tasks.team_member_id — исполнитель из команды; у задачи ОДИН исполнитель:
--     либо участник (assignee_id), либо человек из команды (team_member_id)
-- Запустите в Supabase → SQL Editor → New query → Run (после 0014). Повторный запуск безопасен.
-- =============================================================

create table if not exists public.project_team (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null check (length(btrim(name)) between 1 and 80),
  role text not null default 'developer'
    check (role in ('developer','designer','qa','other')),
  -- своя подпись роли, если role = 'other' («копирайтер», «SEO»…)
  role_custom text check (role_custom is null or length(role_custom) <= 40),
  contact text check (contact is null or length(contact) <= 200),
  archived boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists project_team_project_idx on public.project_team(project_id);
-- без дублей: одно и то же имя дважды в активной команде проекта нельзя
create unique index if not exists project_team_name_uniq
  on public.project_team(project_id, lower(btrim(name))) where not archived;

alter table public.project_team enable row level security;

-- имя и контакт — только владелец и редакторы
drop policy if exists project_team_select on public.project_team;
create policy project_team_select on public.project_team for select to authenticated
  using (public.is_project_editor(project_id));
drop policy if exists project_team_insert on public.project_team;
create policy project_team_insert on public.project_team for insert to authenticated
  with check (public.is_project_editor(project_id));
drop policy if exists project_team_update on public.project_team;
create policy project_team_update on public.project_team for update to authenticated
  using (public.is_project_editor(project_id)) with check (public.is_project_editor(project_id));
-- delete-политики нет: удалить нельзя, только archived = true

grant select, insert, update on public.project_team to authenticated;

-- клиенту (и всем участникам) — только роли, без имён и контактов
create or replace function public.project_team_roles(p_project uuid)
returns table (id uuid, role text, role_custom text)
language sql stable security definer set search_path = public as $$
  select t.id, t.role, t.role_custom from project_team t
  where t.project_id = p_project and is_project_member(p_project);
$$;
revoke execute on function public.project_team_roles(uuid) from anon, public;
grant execute on function public.project_team_roles(uuid) to authenticated;

-- ---------- исполнитель из команды ----------
alter table public.tasks
  add column if not exists team_member_id uuid references public.project_team(id) on delete set null;
create index if not exists tasks_team_member_idx on public.tasks(team_member_id);

-- один исполнитель: назначили участника — снимаем человека из команды, и наоборот;
-- человек из команды — только из этого проекта и не в архиве
create or replace function public.validate_task_team_member()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'UPDATE' then
    if new.assignee_id is not null and new.assignee_id is distinct from old.assignee_id then
      new.team_member_id := null;
    elsif new.team_member_id is not null and new.team_member_id is distinct from old.team_member_id then
      new.assignee_id := null;
    end if;
  elsif new.assignee_id is not null and new.team_member_id is not null then
    new.team_member_id := null;
  end if;

  if new.team_member_id is not null
     and (tg_op = 'INSERT' or new.team_member_id is distinct from old.team_member_id) then
    if not exists (
      select 1 from project_team
      where id = new.team_member_id and project_id = new.project_id and not archived
    ) then
      raise exception 'Исполнитель не из команды этого проекта или в архиве';
    end if;
  end if;
  return new;
end $$;

-- имя на «v» — после tasks_sync_project (project_id уже выставлен)
drop trigger if exists tasks_validate_team on public.tasks;
create trigger tasks_validate_team before insert or update on public.tasks
for each row execute function public.validate_task_team_member();

alter table public.tasks drop constraint if exists tasks_one_assignee;
alter table public.tasks add constraint tasks_one_assignee
  check (assignee_id is null or team_member_id is null);

-- ---------- Realtime: изменения команды видны сразу ----------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'project_team'
  ) then
    alter publication supabase_realtime add table public.project_team;
  end if;
exception when undefined_object then null; -- нет публикации (локальная база)
end $$;
