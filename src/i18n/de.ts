// Немецкий словарь интерфейса. Ключ — русский текст из кода (см. core.ts).
// Новые строки: добавьте сюда и в en.ts. Проверка: node scripts/i18n-check.mjs
export const de: Record<string, string> = {
  "Планер проектов: фазы, задачи, сроки":
    "Projektplaner: Phasen, Aufgaben, Termine",
  "Не удалось войти. Попробуйте ещё раз.":
    "Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.",
  "Неверный email или пароль":
    "Falsche E-Mail oder falsches Passwort",
  "Мы отправили письмо для подтверждения. Перейдите по ссылке из письма, чтобы войти.":
    "Wir haben Ihnen eine Bestätigungs-E-Mail gesendet. Folgen Sie dem Link darin, um sich anzumelden.",
  "Вас пригласили в проект «{name}».":
    "Sie wurden in das Projekt „{name}“ eingeladen.",
  "Вас пригласили в проект.":
    "Sie wurden in ein Projekt eingeladen.",
  "Зарегистрируйтесь с этим email — проект откроется сразу после входа.":
    "Registrieren Sie sich mit dieser E-Mail – das Projekt öffnet sich direkt nach der Anmeldung.",
  "Войдите с этим email — проект появится в вашем списке.":
    "Melden Sie sich mit dieser E-Mail an – das Projekt erscheint in Ihrer Liste.",
  "Вход":
    "Anmelden",
  "Регистрация":
    "Registrieren",
  "Планирование проектов по фазам и задачам":
    "Projektplanung nach Phasen und Aufgaben",
  "Продолжить с Google":
    "Mit Google fortfahren",
  "или по email":
    "oder per E-Mail",
  "Имя":
    "Name",
  "Как вас называть":
    "Wie sollen wir Sie nennen",
  "Пароль":
    "Passwort",
  "Войти":
    "Anmelden",
  "Создать аккаунт":
    "Konto erstellen",
  "Нет аккаунта?":
    "Noch kein Konto?",
  "Уже есть аккаунт?":
    "Sie haben bereits ein Konto?",
  "Зарегистрироваться":
    "Registrieren",
  "Страница не найдена":
    "Seite nicht gefunden",
  "Все проекты":
    "Alle Projekte",
  "Такой страницы нет":
    "Diese Seite gibt es nicht",
  "Возможно, ссылка устарела, проект или задачу удалили, или у вас нет к ним доступа. Если вам прислали ссылку — попросите владельца проекта пригласить вас.":
    "Vielleicht ist der Link veraltet, das Projekt oder die Aufgabe wurde gelöscht oder Sie haben keinen Zugriff. Wenn Ihnen jemand den Link geschickt hat, bitten Sie den Projektinhaber, Sie einzuladen.",
  "К моим проектам":
    "Zu meinen Projekten",
  "Проекты":
    "Projekte",
  "Ваши проекты и проекты, куда вас пригласили":
    "Ihre Projekte und Projekte, zu denen Sie eingeladen wurden",
  "Пока нет проектов. Создайте первый — и добавьте в него фазы и задачи.":
    "Noch keine Projekte. Erstellen Sie das erste und fügen Sie Phasen und Aufgaben hinzu.",
  "Задача":
    "Aufgabe",
  "Ссылка недоступна":
    "Link nicht verfügbar",
  "Задача не найдена или доступ по ссылке был отключён.":
    "Die Aufgabe wurde nicht gefunden oder der Zugriff per Link wurde deaktiviert.",
  "Статус":
    "Status",
  "Прогресс":
    "Fortschritt",
  "Размер":
    "Größe",
  "раб. дн.":
    "Arbeitstage",
  "Дедлайн":
    "Deadline",
  "Описание":
    "Beschreibung",
  "Описание пока не добавлено.":
    "Noch keine Beschreibung.",
  "Обновлено":
    "Aktualisiert",
  "только просмотр":
    "nur Ansicht",
  "Ошибка":
    "Fehler",
  "Запустите supabase/migrations/0008_cycle_template.sql в Supabase → SQL Editor: без неё задачи не свяжутся с профилем. Проект создан без задач — удалите его и создайте заново.":
    "Führen Sie supabase/migrations/0008_cycle_template.sql in Supabase → SQL Editor aus: Ohne sie werden Aufgaben nicht mit dem Profil verknüpft. Das Projekt wurde ohne Aufgaben erstellt – löschen Sie es und erstellen Sie es neu.",
  "＋ Новый проект":
    "＋ Neues Projekt",
  "Новый проект":
    "Neues Projekt",
  "Название":
    "Name",
  "Например: Product Roadmap · 2026":
    "Zum Beispiel: Product Roadmap · 2026",
  "Дата старта (первый рабочий день)":
    "Startdatum (erster Arbeitstag)",
  "Проект начнётся с полного продуктового цикла: {phases}. Задачи, связанные с профилем продукта, заполняются сами по мере заполнения профиля. Лишнее можно удалить на доске.":
    "Das Projekt beginnt mit dem vollständigen Produktzyklus: {phases}. Aufgaben, die mit dem Produktprofil verknüpft sind, füllen sich automatisch, während das Profil ausgefüllt wird. Nicht Benötigtes können Sie auf dem Board löschen.",
  "Отмена":
    "Abbrechen",
  "Создаю…":
    "Wird erstellt…",
  "Создать":
    "Erstellen",
  "Язык интерфейса":
    "Sprache der Oberfläche",
  "Новых комментариев: {n}":
    "Neue Kommentare: {n}",
  "просмотр":
    "Ansicht",
  "гость":
    "Gast",
  "фаз":
    "Phasen",
  "задач":
    "Aufgaben",
  "участн.":
    "Mitgl.",
  "старт":
    "Start",
  "Не удалось удалить:":
    "Löschen fehlgeschlagen:",
  "Удалить проект":
    "Projekt löschen",
  "Удалить проект?":
    "Projekt löschen?",
  "Проект «{name}» будет удалён вместе со всеми фазами ({phases}), задачами ({tasks}) и комментариями. Участники потеряют к нему доступ. Это действие нельзя отменить.":
    "Das Projekt „{name}“ wird mit allen Phasen ({phases}), Aufgaben ({tasks}) und Kommentaren gelöscht. Die Mitglieder verlieren den Zugriff. Dies kann nicht rückgängig gemacht werden.",
  "Доска":
    "Board",
  "Профиль продукта":
    "Produktprofil",
  "Выйти":
    "Abmelden",
  "Ошибка:":
    "Fehler:",
  "Roadmap экспортирован":
    "Roadmap exportiert",
  "Вы можете смотреть проект, но не менять его":
    "Sie können das Projekt ansehen, aber nicht ändern",
  "👁 Только просмотр":
    "👁 Nur Ansicht",
  "Старт:":
    "Start:",
  "⚙ Настройки":
    "⚙ Einstellungen",
  "Экспорт JSON":
    "JSON exportieren",
  "＋ Фаза":
    "＋ Phase",
  "Открыть профиль продукта":
    "Produktprofil öffnen",
  "Миссия":
    "Mission",
  "Не заполнена — добавьте миссию и позиционирование, чтобы не терять фокус":
    "Nicht ausgefüllt – ergänzen Sie Mission und Positionierung, um den Fokus zu behalten",
  "Профиль →":
    "Profil →",
  "Размер задачи:":
    "Aufgabengröße:",
  "день":
    "Tag",
  "дн.":
    "Tage",
  "— приоритет. Клик по карточке открывает детали. Отменённые задачи не учитываются в сроках.":
    "– Priorität. Ein Klick auf die Karte öffnet die Details. Abgebrochene Aufgaben zählen nicht zu den Terminen.",
  "＋ Добавить фазу":
    "＋ Phase hinzufügen",
  "Новая фаза":
    "Neue Phase",
  "Например: Partnerships":
    "Zum Beispiel: Partnerships",
  "Добавить фазу":
    "Phase hinzufügen",
  "Настройки сохранены":
    "Einstellungen gespeichert",
  "Удалить задачу?":
    "Aufgabe löschen?",
  "Задача «{name}» будет удалена вместе с описанием и комментариями. Это действие нельзя отменить.":
    "Die Aufgabe „{name}“ wird mit Beschreibung und Kommentaren gelöscht. Dies kann nicht rückgängig gemacht werden.",
  "Дата старта":
    "Startdatum",
  "Первый рабочий день":
    "Erster Arbeitstag",
  "Пересчитать":
    "Neu berechnen",
  "Настройки планировщика":
    "Planer-Einstellungen",
  "Размер задачи → рабочих дней":
    "Aufgabengröße → Arbeitstage",
  "Изменение длительности сразу пересчитает оставшиеся дни, прогресс фаз и дату запуска.":
    "Eine Änderung der Dauer berechnet sofort die verbleibenden Tage, den Phasenfortschritt und das Startdatum neu.",
  "Сохранить":
    "Speichern",
  "Удалить фазу?":
    "Phase löschen?",
  "Фаза «{name}» пустая и будет удалена.":
    "Die Phase „{name}“ ist leer und wird gelöscht.",
  "В фазе «{name}» {count}. Что с ними сделать?":
    "Die Phase „{name}“ enthält {count}. Was soll damit passieren?",
  "{n} задача":
    "{n} Aufgabe",
  "{n} задачи":
    "{n} Aufgaben",
  "{n} задач":
    "{n} Aufgaben",
  "Перенести задачи в другую фазу":
    "Aufgaben in eine andere Phase verschieben",
  "Удалить вместе с задачами":
    "Zusammen mit den Aufgaben löschen",
  "Задачи и их комментарии удалятся безвозвратно":
    "Aufgaben und ihre Kommentare werden endgültig gelöscht",
  "Перенести и удалить фазу":
    "Verschieben und Phase löschen",
  "Удалить фазу":
    "Phase löschen",
  "Новых комментариев нет":
    "Keine neuen Kommentare",
  "Новые комментарии":
    "Neue Kommentare",
  "Отметить всё прочитанным":
    "Alle als gelesen markieren",
  "Всё прочитано.":
    "Alles gelesen.",
  "Без названия":
    "Ohne Titel",
  "Участник":
    "Mitglied",
  "Ссылка скопирована":
    "Link kopiert",
  "Теперь только просмотр":
    "Jetzt nur Ansicht",
  "Теперь редактор":
    "Jetzt Bearbeiter",
  "Участники проекта":
    "Projektmitglieder",
  "(вы)":
    "(Sie)",
  "Роль в проекте":
    "Rolle im Projekt",
  "Убрать из проекта":
    "Aus dem Projekt entfernen",
  "ждёт регистрации":
    "wartet auf Registrierung",
  "Скопировать ссылку-приглашение":
    "Einladungslink kopieren",
  "Отменить приглашение":
    "Einladung zurückziehen",
  "Редактор":
    "Bearbeiter",
  "может всё менять":
    "kann alles ändern",
  "Клиент / партнёр":
    "Kunde / Partner",
  "email клиента или партнёра":
    "E-Mail des Kunden oder Partners",
  "email коллеги":
    "E-Mail des Kollegen",
  "Пригласить":
    "Einladen",
  "{email} уже есть в системе и добавлен в проект. Отправьте ссылку, чтобы открыть проект:":
    "{email} ist bereits registriert und wurde zum Projekt hinzugefügt. Senden Sie den Link zum Öffnen des Projekts:",
  "Отправьте {email} эту ссылку (в Telegram, WhatsApp, почтой). По ней откроется регистрация с уже заполненным email, а после входа — этот проект.":
    "Senden Sie {email} diesen Link (per Telegram, WhatsApp oder E-Mail). Er öffnet die Registrierung mit bereits ausgefüllter E-Mail und nach der Anmeldung dieses Projekt.",
  "✓ Скопировано":
    "✓ Kopiert",
  "Скопировать":
    "Kopieren",
  "После приглашения появится ссылка — отправьте её человеку. Скопировать её снова можно иконкой рядом с приглашением.":
    "Nach der Einladung erscheint ein Link – senden Sie ihn an die Person. Über das Symbol neben der Einladung können Sie ihn erneut kopieren.",
  "Приглашать участников может только владелец проекта.":
    "Nur der Projektinhaber kann Mitglieder einladen.",
  "Готово":
    "Fertig",
  "Убрать участника?":
    "Mitglied entfernen?",
  "Убрать":
    "Entfernen",
  "{name} потеряет доступ к проекту «{project}». Задачи и комментарии останутся.":
    "{name} verliert den Zugriff auf das Projekt „{project}“. Aufgaben und Kommentare bleiben erhalten.",
  "Перетащить фазу":
    "Phase ziehen",
  "Влево":
    "Nach links",
  "Вправо":
    "Nach rechts",
  "готово":
    "erledigt",
  "осталось":
    "übrig",
  "нужно обсудить":
    "zu besprechen",
  "Задачи уже были сделаны и снова пересматриваются — на % фазы и сроки не влияют":
    "Diese Aufgaben waren bereits erledigt und werden erneut überprüft – sie beeinflussen weder den Phasen-% noch die Termine",
  "на пересмотре":
    "in Überprüfung",
  "Перетащите задачу сюда":
    "Aufgabe hierher ziehen",
  "＋ Добавить задачу":
    "＋ Aufgabe hinzufügen",
  "Переименовать проект":
    "Projekt umbenennen",
  "Другие проекты":
    "Andere Projekte",
  "Загрузка…":
    "Wird geladen…",
  "Все проекты →":
    "Alle Projekte →",
  "Добавьте описание, заметки, чек-листы, ссылки…":
    "Beschreibung, Notizen, Checklisten, Links hinzufügen…",
  "Вставьте ссылку (https://…)":
    "Link einfügen (https://…)",
  "Жирный":
    "Fett",
  "Курсив":
    "Kursiv",
  "• Список":
    "• Liste",
  "1. Список":
    "1. Liste",
  "☑ Чек-лист":
    "☑ Checkliste",
  "🔗 Ссылка":
    "🔗 Link",
  "Ссылка на задачу":
    "Link zur Aufgabe",
  "Любой, у кого есть ссылка, может посмотреть задачу «{name}» без входа: название, статус, сроки и описание. Комментарии и остальной проект не видны. Редактировать по ссылке нельзя.":
    "Jeder mit dem Link kann die Aufgabe „{name}“ ohne Anmeldung ansehen: Titel, Status, Termine und Beschreibung. Kommentare und der Rest des Projekts sind nicht sichtbar. Bearbeiten ist über den Link nicht möglich.",
  "Старая ссылка перестанет открываться":
    "Der alte Link funktioniert dann nicht mehr",
  "Отключить ссылку":
    "Link deaktivieren",
  "Открыть ↗":
    "Öffnen ↗",
  "Создайте ссылку, чтобы отправить задачу «{name}» исполнителю, у которого нет доступа к проекту. По ссылке откроется отдельная страница только с этой задачей — без входа и без возможности редактировать.":
    "Erstellen Sie einen Link, um die Aufgabe „{name}“ an jemanden ohne Projektzugriff zu senden. Der Link öffnet eine eigene Seite nur mit dieser Aufgabe – ohne Anmeldung und ohne Bearbeitung.",
  "Создать ссылку":
    "Link erstellen",
  "Удалить задачу":
    "Aufgabe löschen",
  "новый":
    "neu",
  "новых":
    "neu",
  "комм.":
    "Komm.",
  "🧪 гипотеза":
    "🧪 Hypothese",
  "⚠ впритык":
    "⚠ knapp",
  "⚠ не успеваем":
    "⚠ nicht zu schaffen",
  "осталось {left} из {total} дн.":
    "{left} von {total} Tagen übrig",
  "Размер задачи":
    "Aufgabengröße",
  "Просрочено":
    "Überfällig",
  "Дедлайн задачи — не влияет на планирование":
    "Deadline der Aufgabe – beeinflusst die Planung nicht",
  "Удалить комментарий?":
    "Kommentar löschen?",
  "Название задачи":
    "Aufgabentitel",
  "Поделиться ссылкой на задачу":
    "Link zur Aufgabe teilen",
  "Поделиться ссылкой":
    "Link teilen",
  "👁 Только просмотр — изменять задачу и писать комментарии может команда проекта.":
    "👁 Nur Ansicht – Aufgabe bearbeiten und kommentieren kann das Projektteam.",
  "Прогресс · из профиля":
    "Fortschritt · aus dem Profil",
  "Задача закрыта вручную":
    "Aufgabe manuell abgeschlossen",
  "Начнёт считать, когда задача будет взята в работу":
    "Beginnt zu zählen, sobald die Aufgabe in Arbeit ist",
  "Считает изменения с {date}":
    "Zählt Änderungen seit {date}",
  "До 99% — закройте статусом «Готово», когда решите":
    "Bis 99 % – schließen Sie sie mit dem Status „Fertig“, wenn Sie so weit sind",
  "Осталось работы":
    "Verbleibende Arbeit",
  "Успеваем к дедлайну?":
    "Schaffen wir die Deadline?",
  "Что заполнено в профиле":
    "Was im Profil ausgefüllt ist",
  "{k} из {of}":
    "{k} von {of}",
  "Не удалось загрузить профиль.":
    "Profil konnte nicht geladen werden.",
  "заполнить →":
    "ausfüllen →",
  "Задача закрыта, но в профиле есть пустые пункты.":
    "Die Aufgabe ist abgeschlossen, aber im Profil gibt es noch leere Punkte.",
  "Проверяет гипотезу":
    "Prüft Hypothese",
  "Открыть в профиле →":
    "Im Profil öffnen →",
  "— не связана":
    "– nicht verknüpft",
  "— гипотез пока нет в профиле":
    "– noch keine Hypothesen im Profil",
  "Гипотеза без формулировки":
    "Hypothese ohne Formulierung",
  "Обсуждение":
    "Diskussion",
  "Пока нет комментариев.":
    "Noch keine Kommentare.",
  "Пользователь":
    "Benutzer",
  "новое":
    "neu",
  "удалить":
    "löschen",
  "Напишите комментарий или вставьте ссылку… (Ctrl+Enter — отправить)":
    "Kommentar schreiben oder Link einfügen… (Strg+Enter zum Senden)",
  "Отправить":
    "Senden",
  "Комментарии появятся после создания задачи":
    "Kommentare sind nach dem Erstellen der Aufgabe verfügbar",
  "Создать задачу":
    "Aufgabe erstellen",
  "Поставьте дедлайн, чтобы проверить сроки":
    "Legen Sie eine Deadline fest, um den Zeitplan zu prüfen",
  "✓ Готово":
    "✓ Fertig",
  "Задача выполнена":
    "Aufgabe erledigt",
  "Дедлайн прошёл, осталось {n} работы":
    "Deadline verstrichen, noch {n} Arbeit",
  "Не успеваем":
    "Nicht zu schaffen",
  "Нужно {need}, до дедлайна {avail}":
    "Benötigt {need}, bis zur Deadline {avail}",
  "Впритык":
    "Knapp",
  "Нужно {need}, до дедлайна {avail} — без запаса":
    "Benötigt {need}, bis zur Deadline {avail} – ohne Puffer",
  "Успеваем":
    "Im Plan",
  "Запас {n}":
    "Puffer: {n}",
  "Вкладка «Экономика» заработает после запуска {file} в Supabase → SQL Editor.":
    "Der Tab „Ökonomie“ funktioniert, nachdem {file} in Supabase → SQL Editor ausgeführt wurde.",
  "Грубая модель, чтобы понять: сходится ли экономика и сколько денег нужно до выхода в плюс. Все цифры — до налогов.":
    "Ein grobes Modell, um zu sehen, ob die Wirtschaftlichkeit aufgeht und wie viel Geld bis zur Gewinnschwelle nötig ist. Alle Zahlen vor Steuern.",
  "Валюта":
    "Währung",
  "Продукты и юнит-экономика":
    "Produkte und Unit Economics",
  "Что продаём, сколько стоит одна продажа и сколько на ней зарабатываем.":
    "Was wir verkaufen, was ein Verkauf kostet und wie viel wir daran verdienen.",
  "Добавьте продукт или тариф: подписку или разовую продажу.":
    "Fügen Sie ein Produkt oder einen Tarif hinzu: Abo oder Einmalverkauf.",
  "Сумма долей продаж — {n}%. В расчёте доли автоматически приводятся к 100%.":
    "Die Verkaufsanteile ergeben {n} %. In der Berechnung werden sie automatisch auf 100 % normiert.",
  "+ Добавить продукт":
    "+ Produkt hinzufügen",
  "Финансовый план":
    "Finanzplan",
  "Сколько новых продаж в месяц и постоянных расходов на старте, и как они растут от квартала к кварталу.":
    "Wie viele Neuverkäufe pro Monat und Fixkosten zum Start, und wie sie von Quartal zu Quartal wachsen.",
  "Горизонт":
    "Horizont",
  "мес.":
    "Mon.",
  "Новых продаж в месяц":
    "Neuverkäufe pro Monat",
  "шт.":
    "Stk.",
  "Постоянные расходы в месяц":
    "Fixkosten pro Monat",
  "Рост к предыдущему кварталу":
    "Wachstum ggü. Vorquartal",
  "Q1 — база из полей выше":
    "Q1 – Basis aus den Feldern oben",
  "Как в Q2 для всех":
    "Wie Q2 für alle",
  "продажи":
    "Verkäufe",
  "расходы":
    "Kosten",
  "Прогноз на {n} мес.":
    "Prognose für {n} Monate",
  "Добавьте продукт с ценой и укажите продажи в месяц — здесь появится расчёт.":
    "Fügen Sie ein Produkt mit Preis hinzu und geben Sie die Verkäufe pro Monat an – hier erscheint dann die Berechnung.",
  "Операционная модель: подписки учитывают отток, CAC начисляется только на новых клиентов.":
    "Betriebsmodell: Abos berücksichtigen Churn, CAC fällt nur für Neukunden an.",
  "Выручка":
    "Umsatz",
  "за весь период":
    "im gesamten Zeitraum",
  "Привлечение":
    "Akquise",
  "CAC × новые продажи":
    "CAC × Neuverkäufe",
  "Себестоимость":
    "Herstellungskosten",
  "часы + переменные":
    "Stunden + variabel",
  "Постоянные":
    "Fixkosten",
  "с учётом роста":
    "inkl. Wachstum",
  "Операционная прибыль":
    "Betriebsergebnis",
  "маржа {n}%":
    "Marge {n} %",
  "Выход в плюс":
    "Gewinnschwelle",
  "месяц {n}":
    "Monat {n}",
  "не в этом горизонте":
    "nicht in diesem Horizont",
  "первый месяц без убытка":
    "erster Monat ohne Verlust",
  "Нужно денег до окупаемости":
    "Kapitalbedarf bis zur Amortisation",
  "самая глубокая точка накопленного минуса":
    "tiefster Punkt des kumulierten Minus",
  "Вложения окупаются":
    "Investition amortisiert sich",
  "сразу":
    "sofort",
  "накопленный результат снова ≥ 0":
    "kumuliertes Ergebnis wieder ≥ 0",
  "Скрыть таблицу по месяцам ↑":
    "Monatstabelle ausblenden ↑",
  "Показать таблицу по месяцам ↓":
    "Monatstabelle anzeigen ↓",
  "Месяц":
    "Monat",
  "Новые продажи":
    "Neuverkäufe",
  "Расходы всего":
    "Kosten gesamt",
  "Прибыль":
    "Gewinn",
  "Маржа":
    "Marge",
  "Накоплено":
    "Kumuliert",
  "Название продукта или тарифа":
    "Name des Produkts oder Tarifs",
  "Подписка / мес.":
    "Abo / Mon.",
  "Разовая продажа":
    "Einmalverkauf",
  "Цена в месяц":
    "Preis pro Monat",
  "Цена":
    "Preis",
  "Часов на клиента / мес.":
    "Stunden pro Kunde / Mon.",
  "Часов на клиента":
    "Stunden pro Kunde",
  "ч":
    "Std.",
  "Стоимость часа команды":
    "Stundensatz des Teams",
  "Прочие затраты на продажу":
    "Sonstige Kosten pro Verkauf",
  "CAC (привлечение)":
    "CAC (Akquise)",
  "Отток в месяц":
    "Churn pro Monat",
  "Активных клиентов на старте":
    "Aktive Kunden zum Start",
  "Доля продаж":
    "Verkaufsanteil",
  "Себестоимость продажи":
    "Kosten pro Verkauf",
  "Вклад до CAC":
    "Deckungsbeitrag vor CAC",
  "Маржа до CAC":
    "Marge vor CAC",
  "CAC окупается за":
    "CAC-Amortisation in",
  "LTV (вклад за жизнь)":
    "LTV (Beitrag über Lebensdauer)",
  "Прибыль с продажи после CAC":
    "Gewinn pro Verkauf nach CAC",
  "Статус «Отказались» — продукт не учитывается в прогнозе.":
    "Status „Verworfen“ – das Produkt wird in der Prognose nicht berücksichtigt.",
  "Прогноз: выручка, расходы и прибыль по месяцам":
    "Prognose: Umsatz, Kosten und Gewinn pro Monat",
  "Нет данных для графика":
    "Keine Daten für das Diagramm",
  "Месяц {m}":
    "Monat {m}",
  "млн":
    "Mio.",
  "тыс":
    "Tsd.",
  "Основной тезис":
    "Kernthese",
  "Мы помогаем [кому] решить [какую проблему] через [какой механизм], чтобы получить [измеримый результат].":
    "Wir helfen [wem], [welches Problem] durch [welchen Mechanismus] zu lösen, um [ein messbares Ergebnis] zu erreichen.",
  "Почему сейчас":
    "Warum jetzt",
  "Что изменилось в рынке, технологиях, регулировании или поведении людей, из-за чего именно сейчас хорошее окно для продукта?":
    "Was hat sich an Markt, Technologie, Regulierung oder Verhalten der Menschen geändert, sodass gerade jetzt ein gutes Zeitfenster für das Produkt ist?",
  "Уникальное преимущество":
    "Einzigartiger Vorteil",
  "Почему клиент выберет нас, а не прямого конкурента, косвенную альтернативу или ручное решение?":
    "Warum wählt der Kunde uns statt eines direkten Wettbewerbers, einer indirekten Alternative oder einer manuellen Lösung?",
  "ICP без названия":
    "ICP ohne Titel",
  "Миссия и видение":
    "Mission und Vision",
  "Миссия — зачем существует продукт. Видение — каким станет мир (или рынок), когда у нас получится. Меняются редко.":
    "Mission – warum es das Produkt gibt. Vision – wie die Welt (oder der Markt) aussieht, wenn wir Erfolg haben. Ändern sich selten.",
  "Например: помогаем локальному бизнесу видеть и управлять тем, как их находят и оценивают в интернете.":
    "Zum Beispiel: Wir helfen lokalen Unternehmen zu sehen und zu steuern, wie sie online gefunden und bewertet werden.",
  "через 3–5 лет":
    "in 3–5 Jahren",
  "Видение":
    "Vision",
  "Например: любой локальный бизнес знает, почему клиенты выбирают или не выбирают его, и может это исправить за день.":
    "Zum Beispiel: Jedes lokale Unternehmen weiß, warum Kunden es wählen oder nicht, und kann das an einem Tag beheben.",
  "Тезис продукта":
    "Produktthese",
  "Текущая версия продуктовой идеи. Главные неизвестные ведём в «Гипотезах» и «Рисках».":
    "Die aktuelle Version der Produktidee. Die wichtigsten Unbekannten führen wir unter „Hypothesen“ und „Risiken“.",
  "для позиционирования":
    "für die Positionierung",
  "Мы — это…":
    "Wir sind…",
  "сервис проверки репутации компании":
    "ein Service zur Prüfung der Unternehmensreputation",
  "Главный результат для клиента":
    "Wichtigstes Ergebnis für den Kunden",
  "за 1 день показывает, что мешает клиентам выбрать вас":
    "zeigt innerhalb eines Tages, was Kunden davon abhält, Sie zu wählen",
  "Первое предложение попадает в позиционирование как «главное отличие» — начните с самого важного.":
    "Der erste Satz fließt als „wichtigster Unterschied“ in die Positionierung ein – beginnen Sie mit dem Wichtigsten.",
  "Проблемы клиентов":
    "Kundenprobleme",
  "Боли, которые мы решаем, и насколько мы в них уверены.":
    "Die Schmerzpunkte, die wir lösen, und wie sicher wir uns dabei sind.",
  "Пока нет проблем. Добавьте первую — с неё начинается позиционирование и гипотезы.":
    "Noch keine Probleme. Fügen Sie das erste hinzu – damit beginnen Positionierung und Hypothesen.",
  "＋ Добавить проблему":
    "＋ Problem hinzufügen",
  "ICP / целевые аудитории":
    "ICP / Zielgruppen",
  "Сегменты клиентов, почему мы в них верим и по каким критериям считаем сегмент подтверждённым.":
    "Kundensegmente, warum wir an sie glauben und nach welchen Kriterien ein Segment als bestätigt gilt.",
  "Пока нет ICP. Опишите, кому продукт нужен больше всего.":
    "Noch kein ICP. Beschreiben Sie, wer das Produkt am dringendsten braucht.",
  "5+ интервью с этим сегментом":
    "5+ Interviews mit diesem Segment",
  "3+ подтверждения боли":
    "3+ Bestätigungen des Problems",
  "1+ готовность платить / пилот":
    "1+ Zahlungsbereitschaft / Pilot",
  "＋ Добавить ICP":
    "＋ ICP hinzufügen",
  "Сформулируйте проблему клиента":
    "Formulieren Sie das Problem des Kunden",
  "Работа клиента":
    "Job des Kunden",
  "Когда…":
    "Wenn…",
  "открываю карты и вижу 3 новых отзыва":
    "ich die Karten öffne und 3 neue Bewertungen sehe",
  "я хочу…":
    "möchte ich…",
  "быстро ответить каждому":
    "jede schnell beantworten",
  "чтобы…":
    "damit…",
  "новые клиенты видели, что нам не всё равно":
    "neue Kunden sehen, dass es uns nicht egal ist",
  "У кого (ICP)":
    "Bei wem (ICP)",
  "Все ICP":
    "Alle ICPs",
  "Почему это важно":
    "Warum es wichtig ist",
  "Как часто, сколько стоит денег или времени":
    "Wie oft, wie viel Geld oder Zeit es kostet",
  "Доказательства":
    "Belege",
  "Интервью, отзывы, цифры, примеры":
    "Interviews, Bewertungen, Zahlen, Beispiele",
  "Название сегмента, например «Салоны красоты 1–3 точки»":
    "Name des Segments, z. B. „Kosmetiksalons mit 1–3 Standorten“",
  "Размер, география, кто принимает решение":
    "Größe, Region, wer entscheidet",
  "конкретный человек и его сценарий":
    "eine konkrete Person und ihr Szenario",
  "Персона":
    "Persona",
  "Например: Анна, 34, владелица салона на 2 точки. Утром смотрит отзывы в Google Maps, вечером сама отвечает клиентам в Instagram. Хочет…, мешает…, решает сейчас так…":
    "Zum Beispiel: Anna, 34, Inhaberin eines Salons mit 2 Standorten. Morgens liest sie Bewertungen in Google Maps, abends beantwortet sie selbst Kundennachrichten auf Instagram. Sie möchte…, ihr fehlt…, aktuell löst sie es so…",
  "Почему думаем, что подходит":
    "Warum wir denken, dass es passt",
  "Видимый спрос, бюджет, частота проблемы":
    "Sichtbare Nachfrage, Budget, Häufigkeit des Problems",
  "Критерии подтверждения":
    "Bestätigungskriterien",
  "Убрать критерий":
    "Kriterium entfernen",
  "Новый критерий":
    "Neues Kriterium",
  "+ критерий":
    "+ Kriterium",
  "Все критерии выполнены — отметить «Подтверждён»":
    "Alle Kriterien erfüllt – als „Bestätigt“ markieren",
  "включая общие для всех ICP":
    "inklusive der für alle ICPs gemeinsamen",
  "Проблемы этого ICP":
    "Probleme dieses ICP",
  "Нет проблем — привяжите их в разделе «Проблемы»":
    "Keine Probleme – verknüpfen Sie sie im Abschnitt „Probleme“",
  "общая":
    "gemeinsam",
  "Узнаёт о проблеме":
    "Erkennt das Problem",
  "Ищет решение":
    "Sucht eine Lösung",
  "Выбирает и покупает":
    "Wählt aus und kauft",
  "Начинает пользоваться":
    "Beginnt mit der Nutzung",
  "Остаётся и рекомендует":
    "Bleibt und empfiehlt weiter",
  "Закрытая бета":
    "Geschlossene Beta",
  "Мягкий запуск":
    "Soft Launch",
  "Публичный запуск":
    "Öffentlicher Launch",
  "Вкладка заработает после запуска {file} в Supabase → SQL Editor.":
    "Dieser Tab funktioniert, nachdem {file} in Supabase → SQL Editor ausgeführt wurde.",
  "Метрика без названия":
    "Metrik ohne Titel",
  "Путь клиента":
    "Customer Journey",
  "Этапы, которые проходит клиент: от первого касания до повторной покупки. На каждом — что он делает, где мы с ним встречаемся и что мешает.":
    "Die Phasen, die ein Kunde durchläuft – vom ersten Kontakt bis zum Wiederkauf. Für jede: was er tut, wo wir ihn treffen und was ihn bremst.",
  "Этапов пока нет. Добавьте свои или начните с типовых — их можно переименовать и удалить.":
    "Noch keine Phasen. Fügen Sie eigene hinzu oder beginnen Sie mit typischen – diese lassen sich umbenennen und löschen.",
  "Добавляю…":
    "Wird hinzugefügt…",
  "Добавить 5 типовых этапов":
    "5 typische Phasen hinzufügen",
  "+ Добавить этап":
    "+ Phase hinzufügen",
  "Этап {n}":
    "Phase {n}",
  "Левее":
    "Nach links",
  "Правее":
    "Nach rechts",
  "Название этапа":
    "Name der Phase",
  "Что делает клиент":
    "Was der Kunde tut",
  "Гуглит, спрашивает коллег…":
    "Googelt, fragt Kollegen…",
  "Где встречаемся":
    "Wo wir uns begegnen",
  "Сайт, реклама, звонок, письмо…":
    "Website, Werbung, Anruf, E-Mail…",
  "Боль / барьер":
    "Schmerzpunkt / Hürde",
  "Что мешает перейти на следующий этап":
    "Was den Übergang zur nächsten Phase verhindert",
  "Метрика этапа":
    "Metrik der Phase",
  "Сначала добавьте метрики":
    "Fügen Sie zuerst Metriken hinzu",
  "Каналы привлечения":
    "Akquisekanäle",
  "Где и как клиенты будут узнавать о продукте. Каждый канал — гипотеза, пока не доказано, что он приводит клиентов по нормальной цене.":
    "Wo und wie Kunden vom Produkt erfahren. Jeder Kanal ist eine Hypothese, bis bewiesen ist, dass er Kunden zu vernünftigen Kosten bringt.",
  "Каналов пока нет. Например: холодные письма, партнёры-агентства, SEO, реклама в картах.":
    "Noch keine Kanäle. Zum Beispiel: Kaltakquise per E-Mail, Partneragenturen, SEO, Werbung in Karten.",
  "Название канала":
    "Name des Kanals",
  "Для кого (ICP)":
    "Für wen (ICP)",
  "оценка":
    "Schätzung",
  "Цена клиента (CAC)":
    "Kundenkosten (CAC)",
  "Как используем":
    "Wie wir ihn nutzen",
  "Что делаем, сколько тратим, какой бюджет на тест":
    "Was wir tun, wie viel wir ausgeben, welches Testbudget",
  "Проверяем гипотезой":
    "Geprüft durch Hypothese",
  "Гипотез пока нет":
    "Noch keine Hypothesen",
  "Результат":
    "Ergebnis",
  "Сколько лидов / клиентов и по какой цене":
    "Wie viele Leads / Kunden und zu welchen Kosten",
  "+ Добавить канал":
    "+ Kanal hinzufügen",
  "Первые 100 клиентов и запуск":
    "Die ersten 100 Kunden und Launch",
  "Откуда конкретно возьмутся первые клиенты и как мы выходим на рынок.":
    "Woher genau die ersten Kunden kommen und wie wir in den Markt gehen.",
  "Клиентов сейчас":
    "Kunden aktuell",
  "из 100":
    "von 100",
  "На вкладке {tab}: {n} потенциальных клиентов, {pilots} на пилоте.":
    "Im Tab {tab}: {n} potenzielle Kunden, {pilots} im Pilot.",
  "«Рынок»":
    "„Markt“",
  "Откуда возьмём первых 100":
    "Woher die ersten 100 kommen",
  "Например: 10 — личные связи, 30 — холодные письма по списку из карт, 60 — через 3 агентства-партнёра":
    "Zum Beispiel: 10 über persönliche Kontakte, 30 per Kaltakquise an eine Liste aus Karten, 60 über 3 Partneragenturen",
  "Дата запуска":
    "Launch-Datum",
  "Тип запуска":
    "Art des Launches",
  "План запуска":
    "Launch-Plan",
  "Что должно быть готово, кому и как сообщаем, какую цену ставим на старте, что считаем успешным запуском":
    "Was fertig sein muss, wen wir wie informieren, welcher Startpreis gilt, was als erfolgreicher Launch zählt",
  "Все":
    "Alle",
  "Открытые":
    "Offen",
  "Закрытые":
    "Abgeschlossen",
  "Проблема без названия":
    "Problem ohne Titel",
  "Гипотезы":
    "Hypothesen",
  "Что мы считаем правдой, но ещё не проверили. У каждой гипотезы — способ проверки, критерий успеха и срок.":
    "Was wir für wahr halten, aber noch nicht geprüft haben. Jede Hypothese hat eine Prüfmethode, ein Erfolgskriterium und eine Frist.",
  "Гипотез пока нет. Начните с самой рискованной: «Если это окажется неправдой — продукт не взлетит».":
    "Noch keine Hypothesen. Beginnen Sie mit der riskantesten: „Wenn das nicht stimmt, hebt das Produkt nicht ab.“",
  "В этом фильтре ничего нет.":
    "In diesem Filter gibt es nichts.",
  "+ Добавить гипотезу":
    "+ Hypothese hinzufügen",
  "Мы считаем, что [кто] [сделает что / испытывает что], потому что [почему]":
    "Wir glauben, dass [wer] [was tun wird / was erlebt], weil [warum]",
  "Тип":
    "Typ",
  "Приоритет":
    "Priorität",
  "Проблема":
    "Problem",
  "просрочено":
    "überfällig",
  "Как проверяем":
    "Wie wir prüfen",
  "10 интервью, лендинг с оплатой, ручной пилот…":
    "10 Interviews, Landingpage mit Bezahlung, manueller Pilot…",
  "Критерий успеха":
    "Erfolgskriterium",
  "Например: 6 из 10 назвали проблему сами, 3 готовы платить":
    "Zum Beispiel: 6 von 10 nannten das Problem selbst, 3 sind zahlungsbereit",
  "заполните, когда закроете гипотезу":
    "ausfüllen, wenn Sie die Hypothese abschließen",
  "Результат и вывод":
    "Ergebnis und Schlussfolgerung",
  "Что узнали и что меняем в продукте":
    "Was wir gelernt haben und was wir am Produkt ändern",
  "Задачи на доске для проверки":
    "Aufgaben auf dem Board zur Prüfung",
  "+ Создать задачу":
    "+ Aufgabe erstellen",
  "Сначала создайте хотя бы одну фазу на {board}.":
    "Erstellen Sie zuerst mindestens eine Phase auf dem {board}.",
  "доске":
    "Board",
  "Задача появится в конце выбранной фазы, размер S, дедлайн — как у гипотезы.":
    "Die Aufgabe erscheint am Ende der gewählten Phase, Größe S, mit derselben Deadline wie die Hypothese.",
  "Задача появится в конце выбранной фазы, размер S.":
    "Die Aufgabe erscheint am Ende der gewählten Phase, Größe S.",
  "Вкладка «Рынок» заработает после запуска миграции 0004 (см. подсказку выше).":
    "Der Tab „Markt“ funktioniert nach Ausführen der Migration 0004 (siehe Hinweis oben).",
  "Клиентов исследовано":
    "Kunden recherchiert",
  "Разговоров":
    "Gespräche",
  "статус «Разговор» или «Пилот»":
    "Status „Gespräch“ oder „Pilot“",
  "Пилоты":
    "Piloten",
  "готовы попробовать / платить":
    "bereit zu testen / zu zahlen",
  "Конкуренты":
    "Wettbewerber",
  "глубоко изучено: {n}":
    "gründlich analysiert: {n}",
  "10 потенциальных клиентов":
    "10 potenzielle Kunden",
  "Реальные компании, места и люди, а не абстрактный сегмент. Двигайте статус по мере работы.":
    "Echte Unternehmen, Orte und Menschen statt eines abstrakten Segments. Aktualisieren Sie den Status im Laufe der Arbeit.",
  "Добавьте первого клиента, который, по-вашему, точно попадает в ICP.":
    "Fügen Sie den ersten Kunden hinzu, der Ihrer Meinung nach sicher zum ICP passt.",
  "+ Добавить клиента":
    "+ Kunde hinzufügen",
  "Прямые, косвенные и альтернативы (Excel, агентство, «делаем руками»). Глубина — насколько хорошо мы их изучили.":
    "Direkte, indirekte und Alternativen (Excel, Agentur, „manuell erledigen“). Tiefe – wie gut wir sie analysiert haben.",
  "Конкурентов пока нет. Начните с того, чем клиент решает проблему сегодня.":
    "Noch keine Wettbewerber. Beginnen Sie damit, wie der Kunde das Problem heute löst.",
  "+ Добавить конкурента":
    "+ Wettbewerber hinzufügen",
  "Что мы узнали из анализа рынка":
    "Was wir aus der Marktanalyse gelernt haben",
  "Главные выводы: где пустая ниша, за что платят, чего не хватает у конкурентов.":
    "Wichtigste Erkenntnisse: wo die freie Nische ist, wofür bezahlt wird, was Wettbewerbern fehlt.",
  "Например: у всех конкурентов долгий онбординг — никто не даёт результат в первый день.":
    "Zum Beispiel: Alle Wettbewerber haben ein langes Onboarding – niemand liefert am ersten Tag ein Ergebnis.",
  "Открыть ссылку":
    "Link öffnen",
  "Компания или человек":
    "Unternehmen oder Person",
  "Сайт / карты / адрес":
    "Website / Karten / Adresse",
  "ссылка или адрес":
    "Link oder Adresse",
  "Контакт":
    "Kontakt",
  "Имя, LinkedIn, email":
    "Name, LinkedIn, E-Mail",
  "Почему подходит":
    "Warum es passt",
  "Видна проблема X, попадает в ICP #1":
    "Problem X ist sichtbar, passt zu ICP #1",
  "Доказательства / что узнали":
    "Belege / was wir erfahren haben",
  "Отзывы, сайт, итоги разговора":
    "Bewertungen, Website, Gesprächsergebnisse",
  "Название конкурента":
    "Name des Wettbewerbers",
  "сайт":
    "Website",
  "€199/мес":
    "199 €/Mon.",
  "Обещание":
    "Versprechen",
  "«Сделаем X быстро»":
    "„Wir erledigen X schnell“",
  "Сильные стороны":
    "Stärken",
  "UX, бренд, кейсы":
    "UX, Marke, Referenzen",
  "Слабые стороны":
    "Schwächen",
  "Долго начать, дорого":
    "Langer Einstieg, teuer",
  "Ключевые люди":
    "Schlüsselpersonen",
  "Весь рынок":
    "Gesamtmarkt",
  "Сколько денег в год тратят все, у кого есть эта проблема":
    "Wie viel Geld alle mit diesem Problem pro Jahr ausgeben",
  "Например: 250 000 салонов в РФ × 24 000 ₽ в год на продвижение":
    "Zum Beispiel: 250.000 Salons × 300 € pro Jahr für Werbung",
  "Доступный нам":
    "Für uns erreichbar",
  "Часть TAM, до которой мы можем дотянуться нашим продуктом и каналами":
    "Der Teil des TAM, den wir mit unserem Produkt und unseren Kanälen erreichen können",
  "Например: салоны 1–3 точки в городах-миллионниках, ~40%":
    "Zum Beispiel: Salons mit 1–3 Standorten in Millionenstädten, ~40 %",
  "Реально занять":
    "Realistisch erreichbar",
  "Какую долю SAM реально получить за 2–3 года":
    "Welchen Anteil am SAM wir in 2–3 Jahren realistisch gewinnen",
  "Например: 2% SAM — с учётом конкурентов и наших каналов":
    "Zum Beispiel: 2 % des SAM – unter Berücksichtigung der Wettbewerber und unserer Kanäle",
  "Размер рынка":
    "Marktgröße",
  "TAM → SAM → SOM: от всего рынка к той части, которую реально занять. Главное — не цифра, а расчёт: откуда она взялась.":
    "TAM → SAM → SOM: vom Gesamtmarkt zu dem Teil, den wir realistisch gewinnen können. Entscheidend ist nicht die Zahl, sondern die Berechnung dahinter.",
  "год":
    "Jahr",
  "Больше, чем {x}":
    "Größer als {x}",
  "от {x}":
    "von {x}",
  "Прогноз выручки за первые 12 мес. из «Экономики» — {sum}, это":
    "Die Umsatzprognose für die ersten 12 Monate aus „Ökonomie“ beträgt {sum}, das sind",
  "Прогноз больше SOM — проверьте цифры.":
    "Die Prognose übersteigt den SOM – prüfen Sie die Zahlen.",
  "Двигает метрику":
    "Beeinflusst Metrik",
  "Метрик пока нет":
    "Noch keine Metriken",
  "Метрики успеха":
    "Erfolgsmetriken",
  "По ним видно, работает ли продукт. Одна главная метрика (North Star) — ценность, которую клиент получает, и 3–5 метрик под ней, которые на неё влияют. Гипотезы и решения ссылаются на метрику, которую должны сдвинуть.":
    "Sie zeigen, ob das Produkt funktioniert. Eine Hauptmetrik (North Star) – der Wert, den Kunden erhalten – und 3–5 Metriken darunter, die sie beeinflussen. Hypothesen und Entscheidungen verweisen auf die Metrik, die sie bewegen sollen.",
  "★ Главная метрика":
    "★ Hauptmetrik",
  "Какое одно число лучше всего показывает, что клиенты получают ценность? Например: «салоны, ответившие на 80% отзывов за неделю».":
    "Welche eine Zahl zeigt am besten, dass Kunden einen Nutzen haben? Zum Beispiel: „Salons, die innerhalb einer Woche auf 80 % der Bewertungen geantwortet haben“.",
  "+ Задать главную метрику":
    "+ Hauptmetrik festlegen",
  "Метрики под главной":
    "Metriken unter der Hauptmetrik",
  "Что влияет на главную метрику? Например: активация, удержание через 30 дней, конверсия из пробного периода.":
    "Was beeinflusst die Hauptmetrik? Zum Beispiel: Aktivierung, Retention nach 30 Tagen, Conversion aus der Testphase.",
  "+ Добавить метрику":
    "+ Metrik hinzufügen",
  "Главная метрика":
    "Hauptmetrik",
  "Название метрики":
    "Name der Metrik",
  "Сделать главной (North Star)":
    "Zur Hauptmetrik machen (North Star)",
  "Единица":
    "Einheit",
  "%, ₽, шт.":
    "%, €, Stk.",
  "Старт":
    "Ausgangswert",
  "Цель":
    "Ziel",
  "Цель к дате":
    "Zieldatum",
  "Сейчас":
    "Aktuell",
  "цель":
    "Ziel",
  "замер":
    "gemessen",
  "давно":
    "vor langer Zeit",
  "замеров нет":
    "keine Messungen",
  "значение":
    "Wert",
  "Записать":
    "Erfassen",
  "+ Записать замер":
    "+ Messung erfassen",
  "Как считаем":
    "Wie wir sie berechnen",
  "Откуда берём данные и по какой формуле":
    "Woher die Daten stammen und mit welcher Formel",
  "Двигают метрику:":
    "Beeinflussen die Metrik:",
  "без названия":
    "ohne Titel",
  "Цель и объём MVP":
    "Ziel und Umfang des MVP",
  "Что должен доказать MVP и что в него входит. Критерии успеха — метрики с целями на вкладке «Метрики».":
    "Was das MVP beweisen soll und was dazugehört. Erfolgskriterien sind Metriken mit Zielen im Tab „Metriken“.",
  "Цель MVP — что он должен доказать":
    "Ziel des MVP – was es beweisen soll",
  "Например: компании готовы платить за shortlist из 2–3 проверенных кандидатов за 72 часа":
    "Zum Beispiel: Unternehmen zahlen für eine Shortlist von 2–3 geprüften Kandidaten innerhalb von 72 Stunden",
  "Критерии успеха → метрики с целями":
    "Erfolgskriterien → Metriken mit Zielen",
  "Входит в MVP":
    "Im MVP enthalten",
  "Минимум, без которого цель MVP не проверить":
    "Das Minimum, ohne das sich das MVP-Ziel nicht prüfen lässt",
  "Сознательно не входит":
    "Bewusst nicht enthalten",
  "Что откладываем на потом — и почему":
    "Was wir verschieben – und warum",
  "Готовность Discovery":
    "Discovery-Reife",
  "Насколько уменьшилась неопределённость":
    "Wie stark die Unsicherheit gesunken ist",
  "ICP подтверждено":
    "ICPs bestätigt",
  "целевых сегментов":
    "Zielsegmente",
  "проверено · {n} в работе":
    "geprüft · {n} in Arbeit",
  "на вкладке «Рынок»":
    "im Tab „Markt“",
  "Требуют внимания":
    "Brauchen Aufmerksamkeit",
  "пустые или старше 14 дней":
    "leer oder älter als 14 Tage",
  "+ Сформулировать миссию":
    "+ Mission formulieren",
  "Что требует внимания":
    "Was Aufmerksamkeit braucht",
  "Пустые разделы и то, что давно не обновлялось.":
    "Leere Abschnitte und was lange nicht aktualisiert wurde.",
  "Все разделы заполнены и свежие 👌":
    "Alle Abschnitte sind ausgefüllt und aktuell 👌",
  "Проверили — актуально":
    "Geprüft – aktuell",
  "Следующий review":
    "Nächstes Review",
  "Раз в 2 недели проходим по разделам: обновляем или отмечаем «актуально».":
    "Alle 2 Wochen gehen wir die Abschnitte durch: aktualisieren oder als „aktuell“ markieren.",
  "+14 дней от сегодня":
    "+14 Tage ab heute",
  "пора провести review":
    "Zeit für ein Review",
  "Ближайшие дедлайны гипотез":
    "Nächste Hypothesen-Deadlines",
  "Нет открытых гипотез с дедлайном.":
    "Keine offenen Hypothesen mit Deadline.",
  "Без формулировки":
    "Ohne Formulierung",
  "+ Задать главную метрику (North Star)":
    "+ Hauptmetrik festlegen (North Star)",
  "Позиционирование":
    "Positionierung",
  "собирается само из ICP, проблем, тезиса и конкурентов · серое — нажмите, чтобы заполнить":
    "wird automatisch aus ICPs, Problemen, These und Wettbewerbern erstellt · grau – zum Ausfüllen klicken",
  "для «{name}»":
    "für „{name}“",
  "Скопировано ✓":
    "Kopiert ✓",
  "Для {icp}, у которых {problem}, {product} — {category}: {value}. В отличие от {alternatives}, мы {difference}.":
    "Für {icp}, die {problem}, ist {product} {category}: {value}. Anders als {alternatives} – wir {difference}.",
  "Перейти и заполнить":
    "Öffnen und ausfüllen",
  "Обзор":
    "Übersicht",
  "Основа":
    "Grundlagen",
  "Рынок":
    "Markt",
  "Риски":
    "Risiken",
  "Экономика":
    "Ökonomie",
  "Метрики":
    "Metriken",
  "Выход на рынок":
    "Markteinführung",
  "Решения":
    "Entscheidungen",
  "Ошибка сохранения:":
    "Fehler beim Speichern:",
  "Отмечено как актуальное":
    "Als aktuell markiert",
  "На пересмотре: {n}":
    "In Überprüfung: {n}",
  "Не удалось сохранить:":
    "Speichern fehlgeschlagen:",
  "Сохранено ✓":
    "Gespeichert ✓",
  "Задача добавлена на доску":
    "Aufgabe zum Board hinzugefügt",
  "Вы можете смотреть профиль, но не менять его":
    "Sie können das Profil ansehen, aber nicht ändern",
  "Сохранить изменения (Ctrl+S)":
    "Änderungen speichern (Strg+S)",
  "Сохраняю…":
    "Wird gespeichert…",
  "Фаза:":
    "Phase:",
  "В базе ещё нет таблиц профиля. Запустите {file} в Supabase → SQL Editor, затем обновите страницу.":
    "In der Datenbank gibt es noch keine Profiltabellen. Führen Sie {file} in Supabase → SQL Editor aus und laden Sie dann die Seite neu.",
  "Для вкладки «Рынок» и связи гипотез с задачами запустите {file} в Supabase → SQL Editor, затем обновите страницу.":
    "Für den Tab „Markt“ und die Verknüpfung von Hypothesen mit Aufgaben führen Sie {file} in Supabase → SQL Editor aus und laden Sie dann die Seite neu.",
  "Для метрик, выхода на рынок, видения и размера рынка запустите {file} в Supabase → SQL Editor, затем обновите страницу.":
    "Für Metriken, Markteinführung, Vision und Marktgröße führen Sie {file} in Supabase → SQL Editor aus und laden Sie dann die Seite neu.",
  "Для вкладки «MVP» и пересмотра задач запустите {file} в Supabase → SQL Editor, затем обновите страницу.":
    "Für den Tab „MVP“ und die Überprüfung von Aufgaben führen Sie {file} in Supabase → SQL Editor aus und laden Sie dann die Seite neu.",
  "Удалить:":
    "Löschen:",
  "«{name}» будет удалено. В истории останется запись об удалении.":
    "„{name}“ wird gelöscht. Im Verlauf bleibt ein Eintrag über das Löschen erhalten.",
  "Есть несохранённые изменения":
    "Es gibt ungespeicherte Änderungen",
  "Сохранить их перед переходом?":
    "Vor dem Verlassen speichern?",
  "Не сохранять":
    "Nicht speichern",
  "Сохранить и перейти":
    "Speichern und wechseln",
  "Риск":
    "Risiko",
  "Вопрос":
    "Frage",
  "Разворот обычно означает вернуться к проблемам, ICP, интервью и гипотезам.":
    "Ein Pivot bedeutet meist, zu Problemen, ICPs, Interviews und Hypothesen zurückzukehren.",
  "Корректировка обычно означает новые эксперименты, пересчёт экономики или объёма MVP.":
    "Eine Anpassung bedeutet meist neue Experimente, eine Neuberechnung der Ökonomie oder des MVP-Umfangs.",
  "Риски и ключевые допущения":
    "Risiken und zentrale Annahmen",
  "Что может помешать продукту и во что мы верим без доказательств. Самые опасные допущения — первые кандидаты на эксперименты.":
    "Was dem Produkt im Weg stehen könnte und woran wir ohne Beweise glauben. Die gefährlichsten Annahmen sind die ersten Kandidaten für Experimente.",
  "Пока пусто. Запишите, что может помешать: юридические ограничения, доступ к данным, конкуренты…":
    "Noch leer. Notieren Sie, was hinderlich sein könnte: rechtliche Einschränkungen, Datenzugang, Wettbewerber…",
  "+ Добавить риск или вопрос":
    "+ Risiko oder Frage hinzufügen",
  "Принятые решения":
    "Getroffene Entscheidungen",
  "Журнал решений по циклу: итог (Proceed / Adjust / Pivot / Stop), почему и что заставит пересмотреть. Чтобы через месяц не спорить заново.":
    "Ein Protokoll der Zyklusentscheidungen: Ergebnis (Proceed / Adjust / Pivot / Stop), Begründung und was eine Überprüfung auslösen würde – damit wir in einem Monat nicht erneut diskutieren.",
  "Решений пока нет. Например: «Начинаем с салонов красоты, а не с ресторанов».":
    "Noch keine Entscheidungen. Zum Beispiel: „Wir beginnen mit Kosmetiksalons, nicht mit Restaurants.“",
  "+ Записать решение":
    "+ Entscheidung festhalten",
  "Какой вопрос пока без ответа?":
    "Welche Frage ist noch offen?",
  "Что может пойти не так?":
    "Was könnte schiefgehen?",
  "Влияние":
    "Auswirkung",
  "Как проверить / снизить":
    "Wie prüfen / reduzieren",
  "Что сделаем, чтобы получить ответ или уменьшить риск":
    "Was wir tun, um eine Antwort zu bekommen oder das Risiko zu senken",
  "Что решили":
    "Was wir entschieden haben",
  "Итог решения":
    "Ergebnis der Entscheidung",
  "Закрытые задачи:":
    "Abgeschlossene Aufgaben:",
  "Отправить на пересмотр":
    "Zur Überprüfung senden",
  "Почему":
    "Warum",
  "Какие данные или аргументы":
    "Welche Daten oder Argumente",
  "Что заставит пересмотреть":
    "Was eine Überprüfung auslösen würde",
  "Например: меньше 3 оплат за месяц":
    "Zum Beispiel: weniger als 3 Zahlungen pro Monat",
  "На основе гипотезы":
    "Basierend auf Hypothese",
  "История":
    "Verlauf",
  "Что добавляли, какие статусы меняли, и заметки команды. Пишется автоматически.":
    "Was hinzugefügt wurde, welche Status sich geändert haben, und Notizen des Teams. Wird automatisch erfasst.",
  "Заметка: что узнали на созвоне, почему поменяли приоритет…":
    "Notiz: was wir im Call erfahren haben, warum wir die Priorität geändert haben…",
  "Добавить в историю":
    "Zum Verlauf hinzufügen",
  "Событий пока нет.":
    "Noch keine Ereignisse.",
  "Показать все":
    "Alle anzeigen",
  "Добавлено:":
    "Hinzugefügt:",
  "Удалено:":
    "Gelöscht:",
  "Проверили — данные актуальны, изменений нет":
    "Geprüft – die Daten sind aktuell, keine Änderungen",
  "✓ Актуально":
    "✓ Aktuell",
  "Удалить":
    "Löschen",
  "Меньше":
    "Weniger",
  "Больше":
    "Mehr",
  "€ евро":
    "€ Euro",
  "₽ рубли":
    "₽ Rubel",
  "$ доллары":
    "$ Dollar",
  "Предположение":
    "Annahme",
  "Есть сигналы":
    "Erste Signale",
  "Подтверждена":
    "Bestätigt",
  "Опровергнута":
    "Widerlegt",
  "Не проверен":
    "Nicht geprüft",
  "В проверке":
    "In Prüfung",
  "Подтверждён":
    "Bestätigt",
  "Не подходит":
    "Passt nicht",
  "Нужно проверить":
    "Zu prüfen",
  "Открыт":
    "Offen",
  "Закрыт":
    "Geschlossen",
  "Действует":
    "Gültig",
  "Пересмотреть":
    "Überprüfen",
  "Отменено":
    "Abgebrochen",
  "Поверхностно":
    "Oberflächlich",
  "Средне":
    "Mittel",
  "Глубоко":
    "Gründlich",
  "Исследован":
    "Recherchiert",
  "Разговор":
    "Gespräch",
  "Пилот":
    "Pilot",
  "Идея":
    "Idee",
  "Тестируем":
    "Im Test",
  "Продаём":
    "Im Verkauf",
  "Отказались":
    "Verworfen",
  "Отслеживаем":
    "Wird verfolgt",
  "Цель достигнута":
    "Ziel erreicht",
  "На паузе":
    "Pausiert",
  "Работает":
    "Funktioniert",
  "Не работает":
    "Funktioniert nicht",
  "Этап":
    "Phase",
  "Аудитория":
    "Zielgruppe",
  "Канал":
    "Kanal",
  "Решение":
    "Lösung",
  "Высокий":
    "Hoch",
  "Средний":
    "Mittel",
  "Низкий":
    "Niedrig",
  "Высокое влияние":
    "Hohe Auswirkung",
  "Среднее влияние":
    "Mittlere Auswirkung",
  "Низкое влияние":
    "Geringe Auswirkung",
  "Гипотеза":
    "Hypothese",
  "Риск / вопрос":
    "Risiko / Frage",
  "Конкурент":
    "Wettbewerber",
  "Потенциальный клиент":
    "Potenzieller Kunde",
  "Продукт":
    "Produkt",
  "Метрика":
    "Metrik",
  "Этап пути клиента":
    "Phase der Customer Journey",
  "Проблемы":
    "Probleme",
  "Выводы из анализа рынка":
    "Erkenntnisse aus der Marktanalyse",
  "Риски и открытые вопросы":
    "Risiken und offene Fragen",
  "не заполнено":
    "nicht ausgefüllt",
  "давно не обновлялось":
    "lange nicht aktualisiert",
  "обновлено сегодня":
    "heute aktualisiert",
  "вчера":
    "gestern",
  "{n} дн. назад":
    "vor {n} Tagen",
  "и":
    "und",
  "проблема":
    "Problem",
  "категория":
    "Kategorie",
  "ключевая ценность":
    "zentraler Nutzen",
  "альтернативы":
    "Alternativen",
  "главное отличие":
    "wichtigster Unterschied",
  "Proceed — идём дальше":
    "Proceed – weiter geht's",
  "Гипотезы подтвердились — переходим к следующей фазе.":
    "Die Hypothesen wurden bestätigt – weiter zur nächsten Phase.",
  "Adjust — корректируем":
    "Adjust – wir korrigieren",
  "Направление верное, но нужно поменять эксперименты, объём или экономику.":
    "Die Richtung stimmt, aber Experimente, Umfang oder Ökonomie müssen angepasst werden.",
  "Pivot — разворот":
    "Pivot – Richtungswechsel",
  "Меняем проблему, аудиторию или решение — возвращаемся к основе и Discovery.":
    "Wir ändern Problem, Zielgruppe oder Lösung – zurück zu den Grundlagen und zur Discovery.",
  "Stop — останавливаем":
    "Stop – wir hören auf",
  "Продолжать не имеет смысла — фиксируем выводы.":
    "Weitermachen ergibt keinen Sinn – wir halten die Erkenntnisse fest.",
  "Прямой":
    "Direkt",
  "Косвенный":
    "Indirekt",
  "Альтернатива":
    "Alternative",
  "Сформулировать миссию и видение":
    "Mission und Vision formulieren",
  "Зачем существует продукт и каким мир станет, если у нас получится.":
    "Warum es das Produkt gibt und wie die Welt aussieht, wenn wir Erfolg haben.",
  "Сформулировать тезисы продукта":
    "Produktthesen formulieren",
  "Главная ставка, почему сейчас, наше преимущество, «мы — это…» и главный результат для клиента.":
    "Die Hauptwette, warum jetzt, unser Vorteil, „wir sind…“ und das wichtigste Ergebnis für den Kunden.",
  "Описать проблемы клиентов":
    "Kundenprobleme beschreiben",
  "Какие проблемы решаем, в формате «Когда… хочу… чтобы…». Прогресс пойдёт с первой проблемы, от трёх — 99%. Можно добавлять больше.":
    "Welche Probleme wir lösen, im Format „Wenn… möchte ich… damit…“. Der Fortschritt beginnt mit dem ersten Problem, ab drei sind es 99 %. Sie können mehr hinzufügen.",
  "Описать ICP":
    "ICP beschreiben",
  "Для кого делаем продукт: сегменты клиентов и их проблемы. У каждого ICP должна быть хотя бы одна своя проблема.":
    "Für wen wir das Produkt bauen: Kundensegmente und ihre Probleme. Jeder ICP sollte mindestens ein eigenes Problem haben.",
  "Изучить рынок и конкурентов":
    "Markt und Wettbewerber analysieren",
  "Чем клиенты решают проблему сегодня и какого размера рынок: конкуренты и TAM / SAM / SOM.":
    "Wie Kunden das Problem heute lösen und wie groß der Markt ist: Wettbewerber und TAM / SAM / SOM.",
  "Найти 10 потенциальных клиентов":
    "10 potenzielle Kunden finden",
  "Конкретные компании или люди, которые могут стать первыми клиентами.":
    "Konkrete Unternehmen oder Personen, die erste Kunden werden könnten.",
  "Провести интервью с клиентами":
    "Kundeninterviews führen",
  "Синтезировать выводы Discovery":
    "Discovery-Erkenntnisse zusammenfassen",
  "Что узнали из рынка и интервью: какие проблемы подтвердились, какие нет.":
    "Was wir aus Markt und Interviews gelernt haben: welche Probleme sich bestätigt haben und welche nicht.",
  "Сформулировать и приоритизировать гипотезы":
    "Hypothesen formulieren und priorisieren",
  "Что мы считаем правдой, но ещё не проверили. У каждой гипотезы — приоритет, способ проверки, критерий успеха и метрика, которую она двигает.":
    "Was wir für wahr halten, aber noch nicht geprüft haben. Jede Hypothese hat eine Priorität, eine Prüfmethode, ein Erfolgskriterium und die Metrik, die sie bewegt.",
  "Сформулировать гипотезу решения":
    "Lösungshypothese formulieren",
  "Что именно предлагаем: «Для [ICP] с проблемой [X] мы делаем [решение]; поверим, что работает, если [сигнал]». Это гипотеза с типом «Решение».":
    "Was genau wir anbieten: „Für [ICP] mit Problem [X] bauen wir [Lösung]; wir glauben, dass es funktioniert, wenn [Signal]“. Das ist eine Hypothese vom Typ „Lösung“.",
  "Определить риски и ключевые допущения":
    "Risiken und zentrale Annahmen bestimmen",
  "Что может помешать и во что мы верим без доказательств. Самые опасные допущения — первые кандидаты на эксперименты.":
    "Was im Weg stehen könnte und woran wir ohne Beweise glauben. Die gefährlichsten Annahmen sind die ersten Kandidaten für Experimente.",
  "Провести эксперименты":
    "Experimente durchführen",
  "Проверить гипотезы: создайте задачи из гипотез в профиле, обновляйте их статус и записывайте результат.":
    "Hypothesen prüfen: Erstellen Sie Aufgaben aus Hypothesen im Profil, aktualisieren Sie ihren Status und halten Sie das Ergebnis fest.",
  "Посчитать юнит-экономику":
    "Unit Economics berechnen",
  "Сходится ли модель до того, как вкладываться в MVP: что продаём, по какой цене, продажи и расходы.":
    "Ob das Modell aufgeht, bevor wir ins MVP investieren: was wir verkaufen, zu welchem Preis, Verkäufe und Kosten.",
  "Принять решение: Proceed / Adjust / Pivot / Stop":
    "Entscheiden: Proceed / Adjust / Pivot / Stop",
  "По итогам проверки: идём в MVP, корректируем, разворачиваемся или останавливаемся. Запишите решение и почему.":
    "Auf Basis der Prüfung: ins MVP gehen, anpassen, umschwenken oder aufhören. Halten Sie die Entscheidung und die Begründung fest.",
  "Определить цель MVP и критерии успеха":
    "MVP-Ziel und Erfolgskriterien festlegen",
  "Что должен доказать MVP и по каким метрикам поймём, что получилось: North Star и метрики под ней с целями.":
    "Was das MVP beweisen soll und an welchen Metriken wir den Erfolg erkennen: North Star und die Metriken darunter mit Zielen.",
  "Определить объём MVP":
    "MVP-Umfang festlegen",
  "Что входит в MVP и — не менее важно — что сознательно не входит.":
    "Was zum MVP gehört und – genauso wichtig – was bewusst nicht dazugehört.",
  "Описать путь клиента":
    "Customer Journey beschreiben",
  "Этапы от «узнал о проблеме» до «остаётся и рекомендует»: действие, точка контакта, боль.":
    "Phasen von „erkennt das Problem“ bis „bleibt und empfiehlt weiter“: Aktion, Kontaktpunkt, Schmerzpunkt.",
  "Приоритизировать бэклог":
    "Backlog priorisieren",
  "Разбить объём MVP на задачи и расставить приоритеты.":
    "Den MVP-Umfang in Aufgaben aufteilen und priorisieren.",
  "Составить план релизов":
    "Release-Plan erstellen",
  "Что и когда выпускаем, в каком порядке.":
    "Was wir wann und in welcher Reihenfolge veröffentlichen.",
  "Организовать разработку":
    "Entwicklung organisieren",
  "Команда, процесс, инструменты. Задачи разработки добавляйте в эту фазу по ходу работы.":
    "Team, Prozess, Werkzeuge. Fügen Sie Entwicklungsaufgaben im Laufe der Arbeit zu dieser Phase hinzu.",
  "Настроить аналитику":
    "Analytics einrichten",
  "Чтобы после запуска было что сравнивать: у метрик описано, как считаем, и есть стартовое значение.":
    "Damit es nach dem Launch etwas zu vergleichen gibt: Für jede Metrik ist die Berechnung beschrieben und es gibt einen Ausgangswert.",
  "Провести QA и проверить готовность к запуску":
    "QA durchführen und Launch-Bereitschaft prüfen",
  "Тестирование, исправление критичных ошибок, готовность поддержки.":
    "Tests, Behebung kritischer Fehler, Bereitschaft des Supports.",
  "Подготовить каналы и первых 100 клиентов":
    "Kanäle und die ersten 100 Kunden vorbereiten",
  "Как клиенты нас найдут: каналы привлечения, откуда возьмём первых 100 клиентов, план и дата запуска.":
    "Wie Kunden uns finden: Akquisekanäle, woher die ersten 100 Kunden kommen, Launch-Plan und -Datum.",
  "Запустить пилот / релиз":
    "Pilot / Release starten",
  "Запуск по плану из профиля.":
    "Launch gemäß dem Plan im Profil.",
  "Собрать данные и обратную связь":
    "Daten und Feedback sammeln",
  "Замеры метрик после запуска. Считаются только замеры, сделанные после того, как задача взята в работу.":
    "Messungen der Metriken nach dem Launch. Es zählen nur Messungen, die nach Beginn der Aufgabe erfasst wurden.",
  "Оценить результаты относительно критериев успеха":
    "Ergebnisse anhand der Erfolgskriterien bewerten",
  "Сравнить факт с целями MVP: что сработало, что нет.":
    "Ist-Werte mit den MVP-Zielen vergleichen: was funktioniert hat und was nicht.",
  "Определить проблемы и возможности":
    "Probleme und Chancen bestimmen",
  "Что нового узнали: обновлённые проблемы клиентов и новые гипотезы.":
    "Was wir neu gelernt haben: aktualisierte Kundenprobleme und neue Hypothesen.",
  "Принять решение по следующему циклу":
    "Über den nächsten Zyklus entscheiden",
  "Proceed — в рост, Adjust — новые эксперименты и доработки, Pivot — назад к основе и Discovery.":
    "Proceed – ins Wachstum, Adjust – neue Experimente und Verbesserungen, Pivot – zurück zu den Grundlagen und zur Discovery.",
  "Определить возможности роста":
    "Wachstumschancen bestimmen",
  "Новые гипотезы роста: аудитории, цена, каналы, продукт.":
    "Neue Wachstumshypothesen: Zielgruppen, Preis, Kanäle, Produkt.",
  "Оптимизировать привлечение, активацию и удержание":
    "Akquise, Aktivierung und Retention optimieren",
  "Работа с каналами: CAC, результаты, что масштабировать.":
    "Arbeit mit den Kanälen: CAC, Ergebnisse, was skaliert wird.",
  "Оптимизировать бизнес-модель и юнит-экономику":
    "Geschäftsmodell und Unit Economics optimieren",
  "Пересчитать экономику с реальными данными.":
    "Die Ökonomie mit echten Daten neu berechnen.",
  "Масштабировать процессы и каналы":
    "Prozesse und Kanäle skalieren",
  "Команда, процессы и каналы, которые выдержат рост.":
    "Team, Prozesse und Kanäle, die dem Wachstum standhalten.",
  "Хотя бы один ICP":
    "Mindestens ein ICP",
  "У ICP есть своя проблема":
    "Der ICP hat ein eigenes Problem",
  "Размер рынка: TAM, SAM и SOM":
    "Marktgröße: TAM, SAM und SOM",
  "Потенциальные клиенты":
    "Potenzielle Kunden",
  "Интервью (статус «Разговор» или «Пилот»)":
    "Interviews (Status „Gespräch“ oder „Pilot“)",
  "Записано, что узнали":
    "Erkenntnisse festgehalten",
  "Статусы проблем обновлены по итогам интервью":
    "Problemstatus nach den Interviews aktualisiert",
  "Со способом проверки":
    "Mit Prüfmethode",
  "С критерием успеха":
    "Mit Erfolgskriterium",
  "С метрикой, которую двигает":
    "Mit der Metrik, die sie bewegt",
  "Гипотеза с типом «Решение»":
    "Hypothese vom Typ „Lösung“",
  "Привязана к проблеме":
    "Mit einem Problem verknüpft",
  "Способ проверки и критерий успеха":
    "Prüfmethode und Erfolgskriterium",
  "Хотя бы один риск или допущение":
    "Mindestens ein Risiko oder eine Annahme",
  "Указано влияние":
    "Auswirkung angegeben",
  "Взяты в проверку":
    "In Prüfung genommen",
  "Проверены":
    "Geprüft",
  "Записан результат":
    "Ergebnis festgehalten",
  "Решение с итогом Proceed / Adjust / Pivot / Stop":
    "Eine Entscheidung mit Ergebnis Proceed / Adjust / Pivot / Stop",
  "Записано почему":
    "Begründung festgehalten",
  "Цель MVP":
    "MVP-Ziel",
  "Главная метрика (North Star)":
    "Hauptmetrik (North Star)",
  "Цель для главной метрики":
    "Ziel für die Hauptmetrik",
  "Метрика под главной с целью":
    "Eine untergeordnete Metrik mit Ziel",
  "Что входит в MVP":
    "Was zum MVP gehört",
  "Что не входит":
    "Was nicht dazugehört",
  "Этапы пути клиента":
    "Phasen der Customer Journey",
  "Описано действие клиента":
    "Aktion des Kunden beschrieben",
  "Описана боль":
    "Schmerzpunkt beschrieben",
  "Описано, как считаем":
    "Berechnung beschrieben",
  "Есть стартовое значение":
    "Ausgangswert vorhanden",
  "Хотя бы один канал привлечения":
    "Mindestens ein Akquisekanal",
  "Откуда возьмём первых 100 клиентов":
    "Woher die ersten 100 Kunden kommen",
  "Новый замер главной метрики":
    "Neue Messung der Hauptmetrik",
  "Новые замеры метрик":
    "Neue Messungen der Metriken",
  "Новые или обновлённые проблемы клиентов":
    "Neue oder aktualisierte Kundenprobleme",
  "Новые гипотезы":
    "Neue Hypothesen",
  "Новая гипотеза роста":
    "Eine neue Wachstumshypothese",
  "С приоритетом":
    "Mit Priorität",
  "Каналы обновлены":
    "Kanäle aktualisiert",
  "Указан CAC":
    "CAC angegeben",
  "Продукты и цены пересмотрены":
    "Produkte und Preise überprüft",
  "Финансовый план пересчитан":
    "Finanzplan neu berechnet",
  "Тезис: основной":
    "These: Kern",
  "Тезис: почему сейчас":
    "These: warum jetzt",
  "Тезис: уникальное преимущество":
    "These: einzigartiger Vorteil",
  "Тезис: мы — это…":
    "These: wir sind…",
  "Тезис: главный результат для клиента":
    "These: wichtigstes Ergebnis für den Kunden",
  "Хотя бы одна проблема клиентов":
    "Mindestens ein Kundenproblem",
  "Хотя бы одна ЦА (ICP)":
    "Mindestens eine Zielgruppe (ICP)",
  "Хотя бы одна гипотеза":
    "Mindestens eine Hypothese",
  "Способ проверки":
    "Prüfmethode",
  "Дедлайн проверки":
    "Prüfdeadline",
  "Хотя бы один конкурент":
    "Mindestens ein Wettbewerber",
  "Хотя бы один потенциальный клиент":
    "Mindestens ein potenzieller Kunde",
  "Хотя бы один этап пути клиента":
    "Mindestens eine Phase der Customer Journey",
  "Хотя бы одна метрика под главной":
    "Mindestens eine untergeordnete Metrik",
  "Первый замер":
    "Erste Messung",
  "Хотя бы один риск или вопрос":
    "Mindestens ein Risiko oder eine Frage",
  "Хотя бы одно решение":
    "Mindestens eine Entscheidung",
  "Продукт с ценой":
    "Ein Produkt mit Preis",
  "Продажи в месяц":
    "Verkäufe pro Monat",
  "Постоянные расходы":
    "Fixkosten",
  "Прогресс считается сам — по изменениям в профиле после того, как задача взята в работу.":
    "Der Fortschritt wird automatisch aus Profiländerungen nach Beginn der Aufgabe berechnet.",
  "Прогресс считается сам по заполненности профиля.":
    "Der Fortschritt wird automatisch aus dem Ausfüllgrad des Profils berechnet.",
  "Не начато":
    "Nicht begonnen",
  "В процессе":
    "In Arbeit",
  "Нужно обсудить":
    "Zu besprechen",
  "На пересмотре":
    "In Überprüfung",
  "владелец":
    "Inhaber",
  "редактор":
    "Bearbeiter",
  "клиент · просмотр":
    "Kunde · nur Ansicht",
  "раб. день":
    "Arbeitstag",
  "раб. дня":
    "Arbeitstage",
  "раб. дней":
    "Arbeitstage",
  "Прогресс считается сам — по изменениям в профиле после того, как задача взята в работу. Когда решите, что достаточно, — закройте задачу статусом «Готово».":
    "Der Fortschritt wird automatisch aus Profiländerungen nach Beginn der Aufgabe berechnet. Wenn Sie es für ausreichend halten, schließen Sie die Aufgabe mit dem Status „Fertig“.",
  "Прогресс считается сам по заполненности профиля. Когда решите, что достаточно, — закройте задачу статусом «Готово».":
    "Der Fortschritt wird automatisch aus dem Ausfüllgrad des Profils berechnet. Wenn Sie es für ausreichend halten, schließen Sie die Aufgabe mit dem Status „Fertig“.",
  "Открыть профиль →":
    "Profil öffnen →",
  "Поговорить минимум с 8 потенциальными клиентами. Ставьте клиенту статус «Разговор» или «Пилот» и записывайте, что узнали.":
    "Sprechen Sie mit mindestens 8 potenziellen Kunden. Setzen Sie den Status des Kunden auf „Gespräch“ oder „Pilot“ und halten Sie fest, was Sie erfahren haben.",
};
