-- =============================================================
-- Planmaneger: схема БД (Supabase / Postgres)
-- Запустите целиком в Supabase → SQL Editor → New query → Run
-- =============================================================

create extension if not exists pgcrypto;

-- ---------- PROFILES ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);
create unique index if not exists profiles_email_lower_idx on public.profiles (lower(email));

-- ---------- PROJECTS ----------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 200),
  start_date date not null default current_date,
  size_days jsonb not null default '{"S":1,"M":2,"L":4,"XL":8,"XXL":16}'::jsonb,
  owner_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.project_members (
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'editor' check (role in ('owner','editor')),
  created_at timestamptz not null default now(),
  primary key (project_id, user_id)
);
create index if not exists project_members_user_idx on public.project_members(user_id);

create table if not exists public.project_invites (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  email text not null,
  invited_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (project_id, email)
);

-- ---------- PHASES / TASKS / COMMENTS ----------
create table if not exists public.phases (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null default 'Новая фаза',
  position int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists phases_project_idx on public.phases(project_id, position);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  phase_id uuid not null references public.phases(id) on delete cascade,
  name text not null default 'Без названия',
  size text not null default 'M' check (size in ('S','M','L','XL','XXL')),
  description text not null default '',
  progress int not null default 0 check (progress between 0 and 100),
  needs_discussion boolean not null default false,
  deadline date,
  position int not null default 0,
  created_by uuid default auth.uid() references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists tasks_phase_idx on public.tasks(phase_id, position);
create index if not exists tasks_project_idx on public.tasks(project_id);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  author_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 10000),
  created_at timestamptz not null default now()
);
create index if not exists comments_task_idx on public.comments(task_id, created_at);

-- =============================================================
-- HELPERS
-- =============================================================
create or replace function public.is_project_member(p_project uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from project_members where project_id = p_project and user_id = auth.uid());
$$;

create or replace function public.is_project_owner(p_project uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from project_members where project_id = p_project and user_id = auth.uid() and role = 'owner');
$$;

create or replace function public.shares_project_with(p_user uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from project_members a
    join project_members b on a.project_id = b.project_id
    where a.user_id = auth.uid() and b.user_id = p_user
  );
$$;

-- profile при регистрации + принятие приглашений
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;

  insert into project_members (project_id, user_id, role)
  select project_id, new.id, 'editor' from project_invites where lower(email) = lower(new.email)
  on conflict do nothing;
  delete from project_invites where lower(email) = lower(new.email);
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- владелец проекта автоматически становится участником
create or replace function public.handle_new_project()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into project_members (project_id, user_id, role) values (new.id, new.owner_id, 'owner')
  on conflict do nothing;
  return new;
end $$;

drop trigger if exists on_project_created on public.projects;
create trigger on_project_created after insert on public.projects
for each row execute function public.handle_new_project();

-- project_id у задачи всегда = project_id фазы
create or replace function public.sync_task_project()
returns trigger language plpgsql set search_path = public as $$
begin
  select project_id into new.project_id from phases where id = new.phase_id;
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists tasks_sync_project on public.tasks;
create trigger tasks_sync_project before insert or update on public.tasks
for each row execute function public.sync_task_project();

create or replace function public.sync_comment_project()
returns trigger language plpgsql set search_path = public as $$
begin
  select project_id into new.project_id from tasks where id = new.task_id;
  return new;
end $$;

drop trigger if exists comments_sync_project on public.comments;
create trigger comments_sync_project before insert on public.comments
for each row execute function public.sync_comment_project();

-- =============================================================
-- RPC
-- =============================================================

-- Пригласить по email: если пользователь есть — сразу добавляем, иначе создаём приглашение
create or replace function public.invite_to_project(p_project uuid, p_email text)
returns text language plpgsql security definer set search_path = public as $$
declare v_user uuid; v_email text := lower(trim(p_email));
begin
  if not is_project_owner(p_project) then
    raise exception 'Только владелец может приглашать участников';
  end if;
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Некорректный email';
  end if;
  select id into v_user from profiles where lower(email) = v_email;
  if v_user is not null then
    insert into project_members (project_id, user_id, role) values (p_project, v_user, 'editor')
    on conflict do nothing;
    return 'added';
  end if;
  insert into project_invites (project_id, email, invited_by) values (p_project, v_email, auth.uid())
  on conflict (project_id, email) do nothing;
  return 'invited';
end $$;

