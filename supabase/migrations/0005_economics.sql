-- =============================================================
-- 0005: Экономика (продукты + план на 12/24/36 месяцев)
-- Запустите в Supabase → SQL Editor → New query → Run (после 0004)
-- =============================================================

-- продукты хранятся как записи профиля вида 'product'
alter table public.profile_items drop constraint if exists profile_items_kind_check;
alter table public.profile_items add constraint profile_items_kind_check
  check (kind in ('problem','icp','hypothesis','risk','decision','competitor','prospect','product'));

-- настройки плана: {currency, horizon, base_sales, base_fixed, quarters:[{sales,cost}]}
alter table public.product_profiles add column if not exists economics jsonb not null default '{}'::jsonb;
