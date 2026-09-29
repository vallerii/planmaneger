-- =============================================================
-- 0011: роль «Клиент / партнёр» (viewer) — только просмотр
--   • роль выбирается при приглашении и меняется владельцем
--   • viewer видит доску, профиль и комментарии, но ничего не меняет,
--     не добавляет и не удаляет (проверяется в базе, не только в интерфейсе)
-- Запустите в Supabase → SQL Editor → New query → Run (после 0010)
-- =============================================================

-- ---------- роли ----------
alter table public.project_members drop constraint if exists project_members_role_check;
alter table public.project_members add constraint project_members_role_check
  check (role in ('owner','editor','viewer'));

alter table public.project_invites add column if not exists role text not null default 'editor';
alter table public.project_invites drop constraint if exists project_invites_role_check;
alter table public.project_invites add constraint project_invites_role_check
  check (role in ('editor','viewer'));

-- может ли текущий пользователь менять проект (владелец или редактор)
create or replace function public.is_project_editor(p_project uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from project_members
    where project_id = p_project and user_id = auth.uid() and role in ('owner','editor')
  );
$$;

-- ---------- приглашение с ролью ----------
drop function if exists public.invite_to_project(uuid, text);
create or replace function public.invite_to_project(p_project uuid, p_email text, p_role text default 'editor')
returns text language plpgsql security definer set search_path = public as $$
declare v_user uuid; v_email text := lower(trim(p_email));
begin
  if not is_project_owner(p_project) then
    raise exception 'Только владелец может приглашать участников';
  end if;
  if p_role not in ('editor','viewer') then
    raise exception 'Неизвестная роль';
  end if;
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Некорректный email';
  end if;
  select id into v_user from profiles where lower(email) = v_email;
  if v_user is not null then
    insert into project_members (project_id, user_id, role) values (p_project, v_user, p_role)
    on conflict (project_id, user_id) do update set role = excluded.role
      where project_members.role <> 'owner';
    return 'added';
  end if;
  insert into project_invites (project_id, email, invited_by, role)
  values (p_project, v_email, auth.uid(), p_role)
  on conflict (project_id, email) do update set role = excluded.role;
  return 'invited';
end $$;

-- сменить роль участника (только владелец, владельца не трогаем)
create or replace function public.set_member_role(p_project uuid, p_user uuid, p_role text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not is_project_owner(p_project) then
    raise exception 'Только владелец может менять роли';
  end if;
  if p_role not in ('editor','viewer') then
    raise exception 'Неизвестная роль';
  end if;
  update project_members set role = p_role
  where project_id = p_project and user_id = p_user and role <> 'owner';
end $$;

-- регистрация по приглашению — с ролью из приглашения
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
  select project_id, new.id, coalesce(role, 'editor') from project_invites where lower(email) = lower(new.email)
  on conflict do nothing;
  delete from project_invites where lower(email) = lower(new.email);
  return new;
end $$;

-- ---------- права: читать — участник, менять — владелец или редактор ----------
drop policy if exists projects_update on public.projects;
create policy projects_update on public.projects for update to authenticated
  using (public.is_project_editor(id)) with check (public.is_project_editor(id));

drop policy if exists phases_all on public.phases;
drop policy if exists phases_select on public.phases;
drop policy if exists phases_write on public.phases;
create policy phases_select on public.phases for select to authenticated
  using (public.is_project_member(project_id));
create policy phases_write on public.phases for all to authenticated
  using (public.is_project_editor(project_id)) with check (public.is_project_editor(project_id));

drop policy if exists tasks_all on public.tasks;
drop policy if exists tasks_select on public.tasks;
drop policy if exists tasks_write on public.tasks;
create policy tasks_select on public.tasks for select to authenticated
  using (public.is_project_member(project_id));
create policy tasks_write on public.tasks for all to authenticated
  using (public.is_project_editor(project_id)) with check (public.is_project_editor(project_id));

drop policy if exists comments_insert on public.comments;
create policy comments_insert on public.comments for insert to authenticated
  with check (author_id = auth.uid() and public.is_project_editor(project_id));

drop policy if exists product_profiles_all on public.product_profiles;
drop policy if exists product_profiles_select on public.product_profiles;
drop policy if exists product_profiles_write on public.product_profiles;
create policy product_profiles_select on public.product_profiles for select to authenticated
  using (public.is_project_member(project_id));
create policy product_profiles_write on public.product_profiles for all to authenticated
  using (public.is_project_editor(project_id)) with check (public.is_project_editor(project_id));

drop policy if exists profile_items_all on public.profile_items;
drop policy if exists profile_items_select on public.profile_items;
drop policy if exists profile_items_write on public.profile_items;
create policy profile_items_select on public.profile_items for select to authenticated
  using (public.is_project_member(project_id));
create policy profile_items_write on public.profile_items for all to authenticated
  using (public.is_project_editor(project_id)) with check (public.is_project_editor(project_id));

drop policy if exists profile_history_insert on public.profile_history;
create policy profile_history_insert on public.profile_history for insert to authenticated
  with check (public.is_project_editor(project_id) and event = 'note');
drop policy if exists profile_history_delete on public.profile_history;
create policy profile_history_delete on public.profile_history for delete to authenticated
  using (public.is_project_editor(project_id) and event = 'note' and actor_id = auth.uid());

-- ---------- права на функции ----------
grant execute on function public.is_project_editor(uuid) to authenticated;
grant execute on function public.invite_to_project(uuid, text, text) to authenticated;
grant execute on function public.set_member_role(uuid, uuid, text) to authenticated;
revoke execute on function public.invite_to_project(uuid, text, text) from anon;
revoke execute on function public.set_member_role(uuid, uuid, text) from anon;
