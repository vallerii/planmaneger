-- =============================================================
-- 0004: Рынок (конкуренты, потенциальные клиенты, выводы)
--       + связь «гипотеза → задачи»
-- Запустите в Supabase → SQL Editor → New query → Run (после 0003)
-- =============================================================

-- новые виды записей профиля
alter table public.profile_items drop constraint if exists profile_items_kind_check;
alter table public.profile_items add constraint profile_items_kind_check
  check (kind in ('problem','icp','hypothesis','risk','decision','competitor','prospect'));

-- «Что мы узнали из анализа рынка»
alter table public.product_profiles add column if not exists market_notes text not null default '';

-- задача может проверять гипотезу
alter table public.tasks add column if not exists hypothesis_id uuid
  references public.profile_items(id) on delete set null;
create index if not exists tasks_hypothesis_idx on public.tasks(hypothesis_id) where hypothesis_id is not null;

-- гипотеза должна быть из того же проекта
create or replace function public.tasks_check_hypothesis()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.hypothesis_id is not null and not exists (
    select 1 from profile_items
    where id = new.hypothesis_id and project_id = new.project_id and kind = 'hypothesis'
  ) then
    raise exception 'Гипотеза не найдена в этом проекте';
  end if;
  return new;
end $$;

drop trigger if exists tasks_zz_check_hypothesis on public.tasks;
-- имя на «zz», чтобы срабатывать после tasks_sync_project
create trigger tasks_zz_check_hypothesis before insert or update of hypothesis_id, project_id, phase_id on public.tasks
for each row execute function public.tasks_check_hypothesis();