-- Переупорядочить фазы
create or replace function public.reorder_phases(p_project uuid, p_ids uuid[])
returns void language plpgsql security invoker set search_path = public as $$
begin
  update phases p set position = x.ord - 1
  from unnest(p_ids) with ordinality as x(id, ord)
  where p.id = x.id and p.project_id = p_project;
end $$;

-- Переупорядочить задачи в фазе (и перенести в неё)
create or replace function public.reorder_tasks(p_phase uuid, p_ids uuid[])
returns void language plpgsql security invoker set search_path = public as $$
begin
  update tasks t set phase_id = p_phase, position = x.ord - 1
  from unnest(p_ids) with ordinality as x(id, ord)
  where t.id = x.id
    and t.project_id = (select project_id from phases where id = p_phase);
end $$;

-- =============================================================
-- RLS
-- =============================================================
alter table public.profiles        enable row level security;
alter table public.projects        enable row level security;
alter table public.project_members enable row level security;
alter table public.project_invites enable row level security;
alter table public.phases          enable row level security;
alter table public.tasks           enable row level security;
alter table public.comments        enable row level security;

-- profiles
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select to authenticated
  using (id = auth.uid() or public.shares_project_with(id));
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- projects
drop policy if exists projects_select on public.projects;
create policy projects_select on public.projects for select to authenticated
  using (public.is_project_member(id) or owner_id = auth.uid());
drop policy if exists projects_insert on public.projects;
create policy projects_insert on public.projects for insert to authenticated
  with check (owner_id = auth.uid());
drop policy if exists projects_update on public.projects;
create policy projects_update on public.projects for update to authenticated
  using (public.is_project_member(id)) with check (public.is_project_member(id));
drop policy if exists projects_delete on public.projects;
create policy projects_delete on public.projects for delete to authenticated
  using (public.is_project_owner(id));

-- members
drop policy if exists members_select on public.project_members;
create policy members_select on public.project_members for select to authenticated
  using (public.is_project_member(project_id));
drop policy if exists members_delete on public.project_members;
create policy members_delete on public.project_members for delete to authenticated
  using ((public.is_project_owner(project_id) and role <> 'owner') or (user_id = auth.uid() and role <> 'owner'));

-- invites
drop policy if exists invites_select on public.project_invites;
create policy invites_select on public.project_invites for select to authenticated
  using (public.is_project_member(project_id));
drop policy if exists invites_delete on public.project_invites;
create policy invites_delete on public.project_invites for delete to authenticated
  using (public.is_project_owner(project_id));

-- phases
drop policy if exists phases_all on public.phases;
create policy phases_all on public.phases for all to authenticated
  using (public.is_project_member(project_id)) with check (public.is_project_member(project_id));

-- tasks
drop policy if exists tasks_all on public.tasks;
create policy tasks_all on public.tasks for all to authenticated
  using (public.is_project_member(project_id)) with check (public.is_project_member(project_id));

-- comments
drop policy if exists comments_select on public.comments;
create policy comments_select on public.comments for select to authenticated
  using (public.is_project_member(project_id));
drop policy if exists comments_insert on public.comments;
create policy comments_insert on public.comments for insert to authenticated
  with check (author_id = auth.uid() and public.is_project_member(project_id));
drop policy if exists comments_delete on public.comments;
create policy comments_delete on public.comments for delete to authenticated
  using (author_id = auth.uid());

-- =============================================================
-- REALTIME (изменения от других участников видны без перезагрузки)
-- =============================================================
do $$ begin
  begin alter publication supabase_realtime add table public.phases;   exception when others then null; end;
  begin alter publication supabase_realtime add table public.tasks;    exception when others then null; end;
  begin alter publication supabase_realtime add table public.comments; exception when others then null; end;
  begin alter publication supabase_realtime add table public.projects; exception when others then null; end;
end $$;

-- =============================================================
-- GRANTS (на случай, если в проекте отключена авто-выдача прав Data API)
-- =============================================================
grant usage on schema public to authenticated;
grant select, insert, update, delete on
  public.profiles, public.projects, public.project_members, public.project_invites,
  public.phases, public.tasks, public.comments
to authenticated;
grant execute on function
  public.invite_to_project(uuid, text), public.reorder_phases(uuid, uuid[]), public.reorder_tasks(uuid, uuid[]),
  public.is_project_member(uuid), public.is_project_owner(uuid), public.shares_project_with(uuid)
to authenticated;
revoke execute on function public.invite_to_project(uuid, text) from anon;
