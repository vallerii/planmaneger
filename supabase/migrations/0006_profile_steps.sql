-- =============================================================
-- 0006: Фаза 0 — задачи «заполнить профиль продукта»
--       tasks.profile_step связывает задачу с вкладкой профиля;
--       прогресс такой задачи считается из заполненности профиля.
-- Запустите в Supabase → SQL Editor → New query → Run (после 0005)
-- =============================================================

alter table public.tasks add column if not exists profile_step text
  check (profile_step in ('foundation','hypotheses','market','economics','risks'));
