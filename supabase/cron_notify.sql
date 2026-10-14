-- =============================================================
-- Расписание email-уведомлений (после миграции 0014).
-- Раз в 5 минут Supabase вызывает /api/cron/notify на Vercel:
-- сводки непрочитанных комментариев + письма о назначении, которые не ушли сразу.
--
-- 1) Supabase → Database → Extensions: включите pg_cron и pg_net.
-- 2) Замените <CRON_SECRET> на то же значение, что в переменной CRON_SECRET на Vercel.
-- 3) Запустите в SQL Editor.
-- =============================================================

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- повторный запуск файла заменяет задание
select cron.unschedule('planmaneger-notify')
where exists (select 1 from cron.job where jobname = 'planmaneger-notify');

select cron.schedule(
  'planmaneger-notify',
  '*/5 * * * *',
  $$
  select net.http_get(
    url := 'https://planmaneger.vercel.app/api/cron/notify',
    headers := jsonb_build_object('Authorization', 'Bearer <CRON_SECRET>'),
    timeout_milliseconds := 30000
  );
  $$
);

-- Проверка: последние запуски (status_code 200 — всё хорошо)
-- select status_code, content, created from net._http_response order by created desc limit 5;
