-- =============================================================
-- Перенос проекта «RAG» в новый шаблон («RAG 2.0»)
--   Старый проект НЕ меняется — всё копируется.
--   Что переносится:
--   • профиль продукта целиком (миссия, видение, тезисы, ICP, проблемы,
--     гипотезы, рынок, экономика, метрики, выход на рынок, риски, решения)
--     + история профиля и заметки
--   • задачи доски — в фазы нового шаблона (статусы, прогресс, размеры,
--     дедлайны, описания, комментарии сохраняются)
--   • участники проекта
--   Старая фаза «Профиль продукта» не переносится: её заменяют задачи шаблона,
--   их прогресс посчитается сам при первом открытии профиля.
-- Запуск: Supabase → SQL Editor → New query → вставить → Run. Один раз.
-- =============================================================

do $$
declare
  v_old uuid := '49a323e8-b558-45bd-9b62-cf7da839ecf3';  -- RAG
  v_new uuid := 'caa0e15f-7d6a-47c3-87e9-de50ce71878a';  -- RAG 2.0
  v_start timestamptz := now();  -- время транзакции = время записей триггеров
  r record;
  m record;
  v_data text;
  v_phase uuid;
  v_pos int;
  v_target text;
  v_new_task uuid;
begin
  if not exists (select 1 from projects where id = v_old) then
    raise exception 'Старый проект не найден';
  end if;
  if not exists (select 1 from projects where id = v_new) then
    raise exception 'Новый проект не найден';
  end if;
  if exists (select 1 from profile_items where project_id = v_new) then
    raise exception 'В новом проекте уже есть записи профиля — перенос уже выполнялся?';
  end if;

  -- ---------- участники ----------
  insert into project_members (project_id, user_id, role)
  select v_new, user_id, case when role = 'owner' then 'editor' else role end
  from project_members where project_id = v_old
  on conflict do nothing;

  -- ---------- профиль: одна строка ----------
  delete from product_profiles where project_id = v_new;
  insert into product_profiles
  select (jsonb_populate_record(
            null::product_profiles,
            to_jsonb(p) || jsonb_build_object('project_id', v_new)
         )).*
  from product_profiles p where p.project_id = v_old;

  -- ---------- записи профиля: новые id + перепривязка ссылок ----------
  create temp table _map (old_id uuid primary key, new_id uuid not null) on commit drop;
  insert into _map select id, gen_random_uuid() from profile_items where project_id = v_old;

  for r in select * from profile_items where project_id = v_old order by kind, position loop
    v_data := r.data::text;
    for m in select * from _map loop
      v_data := replace(v_data, m.old_id::text, m.new_id::text);
    end loop;
    insert into profile_items (id, project_id, kind, title, status, data, position, created_by, created_at, updated_at)
    values ((select new_id from _map where old_id = r.id), v_new, r.kind, r.title, r.status,
            v_data::jsonb, r.position, r.created_by, r.created_at, r.updated_at);
  end loop;

  -- ссылки на записи внутри профиля (позиционирование и т.п.)
  for m in select * from _map loop
    update product_profiles
      set positioning = replace(positioning::text, m.old_id::text, m.new_id::text)::jsonb
    where project_id = v_new and positioning::text like '%' || m.old_id::text || '%';
  end loop;

  -- история: убираем «Добавлено…», которые только что записали триггеры,
  -- и переносим настоящую историю старого проекта
  delete from profile_history where project_id = v_new and created_at >= v_start;
  insert into profile_history (project_id, actor_id, event, kind, title, from_status, to_status, note, created_at)
  select v_new, actor_id, event, kind, title, from_status, to_status, note, created_at
  from profile_history where project_id = v_old;

  -- ---------- фаза Platform (после Growth) ----------
  insert into phases (project_id, name, position)
  values (v_new, 'Platform', (select coalesce(max(position), -1) + 1 from phases where project_id = v_new));

  -- ---------- задачи доски ----------
  for r in
    select t.*, ph.name as phase_name
    from tasks t join phases ph on ph.id = t.phase_id
    where t.project_id = v_old and t.profile_step is null
    order by ph.position, t.position
  loop
    -- куда кладём задачу в новом шаблоне
    v_target := case
      when r.phase_name in ('Прототип + MVP', 'Админка') then 'Build'
      when r.name in ('Техническое SEO', 'Веб-аналитика и воронка',
                      'Google Search Console и позиции', '10–30 первых пользователей') then 'Launch'
      when r.name in ('Тест цен и призывов к действию', 'Приоритизация следующих продуктов') then 'Measure & Iterate'
      when r.name = 'SEO-страницы под услуги' or r.phase_name = 'Рост' then 'Growth'
      when r.phase_name = 'Платформа' then 'Platform'
      else null
    end;

    -- дубли задач шаблона: описание дописываем в задачу шаблона
    if r.name = 'Интервью с клиентами' or r.name = 'Продуктовая аналитика' then
      update tasks
        set description = description
          || '<p><strong>Из старого проекта «' || r.name || '»:</strong></p>'
          || coalesce(r.description, '')
      where project_id = v_new
        and name = case r.name when 'Интервью с клиентами' then 'Провести интервью с клиентами'
                               else 'Настроить аналитику' end;
      continue;
    end if;

    if v_target is null then
      raise notice 'Не перенесена (нет правила): % / %', r.phase_name, r.name;
      continue;
    end if;

    select id into v_phase from phases where project_id = v_new and name = v_target;
    select coalesce(max(position), -1) + 1 into v_pos from tasks where phase_id = v_phase;

    insert into tasks (project_id, phase_id, name, size, description, progress,
                       needs_discussion, status, deadline, position, hypothesis_id, created_by, created_at)
    values (v_new, v_phase, r.name, r.size, r.description, r.progress,
            r.needs_discussion, r.status, r.deadline, v_pos,
            (select new_id from _map where old_id = r.hypothesis_id),
            r.created_by, r.created_at)
    returning id into v_new_task;

    insert into comments (project_id, task_id, author_id, body, created_at)
    select v_new, v_new_task, author_id, body, created_at from comments where task_id = r.id;
  end loop;

  raise notice 'Готово: профиль, % записей, задачи и участники перенесены',
    (select count(*) from profile_items where project_id = v_new);
end $$;

-- Проверка: задачи по фазам нового проекта
select ph.position, ph.name, count(t.id) as tasks
from phases ph left join tasks t on t.phase_id = ph.id
where ph.project_id = 'caa0e15f-7d6a-47c3-87e9-de50ce71878a'
group by ph.position, ph.name order by ph.position;
