-- =============================================================
-- 0016: «Доступы» — логины и пароли клиента в проекте
--   • пароль хранится только зашифрованным (AES-256-GCM, ключ CREDENTIALS_KEY — в Vercel, не в базе)
--   • видят и меняют только владелец и редакторы; клиент (viewer) — ничего
--   • зашифрованный пароль напрямую не читается: только credential_reveal(),
--     которая сразу пишет в журнал, кто и когда открыл / скопировал
--   • журнал видит только владелец проекта
-- Запустите в Supabase → SQL Editor → New query → Run (после 0015). Повторный запуск безопасен.
-- =============================================================

create table if not exists public.project_credentials (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null check (length(btrim(title)) between 1 and 120),
  url text check (url is null or length(url) <= 500),
  login text check (login is null or length(login) <= 200),
  -- «v1:» + base64(iv | tag | шифротекст); расшифровать можно только на сервере
  secret_enc text check (secret_enc is null or length(secret_enc) <= 4000),
  has_secret boolean generated always as (secret_enc is not null) stored,
  note text check (note is null or length(note) <= 2000),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);
create index if not exists project_credentials_project_idx on public.project_credentials(project_id);

alter table public.project_credentials enable row level security;

drop policy if exists project_credentials_select on public.project_credentials;
create policy project_credentials_select on public.project_credentials for select to authenticated
  using (public.is_project_editor(project_id));
drop policy if exists project_credentials_insert on public.project_credentials;
create policy project_credentials_insert on public.project_credentials for insert to authenticated
  with check (public.is_project_editor(project_id));
drop policy if exists project_credentials_update on public.project_credentials;
create policy project_credentials_update on public.project_credentials for update to authenticated
  using (public.is_project_editor(project_id)) with check (public.is_project_editor(project_id));
drop policy if exists project_credentials_delete on public.project_credentials;
create policy project_credentials_delete on public.project_credentials for delete to authenticated
  using (public.is_project_editor(project_id));

-- secret_enc нельзя прочитать обычным select — только через credential_reveal()
revoke all on public.project_credentials from anon, authenticated;
grant select (id, project_id, title, url, login, has_secret, note,
              created_by, created_at, updated_by, updated_at)
  on public.project_credentials to authenticated;
grant insert (project_id, title, url, login, secret_enc, note, created_by)
  on public.project_credentials to authenticated;
grant update (title, url, login, secret_enc, note)
  on public.project_credentials to authenticated;
grant delete on public.project_credentials to authenticated;

-- кто и когда изменил
create or replace function public.credentials_touch()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  if tg_op = 'INSERT' then
    new.created_by := coalesce(auth.uid(), new.created_by);
  end if;
  return new;
end $$;
drop trigger if exists credentials_touch on public.project_credentials;
create trigger credentials_touch before insert or update on public.project_credentials
for each row execute function public.credentials_touch();

-- ---------- журнал ----------
create table if not exists public.credential_log (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  credential_id uuid references public.project_credentials(id) on delete set null,
  title text not null,               -- название на момент события (запись могли удалить)
  user_id uuid references public.profiles(id) on delete set null,
  action text not null check (action in ('view','copy','create','update','delete')),
  created_at timestamptz not null default now()
);
create index if not exists credential_log_project_idx on public.credential_log(project_id, created_at desc);
create index if not exists credential_log_user_idx on public.credential_log(project_id, user_id);

alter table public.credential_log enable row level security;
drop policy if exists credential_log_select on public.credential_log;
create policy credential_log_select on public.credential_log for select to authenticated
  using (public.is_project_owner(project_id));
-- писать в журнал напрямую нельзя — только триггер и credential_reveal()
revoke all on public.credential_log from anon, authenticated;
grant select on public.credential_log to authenticated;

create or replace function public.credentials_log_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'DELETE' then
    -- проект удаляется целиком — журнал уйдёт вместе с ним
    if exists (select 1 from projects where id = old.project_id) then
      insert into credential_log (project_id, credential_id, title, user_id, action)
      values (old.project_id, null, old.title, auth.uid(), 'delete');
    end if;
    return old;
  end if;
  insert into credential_log (project_id, credential_id, title, user_id, action)
  values (new.project_id, new.id, new.title, auth.uid(),
          case when tg_op = 'INSERT' then 'create' else 'update' end);
  return new;
end $$;
drop trigger if exists credentials_log_change on public.project_credentials;
create trigger credentials_log_change after insert or update or delete on public.project_credentials
for each row execute function public.credentials_log_change();

-- открыть пароль: только владелец/редактор, каждый вызов — запись в журнал
create or replace function public.credential_reveal(p_id uuid, p_action text default 'view')
returns table (project_id uuid, secret_enc text)
language plpgsql security definer set search_path = public as $$
declare c project_credentials%rowtype;
begin
  if p_action not in ('view','copy') then
    raise exception 'Неизвестное действие';
  end if;
  select * into c from project_credentials where id = p_id;
  if not found or not is_project_editor(c.project_id) then
    raise exception 'Нет доступа';
  end if;
  insert into credential_log (project_id, credential_id, title, user_id, action)
  values (c.project_id, c.id, c.title, auth.uid(), p_action);
  return query select c.project_id, c.secret_enc;
end $$;
revoke execute on function public.credential_reveal(uuid, text) from anon, public;
grant execute on function public.credential_reveal(uuid, text) to authenticated;

-- какие доступы открывал участник — подсказка владельцу при удалении участника
create or replace function public.credentials_seen_by(p_project uuid, p_user uuid)
returns table (title text, last_at timestamptz)
language sql stable security definer set search_path = public as $$
  select coalesce(c.title, l.title) as title, max(l.created_at) as last_at
  from credential_log l
  left join project_credentials c on c.id = l.credential_id
  where l.project_id = p_project and l.user_id = p_user
    and l.action in ('view','copy')
    and is_project_owner(p_project)
  group by coalesce(c.title, l.title)
  order by 2 desc;
$$;
revoke execute on function public.credentials_seen_by(uuid, uuid) from anon, public;
grant execute on function public.credentials_seen_by(uuid, uuid) to authenticated;
