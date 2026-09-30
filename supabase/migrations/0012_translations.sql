-- =============================================================
-- 0012: AI-перевод контента проекта (EN / DE)
--   • project_translations — одна строка на проект и язык;
--     data = { "task:<id>.name": { "h": "<хеш русского оригинала>", "t": "<перевод>" }, … }
--   • читать могут все участники (включая клиента / партнёра),
--     писать — только владелец и редактор через merge_translations()
--   • get_shared_task_translation — перевод для публичной ссылки /t/<token>
--   • projects.translate_comments — переводить ли комментарии (по умолчанию нет)
-- Запустите в Supabase → SQL Editor → New query → Run (после 0011)
-- =============================================================

create table if not exists public.project_translations (
  project_id uuid not null references public.projects(id) on delete cascade,
  lang text not null check (lang in ('en', 'de')),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null,
  primary key (project_id, lang)
);

alter table public.project_translations enable row level security;

drop policy if exists translations_select on public.project_translations;
create policy translations_select on public.project_translations for select to authenticated
  using (public.is_project_member(project_id));

-- писать напрямую нельзя — только через merge_translations()
grant select on public.project_translations to authenticated;

alter table public.projects add column if not exists translate_comments boolean not null default false;

-- Влить переводы: patch = { key: {h, t} }, remove = ключи, которых больше нет в проекте.
create or replace function public.merge_translations(
  p_project uuid,
  p_lang text,
  p_patch jsonb,
  p_remove text[] default '{}'
)
returns timestamptz
language plpgsql security definer set search_path = public as $$
declare v_at timestamptz := now();
begin
  if not is_project_editor(p_project) then
    raise exception 'Обновлять перевод может только владелец или редактор';
  end if;
  if p_lang not in ('en', 'de') then
    raise exception 'Неизвестный язык';
  end if;
  insert into project_translations (project_id, lang, data, updated_at, updated_by)
  values (p_project, p_lang, coalesce(p_patch, '{}'::jsonb), v_at, auth.uid())
  on conflict (project_id, lang) do update
    set data = (project_translations.data - coalesce(p_remove, '{}')) || coalesce(p_patch, '{}'::jsonb),
        updated_at = v_at,
        updated_by = auth.uid();
  return v_at;
end $$;

revoke all on function public.merge_translations(uuid, text, jsonb, text[]) from public;
grant execute on function public.merge_translations(uuid, text, jsonb, text[]) to authenticated;

-- Перевод названия и описания задачи для публичной ссылки (без входа).
create or replace function public.get_shared_task_translation(p_token uuid, p_lang text)
returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'name', tr.data -> ('task:' || t.id || '.name'),
    'description', tr.data -> ('task:' || t.id || '.description'),
    'phase', tr.data -> ('phase:' || t.phase_id || '.name'),
    'project', tr.data -> 'project.name'
  )
  from tasks t
  join project_translations tr on tr.project_id = t.project_id and tr.lang = p_lang
  where p_token is not null and t.share_token = p_token
  limit 1;
$$;

revoke all on function public.get_shared_task_translation(uuid, text) from public;
grant execute on function public.get_shared_task_translation(uuid, text) to anon, authenticated;

-- Проверка: должно вернуть 0 строк без ошибки
select * from public.project_translations limit 0;
