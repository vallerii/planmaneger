-- =============================================================
-- 0013: материалы проекта и заметки
--   • записи профиля «link» (название + ссылка) и «file» (документ)
--   • файлы — в Storage, бакет project-files, путь <project_id>/<uuid>-<имя>
--     читать могут все участники (включая клиента / партнёра),
--     загружать и удалять — владелец и редактор
--   • product_profiles.notes — заметки по проекту (rich text, HTML)
-- Запустите в Supabase → SQL Editor → New query → Run (после 0012)
-- =============================================================

alter table public.profile_items drop constraint if exists profile_items_kind_check;
alter table public.profile_items add constraint profile_items_kind_check
  check (kind in ('problem','icp','hypothesis','risk','decision','competitor','prospect','product',
                  'metric','channel','journey','link','file'));

alter table public.product_profiles add column if not exists notes text not null default '';

-- ---------- бакет для документов (приватный, до 50 МБ на файл) ----------
insert into storage.buckets (id, name, public, file_size_limit)
values ('project-files', 'project-files', false, 52428800)
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit;

-- id проекта из пути файла; null, если путь не начинается с uuid
create or replace function public.storage_project_id(p_name text)
returns uuid language sql immutable as $$
  select case
    when split_part(p_name, '/', 1) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    then split_part(p_name, '/', 1)::uuid
  end;
$$;
grant execute on function public.storage_project_id(text) to authenticated;

drop policy if exists project_files_select on storage.objects;
create policy project_files_select on storage.objects for select to authenticated
  using (bucket_id = 'project-files'
         and public.is_project_member(public.storage_project_id(name)));

drop policy if exists project_files_insert on storage.objects;
create policy project_files_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'project-files'
              and public.is_project_editor(public.storage_project_id(name)));

drop policy if exists project_files_update on storage.objects;
create policy project_files_update on storage.objects for update to authenticated
  using (bucket_id = 'project-files'
         and public.is_project_editor(public.storage_project_id(name)));

drop policy if exists project_files_delete on storage.objects;
create policy project_files_delete on storage.objects for delete to authenticated
  using (bucket_id = 'project-files'
         and public.is_project_editor(public.storage_project_id(name)));
