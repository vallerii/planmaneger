# Planmaneger — планер проектов

Next.js 16 (App Router) + Tailwind CSS 4 + Supabase (Auth, Postgres, Realtime).

**Что умеет:** вход по email/паролю и через Google · проекты · фазы · задачи в фазах ·
drag & drop задач и фаз · расчёт сроков (размеры S–XXL в рабочих днях, даты фаз, дата запуска) ·
карточка задачи (прогресс, дедлайн, «нужно обсудить», описание с чек-листами и ссылками) ·
комментарии · приглашение участников по email · изменения других участников видны сразу (Realtime).

---

## 1. Supabase

1. **Ключи.** Supabase Dashboard → ваш проект → **Project Settings → Data API / API Keys**:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` (или `Publishable key`) → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - ⚠️ `service_role` / `secret` **не нужен** и в код не кладётся.
2. **База.** Dashboard → **SQL Editor → New query** → вставьте весь файл
   `supabase/migrations/0001_init.sql` → **Run**. (Скрипт можно запускать повторно.)
3. **URL-ы авторизации.** Dashboard → **Authentication → URL Configuration**:
   - Site URL: `http://localhost:3000` (потом — адрес продакшена)
   - Redirect URLs: `http://localhost:3000/auth/callback` (и `https://ваш-домен/auth/callback`)
4. **Email + пароль** включён по умолчанию. Для быстрой разработки можно отключить подтверждение почты:
   Authentication → Sign In / Providers → Email → *Confirm email* — off.
5. **Google** (опционально):
   - Google Cloud Console → APIs & Services → Credentials → *Create OAuth client ID* → Web application.
   - Authorized redirect URI: `https://<ваш-проект>.supabase.co/auth/v1/callback`
     (точный адрес показан в Supabase → Authentication → Providers → Google).
   - Client ID и Client Secret вставьте в Supabase → Authentication → Providers → Google → Enable.

## 2. Запуск

```bash
cp .env.local.example .env.local   # и впишите URL и anon key
npm install
npm run dev
```

Откройте http://localhost:3000 → зарегистрируйтесь → создайте проект.

## Структура

```
supabase/migrations/0001_init.sql   схема БД, RLS-политики, RPC, триггеры
src/proxy.ts                        обновление сессии + защита страниц (в Next 16 вместо middleware)
src/lib/supabase/*                  клиенты Supabase (браузер / сервер / proxy)
src/lib/schedule.ts                 расчёт сроков (перенесён из прототипа)
src/app/login                       вход / регистрация / Google
src/app/auth/callback               обмен кода OAuth / подтверждения email на сессию
src/app/page.tsx                    список проектов + создание
src/app/projects/[id]               доска проекта
src/components/board/*              доска: фазы, карточки, drag & drop, панель задачи, участники
```

## Права доступа

- Проект видят только участники (`project_members`). Создатель — владелец.
- Владелец приглашает по email: если аккаунт уже есть — доступ сразу; если нет —
  приглашение ждёт, и после регистрации с этим email проект появится автоматически.
  (Письмо-приглашение само не отправляется — просто скиньте человеку ссылку на сайт.)
- Участники редактируют фазы/задачи и пишут комментарии; удалять проект и управлять участниками — только владелец.
