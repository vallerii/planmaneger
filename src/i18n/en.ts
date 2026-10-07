// Английский словарь интерфейса. Ключ — русский текст из кода (см. core.ts).
// Новые строки: добавьте сюда и в de.ts. Проверка: node scripts/i18n-check.mjs
export const en: Record<string, string> = {
  "Планер проектов: фазы, задачи, сроки":
    "Project planner: phases, tasks, timelines",
  "Не удалось войти. Попробуйте ещё раз.":
    "Sign-in failed. Please try again.",
  "Неверный email или пароль":
    "Wrong email or password",
  "Мы отправили письмо для подтверждения. Перейдите по ссылке из письма, чтобы войти.":
    "We've sent you a confirmation email. Follow the link in it to sign in.",
  "Вас пригласили в проект «{name}».":
    "You've been invited to the project “{name}”.",
  "Вас пригласили в проект.":
    "You've been invited to a project.",
  "Зарегистрируйтесь с этим email — проект откроется сразу после входа.":
    "Sign up with this email — the project opens right after you sign in.",
  "Войдите с этим email — проект появится в вашем списке.":
    "Sign in with this email — the project will appear in your list.",
  "Вход":
    "Sign in",
  "Регистрация":
    "Sign up",
  "Планирование проектов по фазам и задачам":
    "Project planning by phases and tasks",
  "Продолжить с Google":
    "Continue with Google",
  "или по email":
    "or with email",
  "Имя":
    "Name",
  "Как вас называть":
    "What should we call you",
  "Пароль":
    "Password",
  "Войти":
    "Sign in",
  "Создать аккаунт":
    "Create account",
  "Нет аккаунта?":
    "No account?",
  "Уже есть аккаунт?":
    "Already have an account?",
  "Зарегистрироваться":
    "Sign up",
  "Страница не найдена":
    "Page not found",
  "Все проекты":
    "All projects",
  "Такой страницы нет":
    "This page doesn't exist",
  "Возможно, ссылка устарела, проект или задачу удалили, или у вас нет к ним доступа. Если вам прислали ссылку — попросите владельца проекта пригласить вас.":
    "The link may be outdated, the project or task may have been deleted, or you don't have access. If someone sent you the link, ask the project owner to invite you.",
  "К моим проектам":
    "Go to my projects",
  "Проекты":
    "Projects",
  "Ваши проекты и проекты, куда вас пригласили":
    "Your projects and projects you've been invited to",
  "Пока нет проектов. Создайте первый — и добавьте в него фазы и задачи.":
    "No projects yet. Create your first one and add phases and tasks to it.",
  "Задача":
    "Task",
  "Ссылка недоступна":
    "Link unavailable",
  "Задача не найдена или доступ по ссылке был отключён.":
    "The task wasn't found or link access has been turned off.",
  "Статус":
    "Status",
  "Прогресс":
    "Progress",
  "Размер":
    "Size",
  "раб. дн.":
    "workdays",
  "Дедлайн":
    "Deadline",
  "Описание":
    "Description",
  "Описание пока не добавлено.":
    "No description yet.",
  "Обновлено":
    "Updated",
  "только просмотр":
    "view only",
  "Ошибка":
    "Error",
  "Запустите supabase/migrations/0008_cycle_template.sql в Supabase → SQL Editor: без неё задачи не свяжутся с профилем. Проект создан без задач — удалите его и создайте заново.":
    "Run supabase/migrations/0008_cycle_template.sql in Supabase → SQL Editor: without it, tasks can't be linked to the profile. The project was created without tasks — delete it and create it again.",
  "＋ Новый проект":
    "＋ New project",
  "Новый проект":
    "New project",
  "Название":
    "Name",
  "Например: Product Roadmap · 2026":
    "For example: Product Roadmap · 2026",
  "Дата старта (первый рабочий день)":
    "Start date (first workday)",
  "Проект начнётся с полного продуктового цикла: {phases}. Задачи, связанные с профилем продукта, заполняются сами по мере заполнения профиля. Лишнее можно удалить на доске.":
    "The project starts with the full product cycle: {phases}. Tasks linked to the product profile update themselves as the profile is filled in. You can delete anything you don't need on the board.",
  "Отмена":
    "Cancel",
  "Создаю…":
    "Creating…",
  "Создать":
    "Create",
  "Язык интерфейса":
    "Interface language",
  "Новых комментариев: {n}":
    "New comments: {n}",
  "просмотр":
    "view",
  "гость":
    "guest",
  "фаз":
    "phases",
  "задач":
    "tasks",
  "участн.":
    "members",
  "старт":
    "start",
  "Не удалось удалить:":
    "Couldn't delete:",
  "Удалить проект":
    "Delete project",
  "Удалить проект?":
    "Delete project?",
  "Проект «{name}» будет удалён вместе со всеми фазами ({phases}), задачами ({tasks}) и комментариями. Участники потеряют к нему доступ. Это действие нельзя отменить.":
    "The project “{name}” will be deleted together with all phases ({phases}), tasks ({tasks}) and comments. Members will lose access to it. This can't be undone.",
  "Доска":
    "Board",
  "Профиль продукта":
    "Product profile",
  "Выйти":
    "Sign out",
  "Ошибка:":
    "Error:",
  "Roadmap экспортирован":
    "Roadmap exported",
  "Вы можете смотреть проект, но не менять его":
    "You can view the project but not change it",
  "👁 Только просмотр":
    "👁 View only",
  "Старт:":
    "Start:",
  "⚙ Настройки":
    "⚙ Settings",
  "Экспорт JSON":
    "Export JSON",
  "＋ Фаза":
    "＋ Phase",
  "Открыть профиль продукта":
    "Open product profile",
  "Миссия":
    "Mission",
  "Не заполнена — добавьте миссию и позиционирование, чтобы не терять фокус":
    "Not filled in — add the mission and positioning to stay focused",
  "Профиль →":
    "Profile →",
  "Размер задачи:":
    "Task size:",
  "день":
    "day",
  "дн.":
    "days",
  "— приоритет. Клик по карточке открывает детали. Отменённые задачи не учитываются в сроках.":
    "— priority. Click a card to open details. Cancelled tasks don't count toward timelines.",
  "＋ Добавить фазу":
    "＋ Add phase",
  "Новая фаза":
    "New phase",
  "Например: Partnerships":
    "For example: Partnerships",
  "Добавить фазу":
    "Add phase",
  "Настройки сохранены":
    "Settings saved",
  "Удалить задачу?":
    "Delete task?",
  "Задача «{name}» будет удалена вместе с описанием и комментариями. Это действие нельзя отменить.":
    "The task “{name}” will be deleted together with its description and comments. This can't be undone.",
  "Дата старта":
    "Start date",
  "Первый рабочий день":
    "First workday",
  "Пересчитать":
    "Recalculate",
  "Настройки планировщика":
    "Planner settings",
  "Размер задачи → рабочих дней":
    "Task size → workdays",
  "Изменение длительности сразу пересчитает оставшиеся дни, прогресс фаз и дату запуска.":
    "Changing durations immediately recalculates remaining days, phase progress and the launch date.",
  "Сохранить":
    "Save",
  "Удалить фазу?":
    "Delete phase?",
  "Фаза «{name}» пустая и будет удалена.":
    "The phase “{name}” is empty and will be deleted.",
  "В фазе «{name}» {count}. Что с ними сделать?":
    "The phase “{name}” has {count}. What should happen to them?",
  "{n} задача":
    "{n} task",
  "{n} задачи":
    "{n} tasks",
  "{n} задач":
    "{n} tasks",
  "Перенести задачи в другую фазу":
    "Move tasks to another phase",
  "Удалить вместе с задачами":
    "Delete together with tasks",
  "Задачи и их комментарии удалятся безвозвратно":
    "Tasks and their comments will be deleted permanently",
  "Перенести и удалить фазу":
    "Move and delete phase",
  "Удалить фазу":
    "Delete phase",
  "Новых комментариев нет":
    "No new comments",
  "Новые комментарии":
    "New comments",
  "Отметить всё прочитанным":
    "Mark all as read",
  "Всё прочитано.":
    "All caught up.",
  "Без названия":
    "Untitled",
  "Участник":
    "Member",
  "Ссылка скопирована":
    "Link copied",
  "Теперь только просмотр":
    "Now view only",
  "Теперь редактор":
    "Now an editor",
  "Участники проекта":
    "Project members",
  "(вы)":
    "(you)",
  "Роль в проекте":
    "Role in the project",
  "Убрать из проекта":
    "Remove from project",
  "ждёт регистрации":
    "awaiting sign-up",
  "Скопировать ссылку-приглашение":
    "Copy invite link",
  "Отменить приглашение":
    "Cancel invitation",
  "Редактор":
    "Editor",
  "может всё менять":
    "can change everything",
  "Клиент / партнёр":
    "Client / partner",
  "email клиента или партнёра":
    "client's or partner's email",
  "email коллеги":
    "colleague's email",
  "Пригласить":
    "Invite",
  "{email} уже есть в системе и добавлен в проект. Отправьте ссылку, чтобы открыть проект:":
    "{email} already has an account and has been added to the project. Send the link to open the project:",
  "Отправьте {email} эту ссылку (в Telegram, WhatsApp, почтой). По ней откроется регистрация с уже заполненным email, а после входа — этот проект.":
    "Send {email} this link (via Telegram, WhatsApp or email). It opens sign-up with the email already filled in, and then this project after signing in.",
  "✓ Скопировано":
    "✓ Copied",
  "Скопировать":
    "Copy",
  "После приглашения появится ссылка — отправьте её человеку. Скопировать её снова можно иконкой рядом с приглашением.":
    "After inviting, a link appears — send it to the person. You can copy it again with the icon next to the invitation.",
  "Приглашать участников может только владелец проекта.":
    "Only the project owner can invite members.",
  "Готово":
    "Done",
  "Убрать участника?":
    "Remove member?",
  "Убрать":
    "Remove",
  "{name} потеряет доступ к проекту «{project}». Задачи и комментарии останутся.":
    "{name} will lose access to the project “{project}”. Tasks and comments will stay.",
  "Перетащить фазу":
    "Drag phase",
  "Влево":
    "Left",
  "Вправо":
    "Right",
  "готово":
    "done",
  "осталось":
    "left",
  "нужно обсудить":
    "to discuss",
  "Задачи уже были сделаны и снова пересматриваются — на % фазы и сроки не влияют":
    "These tasks were already done and are being revisited — they don't affect phase % or timelines",
  "на пересмотре":
    "being revisited",
  "Перетащите задачу сюда":
    "Drag a task here",
  "＋ Добавить задачу":
    "＋ Add task",
  "Переименовать проект":
    "Rename project",
  "Другие проекты":
    "Other projects",
  "Загрузка…":
    "Loading…",
  "Все проекты →":
    "All projects →",
  "Добавьте описание, заметки, чек-листы, ссылки…":
    "Add a description, notes, checklists, links…",
  "Вставьте ссылку (https://…)":
    "Paste a link (https://…)",
  "Жирный":
    "Bold",
  "Курсив":
    "Italic",
  "• Список":
    "• List",
  "1. Список":
    "1. List",
  "☑ Чек-лист":
    "☑ Checklist",
  "🔗 Ссылка":
    "🔗 Link",
  "Ссылка на задачу":
    "Task link",
  "Любой, у кого есть ссылка, может посмотреть задачу «{name}» без входа: название, статус, сроки и описание. Комментарии и остальной проект не видны. Редактировать по ссылке нельзя.":
    "Anyone with the link can view the task “{name}” without signing in: name, status, timelines and description. Comments and the rest of the project aren't visible. The link doesn't allow editing.",
  "Старая ссылка перестанет открываться":
    "The old link will stop working",
  "Отключить ссылку":
    "Turn off link",
  "Открыть ↗":
    "Open ↗",
  "Создайте ссылку, чтобы отправить задачу «{name}» исполнителю, у которого нет доступа к проекту. По ссылке откроется отдельная страница только с этой задачей — без входа и без возможности редактировать.":
    "Create a link to send the task “{name}” to someone who doesn't have access to the project. The link opens a separate page with just this task — no sign-in and no editing.",
  "Создать ссылку":
    "Create link",
  "Удалить задачу":
    "Delete task",
  "новый":
    "new",
  "новых":
    "new",
  "комм.":
    "comm.",
  "🧪 гипотеза":
    "🧪 hypothesis",
  "⚠ впритык":
    "⚠ tight",
  "⚠ не успеваем":
    "⚠ behind",
  "осталось {left} из {total} дн.":
    "{left} of {total} days left",
  "Размер задачи":
    "Task size",
  "Просрочено":
    "Overdue",
  "Дедлайн задачи — не влияет на планирование":
    "Task deadline — doesn't affect planning",
  "Удалить комментарий?":
    "Delete comment?",
  "Название задачи":
    "Task name",
  "Поделиться ссылкой на задачу":
    "Share task link",
  "Поделиться ссылкой":
    "Share link",
  "👁 Только просмотр — изменять задачу и писать комментарии может команда проекта.":
    "👁 View only — the project team can edit the task and write comments.",
  "Прогресс · из профиля":
    "Progress · from profile",
  "Задача закрыта вручную":
    "Task closed manually",
  "Начнёт считать, когда задача будет взята в работу":
    "Starts counting once the task is in progress",
  "Считает изменения с {date}":
    "Counts changes since {date}",
  "До 99% — закройте статусом «Готово», когда решите":
    "Up to 99% — close it with the “Done” status when you decide",
  "Осталось работы":
    "Work left",
  "Успеваем к дедлайну?":
    "On track for the deadline?",
  "Что заполнено в профиле":
    "What's filled in the profile",
  "{k} из {of}":
    "{k} of {of}",
  "Не удалось загрузить профиль.":
    "Couldn't load the profile.",
  "заполнить →":
    "fill in →",
  "Задача закрыта, но в профиле есть пустые пункты.":
    "The task is closed, but the profile still has empty items.",
  "Проверяет гипотезу":
    "Tests hypothesis",
  "Открыть в профиле →":
    "Open in profile →",
  "— не связана":
    "— not linked",
  "— гипотез пока нет в профиле":
    "— no hypotheses in the profile yet",
  "Гипотеза без формулировки":
    "Hypothesis without wording",
  "Обсуждение":
    "Discussion",
  "Пока нет комментариев.":
    "No comments yet.",
  "Пользователь":
    "User",
  "новое":
    "new",
  "удалить":
    "delete",
  "Напишите комментарий или вставьте ссылку… (Ctrl+Enter — отправить)":
    "Write a comment or paste a link… (Ctrl+Enter to send)",
  "Отправить":
    "Send",
  "Комментарии появятся после создания задачи":
    "Comments become available after the task is created",
  "Создать задачу":
    "Create task",
  "Поставьте дедлайн, чтобы проверить сроки":
    "Set a deadline to check the timeline",
  "✓ Готово":
    "✓ Done",
  "Задача выполнена":
    "Task completed",
  "Дедлайн прошёл, осталось {n} работы":
    "Deadline passed, {n} of work left",
  "Не успеваем":
    "Behind schedule",
  "Нужно {need}, до дедлайна {avail}":
    "Need {need}, {avail} until the deadline",
  "Впритык":
    "Tight",
  "Нужно {need}, до дедлайна {avail} — без запаса":
    "Need {need}, {avail} until the deadline — no buffer",
  "Успеваем":
    "On track",
  "Запас {n}":
    "Buffer: {n}",
  "Вкладка «Экономика» заработает после запуска {file} в Supabase → SQL Editor.":
    "The “Economics” tab will work after running {file} in Supabase → SQL Editor.",
  "Грубая модель, чтобы понять: сходится ли экономика и сколько денег нужно до выхода в плюс. Все цифры — до налогов.":
    "A rough model to see whether the economics work and how much money is needed until break-even. All figures are before tax.",
  "Валюта":
    "Currency",
  "Продукты и юнит-экономика":
    "Products and unit economics",
  "Что продаём, сколько стоит одна продажа и сколько на ней зарабатываем.":
    "What we sell, what one sale costs and how much we earn on it.",
  "Добавьте продукт или тариф: подписку или разовую продажу.":
    "Add a product or plan: a subscription or a one-time sale.",
  "Сумма долей продаж — {n}%. В расчёте доли автоматически приводятся к 100%.":
    "Sales shares add up to {n}%. The calculation normalizes them to 100% automatically.",
  "+ Добавить продукт":
    "+ Add product",
  "Финансовый план":
    "Financial plan",
  "Сколько новых продаж в месяц и постоянных расходов на старте, и как они растут от квартала к кварталу.":
    "How many new sales per month and fixed costs at the start, and how they grow quarter over quarter.",
  "Горизонт":
    "Horizon",
  "мес.":
    "mo.",
  "Новых продаж в месяц":
    "New sales per month",
  "шт.":
    "pcs",
  "Постоянные расходы в месяц":
    "Fixed costs per month",
  "Рост к предыдущему кварталу":
    "Growth vs. previous quarter",
  "Q1 — база из полей выше":
    "Q1 — base from the fields above",
  "Как в Q2 для всех":
    "Same as Q2 for all",
  "продажи":
    "sales",
  "расходы":
    "costs",
  "Прогноз на {n} мес.":
    "{n}-month forecast",
  "Добавьте продукт с ценой и укажите продажи в месяц — здесь появится расчёт.":
    "Add a product with a price and set monthly sales — the calculation will appear here.",
  "Операционная модель: подписки учитывают отток, CAC начисляется только на новых клиентов.":
    "Operating model: subscriptions account for churn, CAC applies only to new customers.",
  "Выручка":
    "Revenue",
  "за весь период":
    "for the whole period",
  "Привлечение":
    "Acquisition",
  "CAC × новые продажи":
    "CAC × new sales",
  "Себестоимость":
    "Cost of delivery",
  "часы + переменные":
    "hours + variable",
  "Постоянные":
    "Fixed",
  "с учётом роста":
    "including growth",
  "Операционная прибыль":
    "Operating profit",
  "маржа {n}%":
    "margin {n}%",
  "Выход в плюс":
    "Break-even",
  "месяц {n}":
    "month {n}",
  "не в этом горизонте":
    "not within this horizon",
  "первый месяц без убытка":
    "first month without a loss",
  "Нужно денег до окупаемости":
    "Money needed until payback",
  "самая глубокая точка накопленного минуса":
    "the deepest point of the cumulative loss",
  "Вложения окупаются":
    "Investment pays back",
  "сразу":
    "immediately",
  "накопленный результат снова ≥ 0":
    "cumulative result back to ≥ 0",
  "Скрыть таблицу по месяцам ↑":
    "Hide monthly table ↑",
  "Показать таблицу по месяцам ↓":
    "Show monthly table ↓",
  "Месяц":
    "Month",
  "Новые продажи":
    "New sales",
  "Расходы всего":
    "Total costs",
  "Прибыль":
    "Profit",
  "Маржа":
    "Margin",
  "Накоплено":
    "Cumulative",
  "Название продукта или тарифа":
    "Product or plan name",
  "Подписка / мес.":
    "Subscription / mo.",
  "Разовая продажа":
    "One-time sale",
  "Цена в месяц":
    "Price per month",
  "Цена":
    "Price",
  "Часов на клиента / мес.":
    "Hours per customer / mo.",
  "Часов на клиента":
    "Hours per customer",
  "ч":
    "h",
  "Стоимость часа команды":
    "Team hourly cost",
  "Прочие затраты на продажу":
    "Other costs per sale",
  "CAC (привлечение)":
    "CAC (acquisition)",
  "Отток в месяц":
    "Monthly churn",
  "Активных клиентов на старте":
    "Active customers at start",
  "Доля продаж":
    "Sales share",
  "Себестоимость продажи":
    "Cost per sale",
  "Вклад до CAC":
    "Contribution before CAC",
  "Маржа до CAC":
    "Margin before CAC",
  "CAC окупается за":
    "CAC payback",
  "LTV (вклад за жизнь)":
    "LTV (lifetime contribution)",
  "Прибыль с продажи после CAC":
    "Profit per sale after CAC",
  "Статус «Отказались» — продукт не учитывается в прогнозе.":
    "Status “Dropped” — the product isn't included in the forecast.",
  "Прогноз: выручка, расходы и прибыль по месяцам":
    "Forecast: revenue, costs and profit by month",
  "Нет данных для графика":
    "No data for the chart",
  "Месяц {m}":
    "Month {m}",
  "млн":
    "M",
  "тыс":
    "K",
  "Основной тезис":
    "Core thesis",
  "Мы помогаем [кому] решить [какую проблему] через [какой механизм], чтобы получить [измеримый результат].":
    "We help [whom] solve [which problem] through [which mechanism] to achieve [a measurable result].",
  "Почему сейчас":
    "Why now",
  "Что изменилось в рынке, технологиях, регулировании или поведении людей, из-за чего именно сейчас хорошее окно для продукта?":
    "What has changed in the market, technology, regulation or people's behavior that makes right now a good window for the product?",
  "Уникальное преимущество":
    "Unique advantage",
  "Почему клиент выберет нас, а не прямого конкурента, косвенную альтернативу или ручное решение?":
    "Why will a customer choose us over a direct competitor, an indirect alternative or a manual workaround?",
  "ICP без названия":
    "Untitled ICP",
  "Миссия и видение":
    "Mission and vision",
  "Миссия — зачем существует продукт. Видение — каким станет мир (или рынок), когда у нас получится. Меняются редко.":
    "Mission — why the product exists. Vision — what the world (or market) will look like when we succeed. These rarely change.",
  "Например: помогаем локальному бизнесу видеть и управлять тем, как их находят и оценивают в интернете.":
    "For example: we help local businesses see and manage how they're found and rated online.",
  "через 3–5 лет":
    "in 3–5 years",
  "Видение":
    "Vision",
  "Например: любой локальный бизнес знает, почему клиенты выбирают или не выбирают его, и может это исправить за день.":
    "For example: every local business knows why customers choose it or not, and can fix it within a day.",
  "Тезис продукта":
    "Product thesis",
  "Текущая версия продуктовой идеи. Главные неизвестные ведём в «Гипотезах» и «Рисках».":
    "The current version of the product idea. We track the main unknowns in “Hypotheses” and “Risks”.",
  "для позиционирования":
    "for positioning",
  "Мы — это…":
    "We are…",
  "сервис проверки репутации компании":
    "a company reputation check service",
  "Главный результат для клиента":
    "Main outcome for the customer",
  "за 1 день показывает, что мешает клиентам выбрать вас":
    "shows within 1 day what stops customers from choosing you",
  "Первое предложение попадает в позиционирование как «главное отличие» — начните с самого важного.":
    "The first sentence goes into positioning as the “key difference” — start with the most important point.",
  "Проблемы клиентов":
    "Customer problems",
  "Боли, которые мы решаем, и насколько мы в них уверены.":
    "The pains we solve and how confident we are about them.",
  "Пока нет проблем. Добавьте первую — с неё начинается позиционирование и гипотезы.":
    "No problems yet. Add the first one — positioning and hypotheses start from it.",
  "＋ Добавить проблему":
    "＋ Add problem",
  "ICP / целевые аудитории":
    "ICP / target audiences",
  "Сегменты клиентов, почему мы в них верим и по каким критериям считаем сегмент подтверждённым.":
    "Customer segments, why we believe in them and what criteria make a segment validated.",
  "Пока нет ICP. Опишите, кому продукт нужен больше всего.":
    "No ICP yet. Describe who needs the product most.",
  "5+ интервью с этим сегментом":
    "5+ interviews with this segment",
  "3+ подтверждения боли":
    "3+ confirmations of the pain",
  "1+ готовность платить / пилот":
    "1+ willingness to pay / pilot",
  "＋ Добавить ICP":
    "＋ Add ICP",
  "Сформулируйте проблему клиента":
    "Describe the customer's problem",
  "Работа клиента":
    "Customer job",
  "Когда…":
    "When…",
  "открываю карты и вижу 3 новых отзыва":
    "I open maps and see 3 new reviews",
  "я хочу…":
    "I want to…",
  "быстро ответить каждому":
    "reply to each one quickly",
  "чтобы…":
    "so that…",
  "новые клиенты видели, что нам не всё равно":
    "new customers see that we care",
  "У кого (ICP)":
    "Who has it (ICP)",
  "Все ICP":
    "All ICPs",
  "Почему это важно":
    "Why it matters",
  "Как часто, сколько стоит денег или времени":
    "How often, how much money or time it costs",
  "Доказательства":
    "Evidence",
  "Интервью, отзывы, цифры, примеры":
    "Interviews, reviews, numbers, examples",
  "Название сегмента, например «Салоны красоты 1–3 точки»":
    "Segment name, e.g. “Beauty salons with 1–3 locations”",
  "Размер, география, кто принимает решение":
    "Size, geography, who makes the decision",
  "конкретный человек и его сценарий":
    "a specific person and their scenario",
  "Персона":
    "Persona",
  "Например: Анна, 34, владелица салона на 2 точки. Утром смотрит отзывы в Google Maps, вечером сама отвечает клиентам в Instagram. Хочет…, мешает…, решает сейчас так…":
    "For example: Anna, 34, owns a salon with 2 locations. In the morning she checks reviews on Google Maps, in the evening she answers customers on Instagram herself. She wants…, is held back by…, currently solves it by…",
  "Почему думаем, что подходит":
    "Why we think it fits",
  "Видимый спрос, бюджет, частота проблемы":
    "Visible demand, budget, how often the problem occurs",
  "Критерии подтверждения":
    "Validation criteria",
  "Убрать критерий":
    "Remove criterion",
  "Новый критерий":
    "New criterion",
  "+ критерий":
    "+ criterion",
  "Все критерии выполнены — отметить «Подтверждён»":
    "All criteria met — mark as “Validated”",
  "включая общие для всех ICP":
    "including those shared by all ICPs",
  "Проблемы этого ICP":
    "Problems of this ICP",
  "Нет проблем — привяжите их в разделе «Проблемы»":
    "No problems — link them in the “Problems” section",
  "общая":
    "shared",
  "Узнаёт о проблеме":
    "Becomes aware of the problem",
  "Ищет решение":
    "Looks for a solution",
  "Выбирает и покупает":
    "Chooses and buys",
  "Начинает пользоваться":
    "Starts using",
  "Остаётся и рекомендует":
    "Stays and recommends",
  "Закрытая бета":
    "Closed beta",
  "Мягкий запуск":
    "Soft launch",
  "Публичный запуск":
    "Public launch",
  "Вкладка заработает после запуска {file} в Supabase → SQL Editor.":
    "This tab will work after running {file} in Supabase → SQL Editor.",
  "Метрика без названия":
    "Untitled metric",
  "Путь клиента":
    "Customer journey",
  "Этапы, которые проходит клиент: от первого касания до повторной покупки. На каждом — что он делает, где мы с ним встречаемся и что мешает.":
    "The stages a customer goes through, from first touch to repeat purchase. For each: what they do, where we meet them and what gets in the way.",
  "Этапов пока нет. Добавьте свои или начните с типовых — их можно переименовать и удалить.":
    "No stages yet. Add your own or start with typical ones — you can rename and delete them.",
  "Добавляю…":
    "Adding…",
  "Добавить 5 типовых этапов":
    "Add 5 typical stages",
  "+ Добавить этап":
    "+ Add stage",
  "Этап {n}":
    "Stage {n}",
  "Левее":
    "Move left",
  "Правее":
    "Move right",
  "Название этапа":
    "Stage name",
  "Что делает клиент":
    "What the customer does",
  "Гуглит, спрашивает коллег…":
    "Googles, asks colleagues…",
  "Где встречаемся":
    "Where we meet",
  "Сайт, реклама, звонок, письмо…":
    "Website, ads, call, email…",
  "Боль / барьер":
    "Pain / barrier",
  "Что мешает перейти на следующий этап":
    "What prevents moving to the next stage",
  "Метрика этапа":
    "Stage metric",
  "Сначала добавьте метрики":
    "Add metrics first",
  "Каналы привлечения":
    "Acquisition channels",
  "Где и как клиенты будут узнавать о продукте. Каждый канал — гипотеза, пока не доказано, что он приводит клиентов по нормальной цене.":
    "Where and how customers will learn about the product. Each channel is a hypothesis until it's proven to bring customers at a reasonable cost.",
  "Каналов пока нет. Например: холодные письма, партнёры-агентства, SEO, реклама в картах.":
    "No channels yet. For example: cold emails, agency partners, SEO, ads on maps.",
  "Название канала":
    "Channel name",
  "Для кого (ICP)":
    "For whom (ICP)",
  "оценка":
    "estimate",
  "Цена клиента (CAC)":
    "Customer cost (CAC)",
  "Как используем":
    "How we use it",
  "Что делаем, сколько тратим, какой бюджет на тест":
    "What we do, how much we spend, the test budget",
  "Проверяем гипотезой":
    "Tested by hypothesis",
  "Гипотез пока нет":
    "No hypotheses yet",
  "Результат":
    "Result",
  "Сколько лидов / клиентов и по какой цене":
    "How many leads / customers and at what cost",
  "+ Добавить канал":
    "+ Add channel",
  "Первые 100 клиентов и запуск":
    "First 100 customers and launch",
  "Откуда конкретно возьмутся первые клиенты и как мы выходим на рынок.":
    "Where exactly the first customers will come from and how we go to market.",
  "Клиентов сейчас":
    "Customers now",
  "из 100":
    "of 100",
  "На вкладке {tab}: {n} потенциальных клиентов, {pilots} на пилоте.":
    "On the {tab} tab: {n} potential customers, {pilots} in a pilot.",
  "«Рынок»":
    "“Market”",
  "Откуда возьмём первых 100":
    "Where the first 100 will come from",
  "Например: 10 — личные связи, 30 — холодные письма по списку из карт, 60 — через 3 агентства-партнёра":
    "For example: 10 from personal contacts, 30 from cold emails to a list from maps, 60 through 3 partner agencies",
  "Дата запуска":
    "Launch date",
  "Тип запуска":
    "Launch type",
  "План запуска":
    "Launch plan",
  "Что должно быть готово, кому и как сообщаем, какую цену ставим на старте, что считаем успешным запуском":
    "What must be ready, whom we tell and how, the launch price, what counts as a successful launch",
  "Все":
    "All",
  "Открытые":
    "Open",
  "Закрытые":
    "Closed",
  "Проблема без названия":
    "Untitled problem",
  "Гипотезы":
    "Hypotheses",
  "Что мы считаем правдой, но ещё не проверили. У каждой гипотезы — способ проверки, критерий успеха и срок.":
    "What we believe is true but haven't tested yet. Each hypothesis has a test method, a success criterion and a deadline.",
  "Гипотез пока нет. Начните с самой рискованной: «Если это окажется неправдой — продукт не взлетит».":
    "No hypotheses yet. Start with the riskiest one: “If this turns out to be false, the product won't take off.”",
  "В этом фильтре ничего нет.":
    "Nothing in this filter.",
  "+ Добавить гипотезу":
    "+ Add hypothesis",
  "Мы считаем, что [кто] [сделает что / испытывает что], потому что [почему]":
    "We believe that [who] [will do what / experiences what] because [why]",
  "Тип":
    "Type",
  "Приоритет":
    "Priority",
  "Проблема":
    "Problem",
  "просрочено":
    "overdue",
  "Как проверяем":
    "How we test",
  "10 интервью, лендинг с оплатой, ручной пилот…":
    "10 interviews, a landing page with payment, a manual pilot…",
  "Критерий успеха":
    "Success criterion",
  "Например: 6 из 10 назвали проблему сами, 3 готовы платить":
    "For example: 6 of 10 named the problem themselves, 3 are ready to pay",
  "заполните, когда закроете гипотезу":
    "fill in when you close the hypothesis",
  "Результат и вывод":
    "Result and conclusion",
  "Что узнали и что меняем в продукте":
    "What we learned and what we're changing in the product",
  "Задачи на доске для проверки":
    "Board tasks for testing",
  "+ Создать задачу":
    "+ Create task",
  "Сначала создайте хотя бы одну фазу на {board}.":
    "First create at least one phase on the {board}.",
  "доске":
    "board",
  "Задача появится в конце выбранной фазы, размер S, дедлайн — как у гипотезы.":
    "The task will appear at the end of the selected phase, size S, with the same deadline as the hypothesis.",
  "Задача появится в конце выбранной фазы, размер S.":
    "The task will appear at the end of the selected phase, size S.",
  "Вкладка «Рынок» заработает после запуска миграции 0004 (см. подсказку выше).":
    "The “Market” tab will work after running migration 0004 (see the hint above).",
  "Клиентов исследовано":
    "Customers researched",
  "Разговоров":
    "Conversations",
  "статус «Разговор» или «Пилот»":
    "status “Talked” or “Pilot”",
  "Пилоты":
    "Pilots",
  "готовы попробовать / платить":
    "ready to try / pay",
  "Конкуренты":
    "Competitors",
  "глубоко изучено: {n}":
    "studied in depth: {n}",
  "10 потенциальных клиентов":
    "10 potential customers",
  "Реальные компании, места и люди, а не абстрактный сегмент. Двигайте статус по мере работы.":
    "Real companies, places and people — not an abstract segment. Move the status forward as you go.",
  "Добавьте первого клиента, который, по-вашему, точно попадает в ICP.":
    "Add the first customer you think definitely fits the ICP.",
  "+ Добавить клиента":
    "+ Add customer",
  "Прямые, косвенные и альтернативы (Excel, агентство, «делаем руками»). Глубина — насколько хорошо мы их изучили.":
    "Direct, indirect and alternatives (Excel, an agency, “doing it by hand”). Depth is how well we've studied them.",
  "Конкурентов пока нет. Начните с того, чем клиент решает проблему сегодня.":
    "No competitors yet. Start with how the customer solves the problem today.",
  "+ Добавить конкурента":
    "+ Add competitor",
  "Что мы узнали из анализа рынка":
    "What we learned from market research",
  "Главные выводы: где пустая ниша, за что платят, чего не хватает у конкурентов.":
    "Key takeaways: where the empty niche is, what people pay for, what competitors lack.",
  "Например: у всех конкурентов долгий онбординг — никто не даёт результат в первый день.":
    "For example: all competitors have long onboarding — nobody delivers results on day one.",
  "Открыть ссылку":
    "Open link",
  "Компания или человек":
    "Company or person",
  "Сайт / карты / адрес":
    "Website / maps / address",
  "ссылка или адрес":
    "link or address",
  "Контакт":
    "Contact",
  "Имя, LinkedIn, email":
    "Name, LinkedIn, email",
  "Почему подходит":
    "Why it fits",
  "Видна проблема X, попадает в ICP #1":
    "Problem X is visible, fits ICP #1",
  "Доказательства / что узнали":
    "Evidence / what we learned",
  "Отзывы, сайт, итоги разговора":
    "Reviews, website, conversation notes",
  "Название конкурента":
    "Competitor name",
  "сайт":
    "website",
  "€199/мес":
    "€199/mo",
  "Обещание":
    "Promise",
  "«Сделаем X быстро»":
    "“We'll do X fast”",
  "Сильные стороны":
    "Strengths",
  "UX, бренд, кейсы":
    "UX, brand, case studies",
  "Слабые стороны":
    "Weaknesses",
  "Долго начать, дорого":
    "Slow to start, expensive",
  "Ключевые люди":
    "Key people",
  "Весь рынок":
    "Total market",
  "Сколько денег в год тратят все, у кого есть эта проблема":
    "How much money everyone with this problem spends per year",
  "Например: 250 000 салонов в РФ × 24 000 ₽ в год на продвижение":
    "For example: 250,000 salons × €300 per year on marketing",
  "Доступный нам":
    "Reachable for us",
  "Часть TAM, до которой мы можем дотянуться нашим продуктом и каналами":
    "The part of TAM we can reach with our product and channels",
  "Например: салоны 1–3 точки в городах-миллионниках, ~40%":
    "For example: salons with 1–3 locations in cities with 1M+ people, ~40%",
  "Реально занять":
    "Realistically obtainable",
  "Какую долю SAM реально получить за 2–3 года":
    "What share of SAM we can realistically capture in 2–3 years",
  "Например: 2% SAM — с учётом конкурентов и наших каналов":
    "For example: 2% of SAM — given competitors and our channels",
  "Размер рынка":
    "Market size",
  "TAM → SAM → SOM: от всего рынка к той части, которую реально занять. Главное — не цифра, а расчёт: откуда она взялась.":
    "TAM → SAM → SOM: from the total market to the part we can realistically capture. What matters is not the number but the calculation behind it.",
  "год":
    "year",
  "Больше, чем {x}":
    "Larger than {x}",
  "от {x}":
    "of {x}",
  "Прогноз выручки за первые 12 мес. из «Экономики» — {sum}, это":
    "The revenue forecast for the first 12 months from “Economics” is {sum}, which is",
  "Прогноз больше SOM — проверьте цифры.":
    "The forecast exceeds SOM — check the numbers.",
  "Двигает метрику":
    "Moves metric",
  "Метрик пока нет":
    "No metrics yet",
  "Метрики успеха":
    "Success metrics",
  "По ним видно, работает ли продукт. Одна главная метрика (North Star) — ценность, которую клиент получает, и 3–5 метрик под ней, которые на неё влияют. Гипотезы и решения ссылаются на метрику, которую должны сдвинуть.":
    "They show whether the product works. One main metric (North Star) — the value customers get — and 3–5 metrics below it that influence it. Hypotheses and decisions link to the metric they should move.",
  "★ Главная метрика":
    "★ Main metric",
  "Какое одно число лучше всего показывает, что клиенты получают ценность? Например: «салоны, ответившие на 80% отзывов за неделю».":
    "Which single number best shows that customers get value? For example: “salons that replied to 80% of reviews within a week”.",
  "+ Задать главную метрику":
    "+ Set main metric",
  "Метрики под главной":
    "Metrics below the main one",
  "Что влияет на главную метрику? Например: активация, удержание через 30 дней, конверсия из пробного периода.":
    "What influences the main metric? For example: activation, 30-day retention, trial conversion.",
  "+ Добавить метрику":
    "+ Add metric",
  "Главная метрика":
    "Main metric",
  "Название метрики":
    "Metric name",
  "Сделать главной (North Star)":
    "Make main (North Star)",
  "Единица":
    "Unit",
  "%, ₽, шт.":
    "%, €, pcs",
  "Старт":
    "Baseline",
  "Цель":
    "Target",
  "Цель к дате":
    "Target date",
  "Сейчас":
    "Now",
  "цель":
    "target",
  "замер":
    "measured",
  "давно":
    "a while ago",
  "замеров нет":
    "no measurements",
  "значение":
    "value",
  "Записать":
    "Record",
  "+ Записать замер":
    "+ Record measurement",
  "Как считаем":
    "How we calculate it",
  "Откуда берём данные и по какой формуле":
    "Where the data comes from and which formula we use",
  "Двигают метрику:":
    "Moving this metric:",
  "без названия":
    "untitled",
  "Цель и объём MVP":
    "MVP goal and scope",
  "Что должен доказать MVP и что в него входит. Критерии успеха — метрики с целями на вкладке «Метрики».":
    "What the MVP must prove and what it includes. Success criteria are metrics with targets on the “Metrics” tab.",
  "Цель MVP — что он должен доказать":
    "MVP goal — what it must prove",
  "Например: компании готовы платить за shortlist из 2–3 проверенных кандидатов за 72 часа":
    "For example: companies are willing to pay for a shortlist of 2–3 vetted candidates within 72 hours",
  "Критерии успеха → метрики с целями":
    "Success criteria → metrics with targets",
  "Входит в MVP":
    "In the MVP",
  "Минимум, без которого цель MVP не проверить":
    "The minimum needed to test the MVP goal",
  "Сознательно не входит":
    "Deliberately left out",
  "Что откладываем на потом — и почему":
    "What we postpone — and why",
  "Готовность Discovery":
    "Discovery readiness",
  "Насколько уменьшилась неопределённость":
    "How much uncertainty has been reduced",
  "ICP подтверждено":
    "ICPs validated",
  "целевых сегментов":
    "target segments",
  "проверено · {n} в работе":
    "tested · {n} in progress",
  "на вкладке «Рынок»":
    "on the “Market” tab",
  "Требуют внимания":
    "Need attention",
  "пустые или старше 14 дней":
    "empty or older than 14 days",
  "+ Сформулировать миссию":
    "+ Write the mission",
  "Что требует внимания":
    "What needs attention",
  "Пустые разделы и то, что давно не обновлялось.":
    "Empty sections and things that haven't been updated for a while.",
  "Все разделы заполнены и свежие 👌":
    "All sections are filled in and up to date 👌",
  "Проверили — актуально":
    "Checked — up to date",
  "Следующий review":
    "Next review",
  "Раз в 2 недели проходим по разделам: обновляем или отмечаем «актуально».":
    "Every 2 weeks we go through the sections: update them or mark them “up to date”.",
  "+14 дней от сегодня":
    "+14 days from today",
  "пора провести review":
    "time for a review",
  "Ближайшие дедлайны гипотез":
    "Upcoming hypothesis deadlines",
  "Нет открытых гипотез с дедлайном.":
    "No open hypotheses with a deadline.",
  "Без формулировки":
    "No wording",
  "+ Задать главную метрику (North Star)":
    "+ Set main metric (North Star)",
  "Позиционирование":
    "Positioning",
  "собирается само из ICP, проблем, тезиса и конкурентов · серое — нажмите, чтобы заполнить":
    "built automatically from ICPs, problems, thesis and competitors · grey — click to fill in",
  "для «{name}»":
    "for “{name}”",
  "Скопировано ✓":
    "Copied ✓",
  "Для {icp}, у которых {problem}, {product} — {category}: {value}. В отличие от {alternatives}, мы {difference}.":
    "For {icp} who {problem}, {product} is {category}: {value}. Unlike {alternatives}, we {difference}.",
  "Перейти и заполнить":
    "Go and fill in",
  "Обзор":
    "Overview",
  "Основа":
    "Foundation",
  "Рынок":
    "Market",
  "Риски":
    "Risks",
  "Экономика":
    "Economics",
  "Метрики":
    "Metrics",
  "Выход на рынок":
    "Go-to-market",
  "Решения":
    "Decisions",
  "Ошибка сохранения:":
    "Save error:",
  "Отмечено как актуальное":
    "Marked as up to date",
  "На пересмотре: {n}":
    "Being revisited: {n}",
  "Не удалось сохранить:":
    "Couldn't save:",
  "Сохранено ✓":
    "Saved ✓",
  "Задача добавлена на доску":
    "Task added to the board",
  "Вы можете смотреть профиль, но не менять его":
    "You can view the profile but not change it",
  "Сохранить изменения (Ctrl+S)":
    "Save changes (Ctrl+S)",
  "Сохраняю…":
    "Saving…",
  "Фаза:":
    "Phase:",
  "В базе ещё нет таблиц профиля. Запустите {file} в Supabase → SQL Editor, затем обновите страницу.":
    "The database has no profile tables yet. Run {file} in Supabase → SQL Editor, then reload the page.",
  "Для вкладки «Рынок» и связи гипотез с задачами запустите {file} в Supabase → SQL Editor, затем обновите страницу.":
    "For the “Market” tab and linking hypotheses to tasks, run {file} in Supabase → SQL Editor, then reload the page.",
  "Для метрик, выхода на рынок, видения и размера рынка запустите {file} в Supabase → SQL Editor, затем обновите страницу.":
    "For metrics, go-to-market, vision and market size, run {file} in Supabase → SQL Editor, then reload the page.",
  "Для вкладки «MVP» и пересмотра задач запустите {file} в Supabase → SQL Editor, затем обновите страницу.":
    "For the “MVP” tab and task revisits, run {file} in Supabase → SQL Editor, then reload the page.",
  "Удалить:":
    "Delete",
  "«{name}» будет удалено. В истории останется запись об удалении.":
    "“{name}” will be deleted. The history will keep a record of the deletion.",
  "Есть несохранённые изменения":
    "You have unsaved changes",
  "Сохранить их перед переходом?":
    "Save them before leaving?",
  "Не сохранять":
    "Don't save",
  "Сохранить и перейти":
    "Save and leave",
  "Риск":
    "Risk",
  "Вопрос":
    "Question",
  "Разворот обычно означает вернуться к проблемам, ICP, интервью и гипотезам.":
    "A pivot usually means going back to problems, ICPs, interviews and hypotheses.",
  "Корректировка обычно означает новые эксперименты, пересчёт экономики или объёма MVP.":
    "An adjustment usually means new experiments, recalculating the economics or the MVP scope.",
  "Риски и ключевые допущения":
    "Risks and key assumptions",
  "Что может помешать продукту и во что мы верим без доказательств. Самые опасные допущения — первые кандидаты на эксперименты.":
    "What could get in the product's way and what we believe without proof. The most dangerous assumptions are the first candidates for experiments.",
  "Пока пусто. Запишите, что может помешать: юридические ограничения, доступ к данным, конкуренты…":
    "Empty so far. Note what could get in the way: legal restrictions, data access, competitors…",
  "+ Добавить риск или вопрос":
    "+ Add risk or question",
  "Принятые решения":
    "Decisions made",
  "Журнал решений по циклу: итог (Proceed / Adjust / Pivot / Stop), почему и что заставит пересмотреть. Чтобы через месяц не спорить заново.":
    "A log of cycle decisions: the outcome (Proceed / Adjust / Pivot / Stop), why, and what would make us reconsider — so we don't argue about it again a month later.",
  "Решений пока нет. Например: «Начинаем с салонов красоты, а не с ресторанов».":
    "No decisions yet. For example: “We start with beauty salons, not restaurants.”",
  "+ Записать решение":
    "+ Record decision",
  "Какой вопрос пока без ответа?":
    "Which question is still unanswered?",
  "Что может пойти не так?":
    "What could go wrong?",
  "Влияние":
    "Impact",
  "Как проверить / снизить":
    "How to test / mitigate",
  "Что сделаем, чтобы получить ответ или уменьшить риск":
    "What we'll do to get an answer or reduce the risk",
  "Что решили":
    "What we decided",
  "Итог решения":
    "Decision outcome",
  "Закрытые задачи:":
    "Closed tasks:",
  "Отправить на пересмотр":
    "Send for revisit",
  "Почему":
    "Why",
  "Какие данные или аргументы":
    "What data or arguments",
  "Что заставит пересмотреть":
    "What would make us reconsider",
  "Например: меньше 3 оплат за месяц":
    "For example: fewer than 3 payments per month",
  "На основе гипотезы":
    "Based on hypothesis",
  "История":
    "History",
  "Что добавляли, какие статусы меняли, и заметки команды. Пишется автоматически.":
    "What was added, which statuses changed, and team notes. Recorded automatically.",
  "Заметка: что узнали на созвоне, почему поменяли приоритет…":
    "Note: what we learned on a call, why we changed a priority…",
  "Добавить в историю":
    "Add to history",
  "Событий пока нет.":
    "No events yet.",
  "Показать все":
    "Show all",
  "Добавлено:":
    "Added:",
  "Удалено:":
    "Deleted:",
  "Проверили — данные актуальны, изменений нет":
    "Checked — the data is up to date, no changes",
  "✓ Актуально":
    "✓ Up to date",
  "Удалить":
    "Delete",
  "Меньше":
    "Less",
  "Больше":
    "More",
  "€ евро":
    "€ euro",
  "₽ рубли":
    "₽ rubles",
  "$ доллары":
    "$ dollars",
  "Предположение":
    "Assumption",
  "Есть сигналы":
    "Some signals",
  "Подтверждена":
    "Validated",
  "Опровергнута":
    "Refuted",
  "Не проверен":
    "Not validated",
  "В проверке":
    "Testing",
  "Подтверждён":
    "Validated",
  "Не подходит":
    "Not a fit",
  "Нужно проверить":
    "To test",
  "Открыт":
    "Open",
  "Закрыт":
    "Closed",
  "Действует":
    "Active",
  "Пересмотреть":
    "Revisit",
  "Отменено":
    "Cancelled",
  "Поверхностно":
    "Shallow",
  "Средне":
    "Medium",
  "Глубоко":
    "Deep",
  "Исследован":
    "Researched",
  "Разговор":
    "Talked",
  "Пилот":
    "Pilot",
  "Идея":
    "Idea",
  "Тестируем":
    "Testing",
  "Продаём":
    "Selling",
  "Отказались":
    "Dropped",
  "Отслеживаем":
    "Tracking",
  "Цель достигнута":
    "Target reached",
  "На паузе":
    "Paused",
  "Работает":
    "Works",
  "Не работает":
    "Doesn't work",
  "Этап":
    "Stage",
  "Аудитория":
    "Audience",
  "Канал":
    "Channel",
  "Решение":
    "Solution",
  "Высокий":
    "High",
  "Средний":
    "Medium",
  "Низкий":
    "Low",
  "Высокое влияние":
    "High impact",
  "Среднее влияние":
    "Medium impact",
  "Низкое влияние":
    "Low impact",
  "Гипотеза":
    "Hypothesis",
  "Риск / вопрос":
    "Risk / question",
  "Конкурент":
    "Competitor",
  "Потенциальный клиент":
    "Potential customer",
  "Продукт":
    "Product",
  "Метрика":
    "Metric",
  "Этап пути клиента":
    "Customer journey stage",
  "Проблемы":
    "Problems",
  "Выводы из анализа рынка":
    "Market research takeaways",
  "Риски и открытые вопросы":
    "Risks and open questions",
  "не заполнено":
    "not filled in",
  "давно не обновлялось":
    "not updated for a long time",
  "обновлено сегодня":
    "updated today",
  "вчера":
    "yesterday",
  "{n} дн. назад":
    "{n} days ago",
  "и":
    "and",
  "проблема":
    "problem",
  "категория":
    "category",
  "ключевая ценность":
    "key value",
  "альтернативы":
    "alternatives",
  "главное отличие":
    "key difference",
  "Proceed — идём дальше":
    "Proceed — moving on",
  "Гипотезы подтвердились — переходим к следующей фазе.":
    "The hypotheses were validated — moving to the next phase.",
  "Adjust — корректируем":
    "Adjust — course-correcting",
  "Направление верное, но нужно поменять эксперименты, объём или экономику.":
    "The direction is right, but the experiments, scope or economics need to change.",
  "Pivot — разворот":
    "Pivot — changing direction",
  "Меняем проблему, аудиторию или решение — возвращаемся к основе и Discovery.":
    "We change the problem, audience or solution — back to the foundation and Discovery.",
  "Stop — останавливаем":
    "Stop — stopping",
  "Продолжать не имеет смысла — фиксируем выводы.":
    "There's no point in continuing — we record the conclusions.",
  "Прямой":
    "Direct",
  "Косвенный":
    "Indirect",
  "Альтернатива":
    "Alternative",
  "Сформулировать миссию и видение":
    "Define mission and vision",
  "Зачем существует продукт и каким мир станет, если у нас получится.":
    "Why the product exists and what the world will look like if we succeed.",
  "Сформулировать тезисы продукта":
    "Define the product thesis",
  "Главная ставка, почему сейчас, наше преимущество, «мы — это…» и главный результат для клиента.":
    "The main bet, why now, our advantage, “we are…” and the main outcome for the customer.",
  "Описать проблемы клиентов":
    "Describe customer problems",
  "Какие проблемы решаем, в формате «Когда… хочу… чтобы…». Прогресс пойдёт с первой проблемы, от трёх — 99%. Можно добавлять больше.":
    "Which problems we solve, in the format “When… I want… so that…”. Progress starts with the first problem and reaches 99% at three. You can add more.",
  "Описать ICP":
    "Describe the ICP",
  "Для кого делаем продукт: сегменты клиентов и их проблемы. У каждого ICP должна быть хотя бы одна своя проблема.":
    "Who we build the product for: customer segments and their problems. Each ICP should have at least one problem of its own.",
  "Изучить рынок и конкурентов":
    "Research the market and competitors",
  "Чем клиенты решают проблему сегодня и какого размера рынок: конкуренты и TAM / SAM / SOM.":
    "How customers solve the problem today and how big the market is: competitors and TAM / SAM / SOM.",
  "Найти 10 потенциальных клиентов":
    "Find 10 potential customers",
  "Конкретные компании или люди, которые могут стать первыми клиентами.":
    "Specific companies or people who could become the first customers.",
  "Провести интервью с клиентами":
    "Interview customers",
  "Синтезировать выводы Discovery":
    "Synthesize Discovery findings",
  "Что узнали из рынка и интервью: какие проблемы подтвердились, какие нет.":
    "What we learned from the market and interviews: which problems were confirmed and which weren't.",
  "Сформулировать и приоритизировать гипотезы":
    "Formulate and prioritize hypotheses",
  "Что мы считаем правдой, но ещё не проверили. У каждой гипотезы — приоритет, способ проверки, критерий успеха и метрика, которую она двигает.":
    "What we believe is true but haven't tested yet. Each hypothesis has a priority, a test method, a success criterion and the metric it moves.",
  "Сформулировать гипотезу решения":
    "Formulate the solution hypothesis",
  "Что именно предлагаем: «Для [ICP] с проблемой [X] мы делаем [решение]; поверим, что работает, если [сигнал]». Это гипотеза с типом «Решение».":
    "What exactly we offer: “For [ICP] with problem [X] we build [solution]; we'll believe it works if [signal]”. This is a hypothesis of type “Solution”.",
  "Определить риски и ключевые допущения":
    "Identify risks and key assumptions",
  "Что может помешать и во что мы верим без доказательств. Самые опасные допущения — первые кандидаты на эксперименты.":
    "What could get in the way and what we believe without proof. The most dangerous assumptions are the first candidates for experiments.",
  "Провести эксперименты":
    "Run experiments",
  "Проверить гипотезы: создайте задачи из гипотез в профиле, обновляйте их статус и записывайте результат.":
    "Test the hypotheses: create tasks from hypotheses in the profile, update their status and record the result.",
  "Посчитать юнит-экономику":
    "Calculate unit economics",
  "Сходится ли модель до того, как вкладываться в MVP: что продаём, по какой цене, продажи и расходы.":
    "Whether the model works before investing in the MVP: what we sell, at what price, sales and costs.",
  "Принять решение: Proceed / Adjust / Pivot / Stop":
    "Decide: Proceed / Adjust / Pivot / Stop",
  "По итогам проверки: идём в MVP, корректируем, разворачиваемся или останавливаемся. Запишите решение и почему.":
    "Based on the tests: go to MVP, adjust, pivot or stop. Record the decision and why.",
  "Определить цель MVP и критерии успеха":
    "Define the MVP goal and success criteria",
  "Что должен доказать MVP и по каким метрикам поймём, что получилось: North Star и метрики под ней с целями.":
    "What the MVP must prove and which metrics will tell us it worked: the North Star and the metrics below it, with targets.",
  "Определить объём MVP":
    "Define the MVP scope",
  "Что входит в MVP и — не менее важно — что сознательно не входит.":
    "What's in the MVP and — just as important — what's deliberately left out.",
  "Описать путь клиента":
    "Map the customer journey",
  "Этапы от «узнал о проблеме» до «остаётся и рекомендует»: действие, точка контакта, боль.":
    "Stages from “became aware of the problem” to “stays and recommends”: action, touchpoint, pain.",
  "Приоритизировать бэклог":
    "Prioritize the backlog",
  "Разбить объём MVP на задачи и расставить приоритеты.":
    "Break the MVP scope into tasks and set priorities.",
  "Составить план релизов":
    "Create a release plan",
  "Что и когда выпускаем, в каком порядке.":
    "What we release and when, in what order.",
  "Организовать разработку":
    "Organize development",
  "Команда, процесс, инструменты. Задачи разработки добавляйте в эту фазу по ходу работы.":
    "Team, process, tools. Add development tasks to this phase as you go.",
  "Настроить аналитику":
    "Set up analytics",
  "Чтобы после запуска было что сравнивать: у метрик описано, как считаем, и есть стартовое значение.":
    "So there's something to compare after launch: each metric describes how it's calculated and has a baseline.",
  "Провести QA и проверить готовность к запуску":
    "Run QA and check launch readiness",
  "Тестирование, исправление критичных ошибок, готовность поддержки.":
    "Testing, fixing critical bugs, support readiness.",
  "Подготовить каналы и первых 100 клиентов":
    "Prepare channels and the first 100 customers",
  "Как клиенты нас найдут: каналы привлечения, откуда возьмём первых 100 клиентов, план и дата запуска.":
    "How customers will find us: acquisition channels, where the first 100 customers will come from, launch plan and date.",
  "Запустить пилот / релиз":
    "Launch the pilot / release",
  "Запуск по плану из профиля.":
    "Launch according to the plan in the profile.",
  "Собрать данные и обратную связь":
    "Collect data and feedback",
  "Замеры метрик после запуска. Считаются только замеры, сделанные после того, как задача взята в работу.":
    "Metric measurements after launch. Only measurements made after the task was started count.",
  "Оценить результаты относительно критериев успеха":
    "Evaluate results against success criteria",
  "Сравнить факт с целями MVP: что сработало, что нет.":
    "Compare actuals with MVP targets: what worked and what didn't.",
  "Определить проблемы и возможности":
    "Identify problems and opportunities",
  "Что нового узнали: обновлённые проблемы клиентов и новые гипотезы.":
    "What's new: updated customer problems and new hypotheses.",
  "Принять решение по следующему циклу":
    "Decide on the next cycle",
  "Proceed — в рост, Adjust — новые эксперименты и доработки, Pivot — назад к основе и Discovery.":
    "Proceed — to growth, Adjust — new experiments and improvements, Pivot — back to the foundation and Discovery.",
  "Определить возможности роста":
    "Identify growth opportunities",
  "Новые гипотезы роста: аудитории, цена, каналы, продукт.":
    "New growth hypotheses: audiences, pricing, channels, product.",
  "Оптимизировать привлечение, активацию и удержание":
    "Optimize acquisition, activation and retention",
  "Работа с каналами: CAC, результаты, что масштабировать.":
    "Working with channels: CAC, results, what to scale.",
  "Оптимизировать бизнес-модель и юнит-экономику":
    "Optimize the business model and unit economics",
  "Пересчитать экономику с реальными данными.":
    "Recalculate the economics with real data.",
  "Масштабировать процессы и каналы":
    "Scale processes and channels",
  "Команда, процессы и каналы, которые выдержат рост.":
    "A team, processes and channels that can handle growth.",
  "Хотя бы один ICP":
    "At least one ICP",
  "У ICP есть своя проблема":
    "The ICP has its own problem",
  "Размер рынка: TAM, SAM и SOM":
    "Market size: TAM, SAM and SOM",
  "Потенциальные клиенты":
    "Potential customers",
  "Интервью (статус «Разговор» или «Пилот»)":
    "Interviews (status “Talked” or “Pilot”)",
  "Записано, что узнали":
    "Learnings recorded",
  "Статусы проблем обновлены по итогам интервью":
    "Problem statuses updated after interviews",
  "Со способом проверки":
    "With a test method",
  "С критерием успеха":
    "With a success criterion",
  "С метрикой, которую двигает":
    "With the metric it moves",
  "Гипотеза с типом «Решение»":
    "A hypothesis of type “Solution”",
  "Привязана к проблеме":
    "Linked to a problem",
  "Способ проверки и критерий успеха":
    "Test method and success criterion",
  "Хотя бы один риск или допущение":
    "At least one risk or assumption",
  "Указано влияние":
    "Impact specified",
  "Взяты в проверку":
    "Being tested",
  "Проверены":
    "Tested",
  "Записан результат":
    "Result recorded",
  "Решение с итогом Proceed / Adjust / Pivot / Stop":
    "A decision with a Proceed / Adjust / Pivot / Stop outcome",
  "Записано почему":
    "Reason recorded",
  "Цель MVP":
    "MVP goal",
  "Главная метрика (North Star)":
    "Main metric (North Star)",
  "Цель для главной метрики":
    "Target for the main metric",
  "Метрика под главной с целью":
    "A supporting metric with a target",
  "Что входит в MVP":
    "What's in the MVP",
  "Что не входит":
    "What's left out",
  "Этапы пути клиента":
    "Customer journey stages",
  "Описано действие клиента":
    "Customer action described",
  "Описана боль":
    "Pain described",
  "Описано, как считаем":
    "Calculation described",
  "Есть стартовое значение":
    "Has a baseline",
  "Хотя бы один канал привлечения":
    "At least one acquisition channel",
  "Откуда возьмём первых 100 клиентов":
    "Where the first 100 customers will come from",
  "Новый замер главной метрики":
    "New measurement of the main metric",
  "Новые замеры метрик":
    "New metric measurements",
  "Новые или обновлённые проблемы клиентов":
    "New or updated customer problems",
  "Новые гипотезы":
    "New hypotheses",
  "Новая гипотеза роста":
    "A new growth hypothesis",
  "С приоритетом":
    "With a priority",
  "Каналы обновлены":
    "Channels updated",
  "Указан CAC":
    "CAC specified",
  "Продукты и цены пересмотрены":
    "Products and prices reviewed",
  "Финансовый план пересчитан":
    "Financial plan recalculated",
  "Тезис: основной":
    "Thesis: core",
  "Тезис: почему сейчас":
    "Thesis: why now",
  "Тезис: уникальное преимущество":
    "Thesis: unique advantage",
  "Тезис: мы — это…":
    "Thesis: we are…",
  "Тезис: главный результат для клиента":
    "Thesis: main outcome for the customer",
  "Хотя бы одна проблема клиентов":
    "At least one customer problem",
  "Хотя бы одна ЦА (ICP)":
    "At least one target audience (ICP)",
  "Хотя бы одна гипотеза":
    "At least one hypothesis",
  "Способ проверки":
    "Test method",
  "Дедлайн проверки":
    "Test deadline",
  "Хотя бы один конкурент":
    "At least one competitor",
  "Хотя бы один потенциальный клиент":
    "At least one potential customer",
  "Хотя бы один этап пути клиента":
    "At least one customer journey stage",
  "Хотя бы одна метрика под главной":
    "At least one supporting metric",
  "Первый замер":
    "First measurement",
  "Хотя бы один риск или вопрос":
    "At least one risk or question",
  "Хотя бы одно решение":
    "At least one decision",
  "Продукт с ценой":
    "A product with a price",
  "Продажи в месяц":
    "Sales per month",
  "Постоянные расходы":
    "Fixed costs",
  "Прогресс считается сам — по изменениям в профиле после того, как задача взята в работу.":
    "Progress is calculated automatically from profile changes made after the task was started.",
  "Прогресс считается сам по заполненности профиля.":
    "Progress is calculated automatically from how complete the profile is.",
  "Не начато":
    "Not started",
  "В процессе":
    "In progress",
  "Нужно обсудить":
    "To discuss",
  "На пересмотре":
    "Revisiting",
  "владелец":
    "owner",
  "редактор":
    "editor",
  "клиент · просмотр":
    "client · view only",
  "раб. день":
    "workday",
  "раб. дня":
    "workdays",
  "раб. дней":
    "workdays",
  "Прогресс считается сам — по изменениям в профиле после того, как задача взята в работу. Когда решите, что достаточно, — закройте задачу статусом «Готово».":
    "Progress is calculated automatically from profile changes made after the task was started. When you decide it's enough, close the task with the “Done” status.",
  "Прогресс считается сам по заполненности профиля. Когда решите, что достаточно, — закройте задачу статусом «Готово».":
    "Progress is calculated automatically from how complete the profile is. When you decide it's enough, close the task with the “Done” status.",
  "Открыть профиль →":
    "Open profile →",
  "Поговорить минимум с 8 потенциальными клиентами. Ставьте клиенту статус «Разговор» или «Пилот» и записывайте, что узнали.":
    "Talk to at least 8 potential customers. Set the customer's status to “Talked” or “Pilot” and record what you learned.",
  "ещё не переводили":
    "not translated yet",
  "Не задан OPENAI_API_KEY в переменных окружения (Vercel → Settings → Environment Variables).":
    "OPENAI_API_KEY is not set in the environment variables (Vercel → Settings → Environment Variables).",
  "Перевожу {done} / {total}…":
    "Translating {done} / {total}…",
  "✓ Перевод актуален":
    "✓ Translation is up to date",
  "Обновить перевод":
    "Update translation",
  "Перевод для партнёров":
    "Translation for partners",
  "Задачи, профиль и названия переводятся на английский и немецкий по кнопке. Переводятся только новые и изменённые тексты.":
    "Tasks, the profile and names are translated into English and German with one click. Only new and changed texts are translated.",
  "обновлён":
    "updated",
  "ждут перевода: {n}":
    "waiting for translation: {n}",
  "Переводить комментарии":
    "Translate comments",
  "Вы смотрите перевод — здесь ничего не редактируется. Редактирование — в русской версии.":
    "You're viewing the translation — nothing can be edited here. Editing happens in the Russian version.",
  "Перевод обновлён":
    "Translation updated",
  "не переведено изменений: {n}":
    "untranslated changes: {n}",
  "Редактировать на русском":
    "Edit in Russian",
  "Настройки проекта":
    "Project settings",
  "Запустите supabase/migrations/0012_translations.sql в Supabase → SQL Editor.":
    "Run supabase/migrations/0012_translations.sql in Supabase → SQL Editor.",
  "Часть текстов не удалось перевести — попробуйте ещё раз.":
    "Some texts couldn't be translated — please try again.",
  "Сессия истекла — обновите страницу и войдите снова.":
    "Your session has expired — reload the page and sign in again.",
  "Есть изменения…":
    "Unsaved changes…",
  "Не удалось сохранить":
    "Couldn't save",
  "Вы можете смотреть заметки, но не менять их":
    "You can view the notes but not edit them",
  "Для материалов и заметок запустите {file} в Supabase → SQL Editor, затем обновите страницу.":
    "For materials and notes, run {file} in Supabase → SQL Editor, then reload the page.",
  "Заметок пока нет.":
    "No notes yet.",
  "Заметки по проекту: договорённости, идеи, контекст, протоколы встреч…":
    "Project notes: agreements, ideas, context, meeting minutes…",
  "Заметки":
    "Notes",
  "Заголовок":
    "Heading",
  "Подзаголовок":
    "Subheading",
  "Описание продукта":
    "Product description",
  "Что получает клиент, из чего состоит, как устроено":
    "What the client gets, what it includes, how it works",
  "Чем отличается от предложений на рынке":
    "How it differs from market offerings",
  "Почему выберут нас, а не конкурентов или «сделать самим»":
    "Why clients would choose us over competitors or doing it themselves",
  "Ссылки":
    "Links",
  "Figma, сайт, репозиторий, аналитика, таблицы — всё, что не хочется потерять.":
    "Figma, website, repository, analytics, spreadsheets — everything you don't want to lose.",
  "Ссылок пока нет.":
    "No links yet.",
  "Ссылка":
    "Link",
  "+ Добавить ссылку":
    "+ Add link",
  "Пароли здесь не храните: добавьте ссылку на запись в менеджере паролей (1Password, Bitwarden…).":
    "Don't store passwords here: add a link to the entry in your password manager (1Password, Bitwarden…).",
  "Документы":
    "Documents",
  "Документ":
    "Document",
  "Договоры, презентации, исследования, макеты. До {n} МБ на файл.":
    "Contracts, presentations, research, mockups. Up to {n} MB per file.",
  "Макеты в Figma":
    "Figma mockups",
  "«{name}» больше {n} МБ — не загружен.":
    "“{name}” is larger than {n} MB — not uploaded.",
  "Не удалось загрузить «{name}»: {msg}":
    "Couldn't upload “{name}”: {msg}",
  "Не удалось открыть файл:":
    "Couldn't open the file:",
  "Документов пока нет.":
    "No documents yet.",
  "Открыть":
    "Open",
  "Скачать":
    "Download",
  "Загружаю «{name}»…":
    "Uploading “{name}”…",
  "+ Загрузить документ (или перетащите файлы сюда)":
    "+ Upload document (or drag files here)",
  "Материалы":
    "Materials",
  "Сохранено":
    "Saved",
};
