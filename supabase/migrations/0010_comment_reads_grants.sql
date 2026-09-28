-- =============================================================
-- 0010: права доступа для непрочитанных комментариев
--   В новых проектах Supabase таблицы, созданные через SQL, не получают
--   права для ролей API автоматически — из-за этого колокольчик получал 403.
-- Запустите в Supabase → SQL Editor → New query → Run (после 0009)
-- =============================================================

grant select, insert, update, delete on public.comment_reads to authenticated;
grant execute on function public.my_unread_comments(uuid) to authenticated;
grant execute on function public.my_unread_projects() to authenticated;

-- Проверка: должно вернуть строку без ошибки (пусто или с данными)
select * from public.my_unread_projects();
