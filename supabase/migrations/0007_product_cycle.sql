-- =============================================================
-- 0007: полный продуктовый цикл
--   метрики успеха, каналы, путь клиента (записи профиля),
--   видение, размер рынка (TAM/SAM/SOM), план запуска (GTM),
--   задачи фазы 0 для метрик и выхода на рынок
-- Запустите в Supabase → SQL Editor → New query → Run (после 0006)
-- =============================================================

alter table public.profile_items drop constraint if exists profile_items_kind_check;
alter table public.profile_items add constraint profile_items_kind_check
  check (kind in ('problem','icp','hypothesis','risk','decision','competitor','prospect','product',
                  'metric','channel','journey'));

alter table public.product_profiles add column if not exists vision text not null default '';
-- {tam:{value,calc}, sam:{value,calc}, som:{value,calc}}
alter table public.product_profiles add column if not exists market_size jsonb not null default '{}'::jsonb;
-- {clients_now, first100, launch_date, launch_type, launch_plan}
alter table public.product_profiles add column if not exists gtm jsonb not null default '{}'::jsonb;

alter table public.tasks drop constraint if exists tasks_profile_step_check;
alter table public.tasks add constraint tasks_profile_step_check
  check (profile_step in ('foundation','hypotheses','market','gtm','economics','metrics','risks'));
