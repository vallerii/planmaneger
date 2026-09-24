-- =============================================================
-- 0003: Профиль продукта (миссия, позиционирование, тезис,
--       проблемы, ICP, гипотезы, риски, решения, история)
-- Запустите в Supabase → SQL Editor → New query → Run (после 0002)
-- =============================================================

-- ---------- одна запись на проект: «текстовые» блоки ----------
create table if not exists public.product_profiles (
  project_id uuid primary key references public.projects(id) on delete cascade,
  mission text not null default '',
  positioning jsonb not null default '{}'::jsonb,   -- {icp_id, problem_id, alternatives, category, value, difference}
  thesis jsonb not null default '{}'::jsonb,        -- {main, why_now, advantage}
  next_review date,
  reviewed jsonb not null default '{}'::jsonb,      -- {section: iso-дата «актуально»}
  updated_at timestamptz not null default now(),
  updated jsonb not null default '{}'::jsonb        -- {mission|positioning|thesis: iso-дата изменения}
);

-- ---------- записи-списки ----------
create table if not exists public.profile_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  kind text not null check (kind in ('problem','icp','hypothesis','risk','decision')),
  title text not null default '',
  status text not null default '',
  data jsonb not null default '{}'::jsonb,
  position int not null default 0,
  created_by uuid default auth.uid() references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists profile_items_project_idx on public.profile_items(project_id, kind, position);

-- ---------- история изменений ----------
create table if not exists public.profile_history (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  actor_id uuid default auth.uid() references public.profiles(id) on delete set null,
  event text not null,              -- added | status | removed | note
  kind text,
  title text,
  from_status text,
  to_status text,
  note text,
  created_at timestamptz not null default now()
);
create index if not exists profile_history_project_idx on public.profile_history(project_id, created_at desc);

-- ---------- триггеры: updated_at + автоматическая история ----------
create or replace function public.profile_items_touch()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists profile_items_touch on public.profile_items;
create trigger profile_items_touch before update on public.profile_items
for each row execute function public.profile_items_touch();

create or replace function public.profile_items_log()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    insert into profile_history(project_id, actor_id, event, kind, title, to_status)
    values (new.project_id, auth.uid(), 'added', new.kind, new.title, new.status);
  elsif tg_op = 'UPDATE' then
    if new.status is distinct from old.status then
      insert into profile_history(project_id, actor_id, event, kind, title, from_status, to_status)
      values (new.project_id, auth.uid(), 'status', new.kind, new.title, old.status, new.status);
    end if;
  elsif tg_op = 'DELETE' then
    -- при удалении всего проекта историю не пишем
    if not exists (select 1 from projects where id = old.project_id) then
      return old;
    end if;
    insert into profile_history(project_id, actor_id, event, kind, title, from_status)
    values (old.project_id, auth.uid(), 'removed', old.kind, old.title, old.status);
    return old;
  end if;
  return new;
end $$;

drop trigger if exists profile_items_log on public.profile_items;
create trigger profile_items_log after insert or update or delete on public.profile_items
for each row execute function public.profile_items_log();

-- ---------- RLS ----------
alter table public.product_profiles enable row level security;
alter table public.profile_items    enable row level security;
alter table public.profile_history  enable row level security;

drop policy if exists product_profiles_all on public.product_profiles;
create policy product_profiles_all on public.product_profiles for all to authenticated
  using (public.is_project_member(project_id)) with check (public.is_project_member(project_id));

drop policy if exists profile_items_all on public.profile_items;
create policy profile_items_all on public.profile_items for all to authenticated
  using (public.is_project_member(project_id)) with check (public.is_project_member(project_id));

drop policy if exists profile_history_select on public.profile_history;
create policy profile_history_select on public.profile_history for select to authenticated
  using (public.is_project_member(project_id));
drop policy if exists profile_history_insert on public.profile_history;
create policy profile_history_insert on public.profile_history for insert to authenticated
  with check (public.is_project_member(project_id) and event = 'note');
drop policy if exists profile_history_delete on public.profile_history;
create policy profile_history_delete on public.profile_history for delete to authenticated
  using (public.is_project_member(project_id) and event = 'note' and actor_id = auth.uid());

grant select, insert, update, delete on public.product_profiles, public.profile_items to authenticated;
grant select, insert, delete on public.profile_history to authenticated;
