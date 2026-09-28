-- =============================================================
-- 0008: шаблон продуктового цикла (8 фаз) и петля пересмотра
--   • статус задачи «На пересмотре» (revisit)
--   • tasks.counted_from — с какого момента задача считает
--     изменения в профиле (повторные задачи и пересмотр)
--   • новые profile_step для задач шаблона
--   • product_profiles.mvp — цель и объём MVP
-- Запустите в Supabase → SQL Editor → New query → Run (после 0007)
-- =============================================================

alter table public.tasks drop constraint if exists tasks_status_check;
alter table public.tasks add constraint tasks_status_check
  check (status in ('todo','in_progress','discuss','revisit','done','cancelled'));

alter table public.tasks add column if not exists counted_from timestamptz;

alter table public.tasks drop constraint if exists tasks_profile_step_check;
alter table public.tasks add constraint tasks_profile_step_check
  check (profile_step in (
    -- старая фаза 0 (проекты, созданные до шаблона)
    'foundation','hypotheses','market','gtm','economics','metrics','risks',
    -- Product Profile
    'mission_vision','thesis','problems','icp',
    -- Discovery
    'market_research','prospects','interviews','discovery_insights','hypotheses_set',
    -- Validation
    'solution_hyp','risks_set','experiments','unit_economics','decision_validation',
    -- MVP
    'mvp_goal','mvp_scope','journey',
    -- Launch
    'analytics','channels_launch',
    -- Measure & Iterate
    'measure_data','new_opportunities','decision_cycle',
    -- Growth
    'growth_ideas','growth_channels','economics_growth'
  ));

-- {goal, in_scope, out_scope}
alter table public.product_profiles add column if not exists mvp jsonb not null default '{}'::jsonb;
