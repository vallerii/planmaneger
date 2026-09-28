// Шаблон продуктового цикла и прогресс задач, связанных с профилем.
// Прогресс = заполненные пункты / все пункты, максимум 99%. 100% — только когда человек закрыл задачу.
//
// Петля цикла: у каждого блока профиля есть «главная» задача — она считает весь блок.
// Повторные задачи (поздние фазы) и задачи «На пересмотре» считают только то,
// что добавлено или изменено после tasks.counted_from.

import { n } from "./economics";
import type { ProductProfile, ProfileItem, Tab } from "./profile";
import type { Size } from "./types";

/** Задачи старой фазы 0 (проекты, созданные до шаблона). */
export type LegacyStep =
  | "foundation"
  | "hypotheses"
  | "market"
  | "gtm"
  | "economics"
  | "metrics"
  | "risks";

export type CycleStep =
  | "mission_vision"
  | "thesis"
  | "problems"
  | "icp"
  | "market_research"
  | "prospects"
  | "interviews"
  | "discovery_insights"
  | "hypotheses_set"
  | "solution_hyp"
  | "risks_set"
  | "experiments"
  | "unit_economics"
  | "decision_validation"
  | "mvp_goal"
  | "mvp_scope"
  | "journey"
  | "analytics"
  | "channels_launch"
  | "measure_data"
  | "new_opportunities"
  | "decision_cycle"
  | "growth_ideas"
  | "growth_channels"
  | "economics_growth";

export type ProfileStep = LegacyStep | CycleStep;

/** ratio — частичное выполнение пункта (0–1), например «4 из 10». */
export type CheckItem = {
  label: string;
  done: boolean;
  tab: Tab;
  sec: string;
  ratio?: number;
};

/** Повторные задачи: считают только изменения после counted_from. */
export const REPEAT_STEPS: ReadonlySet<ProfileStep> = new Set<ProfileStep>([
  "measure_data",
  "new_opportunities",
  "decision_cycle",
  "growth_ideas",
  "growth_channels",
  "economics_growth",
]);

/** Сколько интервью считаем достаточным для Discovery. */
export const INTERVIEW_TARGET = 8;

// ---------------------------------------------------------------
// Шаблон: 8 фаз продуктового цикла
// ---------------------------------------------------------------

export type TemplateTask = {
  name: string;
  size: Size;
  about: string;
  /** связь с профилем; без неё — обычная задача с ручным прогрессом */
  step?: CycleStep;
  /** вкладка профиля для ссылки в описании обычной задачи */
  tab?: Tab;
};

export const CYCLE_TEMPLATE: { name: string; tasks: TemplateTask[] }[] = [
  {
    name: "Product Profile",
    tasks: [
      {
        step: "mission_vision",
        name: "Сформулировать миссию и видение",
        size: "S",
        about:
          "Зачем существует продукт и каким мир станет, если у нас получится.",
      },
      {
        step: "thesis",
        name: "Сформулировать тезисы продукта",
        size: "S",
        about:
          "Главная ставка, почему сейчас, наше преимущество, «мы — это…» и главный результат для клиента.",
      },
      {
        step: "problems",
        name: "Описать проблемы клиентов",
        size: "M",
        about:
          "Какие проблемы решаем, в формате «Когда… хочу… чтобы…». Прогресс пойдёт с первой проблемы, от трёх — 99%. Можно добавлять больше.",
      },
      {
        step: "icp",
        name: "Описать ICP",
        size: "M",
        about:
          "Для кого делаем продукт: сегменты клиентов и их проблемы. У каждого ICP должна быть хотя бы одна своя проблема.",
      },
    ],
  },
  {
    name: "Discovery",
    tasks: [
      {
        step: "market_research",
        name: "Изучить рынок и конкурентов",
        size: "L",
        about:
          "Чем клиенты решают проблему сегодня и какого размера рынок: конкуренты и TAM / SAM / SOM.",
      },
      {
        step: "prospects",
        name: "Найти 10 потенциальных клиентов",
        size: "M",
        about:
          "Конкретные компании или люди, которые могут стать первыми клиентами.",
      },
      {
        step: "interviews",
        name: "Провести интервью с клиентами",
        size: "XL",
        about: `Поговорить минимум с ${INTERVIEW_TARGET} потенциальными клиентами. Ставьте клиенту статус «Разговор» или «Пилот» и записывайте, что узнали.`,
      },
      {
        step: "discovery_insights",
        name: "Синтезировать выводы Discovery",
        size: "S",
        about:
          "Что узнали из рынка и интервью: какие проблемы подтвердились, какие нет.",
      },
      {
        step: "hypotheses_set",
        name: "Сформулировать и приоритизировать гипотезы",
        size: "M",
        about:
          "Что мы считаем правдой, но ещё не проверили. У каждой гипотезы — приоритет, способ проверки, критерий успеха и метрика, которую она двигает.",
      },
    ],
  },
  {
    name: "Validation",
    tasks: [
      {
        step: "solution_hyp",
        name: "Сформулировать гипотезу решения",
        size: "M",
        about:
          "Что именно предлагаем: «Для [ICP] с проблемой [X] мы делаем [решение]; поверим, что работает, если [сигнал]». Это гипотеза с типом «Решение».",
      },
      {
        step: "risks_set",
        name: "Определить риски и ключевые допущения",
        size: "S",
        about:
          "Что может помешать и во что мы верим без доказательств. Самые опасные допущения — первые кандидаты на эксперименты.",
      },
      {
        step: "experiments",
        name: "Провести эксперименты",
        size: "XL",
        about:
          "Проверить гипотезы: создайте задачи из гипотез в профиле, обновляйте их статус и записывайте результат.",
      },
      {
        step: "unit_economics",
        name: "Посчитать юнит-экономику",
        size: "L",
        about:
          "Сходится ли модель до того, как вкладываться в MVP: что продаём, по какой цене, продажи и расходы.",
      },
      {
        step: "decision_validation",
        name: "Принять решение: Proceed / Adjust / Pivot / Stop",
        size: "S",
        about:
          "По итогам проверки: идём в MVP, корректируем, разворачиваемся или останавливаемся. Запишите решение и почему.",
      },
    ],
  },
  {
    name: "MVP",
    tasks: [
      {
        step: "mvp_goal",
        name: "Определить цель MVP и критерии успеха",
        size: "M",
        about:
          "Что должен доказать MVP и по каким метрикам поймём, что получилось: North Star и метрики под ней с целями.",
      },
      {
        step: "mvp_scope",
        name: "Определить объём MVP",
        size: "M",
        about: "Что входит в MVP и — не менее важно — что сознательно не входит.",
      },
      {
        step: "journey",
        name: "Описать путь клиента",
        size: "M",
        about:
          "Этапы от «узнал о проблеме» до «остаётся и рекомендует»: действие, точка контакта, боль.",
      },
      {
        name: "Приоритизировать бэклог",
        size: "M",
        tab: "mvp",
        about: "Разбить объём MVP на задачи и расставить приоритеты.",
      },
      {
        name: "Составить план релизов",
        size: "S",
        tab: "mvp",
        about: "Что и когда выпускаем, в каком порядке.",
      },
    ],
  },
  {
    name: "Build",
    tasks: [
      {
        name: "Организовать разработку",
        size: "L",
        about:
          "Команда, процесс, инструменты. Задачи разработки добавляйте в эту фазу по ходу работы.",
      },
    ],
  },
  {
    name: "Launch",
    tasks: [
      {
        step: "analytics",
        name: "Настроить аналитику",
        size: "M",
        about:
          "Чтобы после запуска было что сравнивать: у метрик описано, как считаем, и есть стартовое значение.",
      },
      {
        name: "Провести QA и проверить готовность к запуску",
        size: "M",
        about: "Тестирование, исправление критичных ошибок, готовность поддержки.",
      },
      {
        step: "channels_launch",
        name: "Подготовить каналы и первых 100 клиентов",
        size: "L",
        about:
          "Как клиенты нас найдут: каналы привлечения, откуда возьмём первых 100 клиентов, план и дата запуска.",
      },
      {
        name: "Запустить пилот / релиз",
        size: "S",
        tab: "gtm",
        about: "Запуск по плану из профиля.",
      },
    ],
  },
  {
    name: "Measure & Iterate",
    tasks: [
      {
        step: "measure_data",
        name: "Собрать данные и обратную связь",
        size: "L",
        about:
          "Замеры метрик после запуска. Считаются только замеры, сделанные после того, как задача взята в работу.",
      },
      {
        name: "Оценить результаты относительно критериев успеха",
        size: "M",
        tab: "metrics",
        about: "Сравнить факт с целями MVP: что сработало, что нет.",
      },
      {
        step: "new_opportunities",
        name: "Определить проблемы и возможности",
        size: "M",
        about:
          "Что нового узнали: обновлённые проблемы клиентов и новые гипотезы.",
      },
      {
        step: "decision_cycle",
        name: "Принять решение по следующему циклу",
        size: "S",
        about:
          "Proceed — в рост, Adjust — новые эксперименты и доработки, Pivot — назад к основе и Discovery.",
      },
    ],
  },
  {
    name: "Growth",
    tasks: [
      {
        step: "growth_ideas",
        name: "Определить возможности роста",
        size: "M",
        about: "Новые гипотезы роста: аудитории, цена, каналы, продукт.",
      },
      {
        step: "growth_channels",
        name: "Оптимизировать привлечение, активацию и удержание",
        size: "XL",
        about: "Работа с каналами: CAC, результаты, что масштабировать.",
      },
      {
        step: "economics_growth",
        name: "Оптимизировать бизнес-модель и юнит-экономику",
        size: "L",
        about: "Пересчитать экономику с реальными данными.",
      },
      {
        name: "Масштабировать процессы и каналы",
        size: "XL",
        about: "Команда, процессы и каналы, которые выдержат рост.",
      },
    ],
  },
];

/** Вкладка профиля, с которой связан шаг (для ссылок). */
export const STEP_TAB: Record<ProfileStep, Tab> = {
  foundation: "foundation",
  hypotheses: "hypotheses",
  market: "market",
  gtm: "gtm",
  economics: "economics",
  metrics: "metrics",
  risks: "risks",
  mission_vision: "foundation",
  thesis: "foundation",
  problems: "foundation",
  icp: "foundation",
  market_research: "market",
  prospects: "market",
  interviews: "market",
  discovery_insights: "market",
  hypotheses_set: "hypotheses",
  solution_hyp: "hypotheses",
  risks_set: "risks",
  experiments: "hypotheses",
  unit_economics: "economics",
  decision_validation: "decisions",
  mvp_goal: "mvp",
  mvp_scope: "mvp",
  journey: "mvp",
  analytics: "metrics",
  channels_launch: "gtm",
  measure_data: "metrics",
  new_opportunities: "hypotheses",
  decision_cycle: "decisions",
  growth_ideas: "hypotheses",
  growth_channels: "gtm",
  economics_growth: "economics",
};

// ---------------------------------------------------------------
// С какого момента считать
// ---------------------------------------------------------------

/** Задача ждёт старта: повторная задача ещё не взята в работу. */
export const WAITING = "9999-12-31T00:00:00.000Z";

/**
 * null — считать весь блок; ISO-дата — только изменения после неё;
 * WAITING — повторная задача ещё не начата (прогресса нет).
 */
export function countSince(t: {
  profile_step?: string | null;
  status: string;
  counted_from?: string | null;
}): string | null {
  const step = t.profile_step as ProfileStep | null | undefined;
  if (!step) return null;
  if (t.status === "revisit") return t.counted_from || WAITING;
  if (REPEAT_STEPS.has(step)) return t.counted_from || WAITING;
  return null;
}

/** Нужно ли выставить counted_from при смене статуса. */
export function countedFromPatch(
  t: {
    profile_step?: string | null;
    status: string;
    counted_from?: string | null;
  },
  next: string,
): { counted_from: string } | Record<string, never> {
  const step = t.profile_step as ProfileStep | null | undefined;
  if (!step) return {};
  const now = new Date().toISOString();
  // переоткрыли на пересмотр — считаем заново с этого момента
  if (next === "revisit" && t.status !== "revisit")
    return { counted_from: now };
  // повторную задачу взяли в работу впервые
  if (
    REPEAT_STEPS.has(step) &&
    !t.counted_from &&
    next !== "todo" &&
    next !== "cancelled"
  )
    return { counted_from: now };
  return {};
}

// ---------------------------------------------------------------
// Чек-листы
// ---------------------------------------------------------------

const has = (v?: string | null) => !!v && !!v.trim();
const ratio = (k: number, of: number) => (of ? Math.min(1, k / of) : 0);

export function stepChecklist(
  step: ProfileStep,
  profile: ProductProfile,
  items: ProfileItem[],
  since: string | null = null,
): CheckItem[] {
  const fresh = (i: ProfileItem) => !since || i.updated_at >= since;
  const any = (kind: ProfileItem["kind"]) =>
    items.filter((i) => i.kind === kind && has(i.title) && fresh(i));
  const all = (kind: ProfileItem["kind"]) =>
    items.filter((i) => i.kind === kind && has(i.title));
  const secFresh = (sec: string) =>
    !since || (profile.updated?.[sec] ?? "") >= since;
  /** текстовое поле профиля: заполнено и (при пересмотре) изменено после since */
  const txt = (v: string | null | undefined, sec: string) =>
    has(v) && secFresh(sec);
  const t = profile.thesis ?? {};
  const g = profile.gtm ?? {};
  const m = profile.mvp ?? {};
  const e = profile.economics ?? {};
  const cnt = (label: string, k: number, of: number, tab: Tab, sec: string) => ({
    label: `${label}: ${Math.min(k, of)} из ${of}`,
    done: k >= of,
    ratio: ratio(k, of),
    tab,
    sec,
  });

  switch (step) {
    // ---------- Product Profile ----------
    case "mission_vision":
      return [
        { label: "Миссия", done: txt(profile.mission, "mission"), tab: "foundation", sec: "mission" },
        { label: "Видение", done: txt(profile.vision, "mission"), tab: "foundation", sec: "mission:vision" },
      ];
    case "thesis":
      return [
        { label: "Основной тезис", done: txt(t.main, "thesis"), tab: "foundation", sec: "thesis:main" },
        { label: "Почему сейчас", done: txt(t.why_now, "thesis"), tab: "foundation", sec: "thesis:why_now" },
        { label: "Уникальное преимущество", done: txt(t.advantage, "thesis"), tab: "foundation", sec: "thesis:advantage" },
        { label: "Мы — это…", done: txt(t.category, "thesis"), tab: "foundation", sec: "thesis:category" },
        { label: "Главный результат для клиента", done: txt(t.value, "thesis"), tab: "foundation", sec: "thesis:value" },
      ];
    case "problems":
      return [cnt("Проблемы клиентов", any("problem").length, 3, "foundation", "problem")];
    case "icp": {
      const icps = any("icp");
      const problems = all("problem");
      return [
        { label: "Хотя бы один ICP", done: icps.length > 0, tab: "foundation", sec: "icp" },
        {
          label: "У ICP есть своя проблема",
          done: icps.some((i) => problems.some((p) => p.data.icp_id === i.id)),
          tab: "foundation",
          sec: "problem",
        },
      ];
    }

    // ---------- Discovery ----------
    case "market_research": {
      const comps = any("competitor");
      return [
        cnt("Конкуренты", comps.length, 3, "market", "competitor"),
        {
          label: "Размер рынка: TAM, SAM и SOM",
          done:
            secFresh("market_size") &&
            (["tam", "sam", "som"] as const).every(
              (k) => n(profile.market_size?.[k]?.value) > 0,
            ),
          tab: "market",
          sec: "market_size",
        },
      ];
    }
    case "prospects":
      return [cnt("Потенциальные клиенты", any("prospect").length, 10, "market", "prospect")];
    case "interviews": {
      const talked = any("prospect").filter((p) =>
        ["talked", "pilot"].includes(p.status),
      );
      const noted = talked.filter((p) => has(p.data.evidence) || has(p.data.why));
      return [
        cnt("Интервью (статус «Разговор» или «Пилот»)", talked.length, INTERVIEW_TARGET, "market", "prospect"),
        cnt("Записано, что узнали", noted.length, INTERVIEW_TARGET, "market", "prospect"),
      ];
    }
    case "discovery_insights":
      return [
        { label: "Выводы из анализа рынка", done: txt(profile.market_notes, "market"), tab: "market", sec: "market" },
        {
          label: "Статусы проблем обновлены по итогам интервью",
          done: all("problem").some((p) => p.status !== "assumption"),
          tab: "foundation",
          sec: "problem",
        },
      ];
    case "hypotheses_set": {
      const hs = any("hypothesis");
      // качество считаем от цели (3 гипотезы), чтобы одна идеальная гипотеза не давала 90%
      const of = Math.max(3, hs.length);
      const with_ = (k: string) => hs.filter((h) => has(String(h.data[k] ?? ""))).length;
      return [
        cnt("Гипотезы", hs.length, 3, "hypotheses", "hypothesis"),
        cnt("Со способом проверки", with_("method"), of, "hypotheses", "hypothesis"),
        cnt("С критерием успеха", with_("criterion"), of, "hypotheses", "hypothesis"),
        cnt("С метрикой, которую двигает", with_("metric_id"), of, "hypotheses", "hypothesis"),
      ];
    }

    // ---------- Validation ----------
    case "solution_hyp": {
      const hs = any("hypothesis").filter((h) => h.data.type === "solution");
      return [
        { label: "Гипотеза с типом «Решение»", done: hs.length > 0, tab: "hypotheses", sec: "hypothesis" },
        { label: "Привязана к проблеме", done: hs.some((h) => has(h.data.problem_id)), tab: "hypotheses", sec: "hypothesis" },
        {
          label: "Способ проверки и критерий успеха",
          done: hs.some((h) => has(h.data.method) && has(h.data.criterion)),
          tab: "hypotheses",
          sec: "hypothesis",
        },
      ];
    }
    case "risks_set": {
      const rs = any("risk");
      return [
        { label: "Хотя бы один риск или допущение", done: rs.length > 0, tab: "risks", sec: "risk" },
        { label: "Указано влияние", done: rs.some((r) => has(r.data.impact)), tab: "risks", sec: "risk" },
        { label: "Как проверить / снизить", done: rs.some((r) => has(r.data.mitigation)), tab: "risks", sec: "risk" },
      ];
    }
    case "experiments": {
      const hs = all("hypothesis");
      const touched = any("hypothesis");
      const started = touched.filter((h) => h.status !== "todo");
      const checked = touched.filter((h) => ["confirmed", "refuted"].includes(h.status));
      return [
        cnt("Взяты в проверку", started.length, Math.max(1, hs.length), "hypotheses", "hypothesis"),
        cnt("Проверены", checked.length, Math.max(1, hs.length), "hypotheses", "hypothesis"),
        {
          label: "Записан результат",
          done: checked.length > 0 && checked.every((h) => has(h.data.result)),
          tab: "hypotheses",
          sec: "hypothesis",
        },
      ];
    }
    case "unit_economics":
      return economicsList(profile, items, since);
    case "decision_validation":
    case "decision_cycle": {
      const ds = any("decision").filter((d) => has(d.data.verdict));
      return [
        { label: "Решение с итогом Proceed / Adjust / Pivot / Stop", done: ds.length > 0, tab: "decisions", sec: "decision" },
        { label: "Записано почему", done: ds.some((d) => has(d.data.why)), tab: "decisions", sec: "decision" },
      ];
    }

    // ---------- MVP ----------
    case "mvp_goal": {
      const ms = all("metric");
      const ns = ms.find((x) => x.data.level === "north");
      return [
        { label: "Цель MVP", done: txt(m.goal, "mvp"), tab: "mvp", sec: "mvp" },
        { label: "Главная метрика (North Star)", done: !!ns, tab: "metrics", sec: "metric" },
        { label: "Цель для главной метрики", done: !!ns && n(ns.data.target) !== 0, tab: "metrics", sec: "metric" },
        {
          label: "Метрика под главной с целью",
          done: ms.some((x) => x.data.level !== "north" && n(x.data.target) !== 0),
          tab: "metrics",
          sec: "metric",
        },
      ];
    }
    case "mvp_scope":
      return [
        { label: "Что входит в MVP", done: txt(m.in_scope, "mvp"), tab: "mvp", sec: "mvp" },
        { label: "Что не входит", done: txt(m.out_scope, "mvp"), tab: "mvp", sec: "mvp" },
      ];
    case "journey": {
      const js = any("journey");
      const of = Math.max(3, js.length);
      return [
        cnt("Этапы пути клиента", js.length, 3, "mvp", "journey"),
        cnt("Описано действие клиента", js.filter((j) => has(j.data.action)).length, of, "mvp", "journey"),
        cnt("Описана боль", js.filter((j) => has(j.data.pain)).length, of, "mvp", "journey"),
      ];
    }

    // ---------- Launch ----------
    case "analytics": {
      const ms = all("metric");
      const k = ms.length || 1;
      return [
        cnt("Описано, как считаем", ms.filter((x) => has(x.data.formula)).length, k, "metrics", "metric"),
        cnt("Есть стартовое значение", ms.filter((x) => x.data.baseline !== undefined && x.data.baseline !== null && x.data.baseline !== "").length, k, "metrics", "metric"),
      ];
    }
    case "channels_launch":
      return [
        { label: "Хотя бы один канал привлечения", done: any("channel").length > 0, tab: "gtm", sec: "channel" },
        { label: "Откуда возьмём первых 100 клиентов", done: txt(g.first100, "gtm"), tab: "gtm", sec: "gtm" },
        { label: "План запуска", done: txt(g.launch_plan, "gtm"), tab: "gtm", sec: "gtm" },
        { label: "Дата запуска", done: txt(g.launch_date, "gtm"), tab: "gtm", sec: "gtm" },
      ];

    // ---------- Measure & Iterate ----------
    case "measure_data": {
      const ms = all("metric");
      const day = since ? since.slice(0, 10) : "";
      const measured = (x: ProfileItem) => {
        const h = Array.isArray(x.data.history) ? (x.data.history as { date: string }[]) : [];
        return since ? h.some((r) => r.date >= day) : h.length > 0 || has(x.data.measured_at);
      };
      const ns = ms.find((x) => x.data.level === "north");
      return [
        { label: "Новый замер главной метрики", done: !!ns && measured(ns), tab: "metrics", sec: "metric" },
        cnt("Новые замеры метрик", ms.filter(measured).length, ms.length || 1, "metrics", "metric"),
      ];
    }
    case "new_opportunities":
      return [
        { label: "Новые или обновлённые проблемы клиентов", done: any("problem").length > 0, tab: "foundation", sec: "problem" },
        { label: "Новые гипотезы", done: any("hypothesis").length > 0, tab: "hypotheses", sec: "hypothesis" },
      ];

    // ---------- Growth ----------
    case "growth_ideas": {
      const hs = any("hypothesis");
      return [
        { label: "Новая гипотеза роста", done: hs.length > 0, tab: "hypotheses", sec: "hypothesis" },
        { label: "С метрикой, которую двигает", done: hs.some((h) => has(h.data.metric_id)), tab: "hypotheses", sec: "hypothesis" },
        { label: "С приоритетом", done: hs.some((h) => has(h.data.priority)), tab: "hypotheses", sec: "hypothesis" },
      ];
    }
    case "growth_channels": {
      const cs = any("channel");
      return [
        { label: "Каналы обновлены", done: cs.length > 0, tab: "gtm", sec: "channel" },
        { label: "Указан CAC", done: cs.some((c) => n(c.data.cac) > 0), tab: "gtm", sec: "channel" },
        { label: "Записан результат", done: cs.some((c) => has(c.data.result)), tab: "gtm", sec: "channel" },
      ];
    }
    case "economics_growth":
      return [
        { label: "Продукты и цены пересмотрены", done: any("product").length > 0, tab: "economics", sec: "product" },
        { label: "Финансовый план пересчитан", done: secFresh("plan") && n(e.base_sales) > 0, tab: "economics", sec: "plan" },
      ];

    // ---------- старая фаза 0 ----------
    case "foundation":
      return [
        { label: "Миссия", done: has(profile.mission), tab: "foundation", sec: "mission" },
        { label: "Видение", done: has(profile.vision), tab: "foundation", sec: "mission:vision" },
        { label: "Тезис: основной", done: has(t.main), tab: "foundation", sec: "thesis:main" },
        { label: "Тезис: почему сейчас", done: has(t.why_now), tab: "foundation", sec: "thesis:why_now" },
        { label: "Тезис: уникальное преимущество", done: has(t.advantage), tab: "foundation", sec: "thesis:advantage" },
        { label: "Тезис: мы — это…", done: has(t.category), tab: "foundation", sec: "thesis:category" },
        { label: "Тезис: главный результат для клиента", done: has(t.value), tab: "foundation", sec: "thesis:value" },
        { label: "Хотя бы одна проблема клиентов", done: any("problem").length > 0, tab: "foundation", sec: "problem" },
        { label: "Хотя бы одна ЦА (ICP)", done: any("icp").length > 0, tab: "foundation", sec: "icp" },
      ];
    case "hypotheses": {
      const hs = any("hypothesis");
      const some = (k: string) => hs.some((h) => has(String(h.data[k] ?? "")));
      return [
        { label: "Хотя бы одна гипотеза", done: hs.length > 0, tab: "hypotheses", sec: "hypothesis" },
        { label: "Способ проверки", done: some("method"), tab: "hypotheses", sec: "hypothesis" },
        { label: "Критерий успеха", done: some("criterion"), tab: "hypotheses", sec: "hypothesis" },
        { label: "Дедлайн проверки", done: some("deadline"), tab: "hypotheses", sec: "hypothesis" },
      ];
    }
    case "market":
      return [
        { label: "Хотя бы один конкурент", done: any("competitor").length > 0, tab: "market", sec: "competitor" },
        { label: "Хотя бы один потенциальный клиент", done: any("prospect").length > 0, tab: "market", sec: "prospect" },
        {
          label: "Размер рынка: TAM, SAM и SOM",
          done: (["tam", "sam", "som"] as const).every((k) => n(profile.market_size?.[k]?.value) > 0),
          tab: "market",
          sec: "market_size",
        },
        { label: "Выводы из анализа рынка", done: has(profile.market_notes), tab: "market", sec: "market" },
      ];
    case "gtm":
      return [
        { label: "Хотя бы один этап пути клиента", done: any("journey").length > 0, tab: "mvp", sec: "journey" },
        { label: "Хотя бы один канал привлечения", done: any("channel").length > 0, tab: "gtm", sec: "channel" },
        { label: "Откуда возьмём первых 100 клиентов", done: has(g.first100), tab: "gtm", sec: "gtm" },
        { label: "План запуска", done: has(g.launch_plan), tab: "gtm", sec: "gtm" },
      ];
    case "metrics": {
      const ms = any("metric");
      const ns = ms.find((x) => x.data.level === "north");
      return [
        { label: "Главная метрика (North Star)", done: !!ns, tab: "metrics", sec: "metric" },
        { label: "Цель для главной метрики", done: !!ns && n(ns.data.target) !== 0, tab: "metrics", sec: "metric" },
        { label: "Хотя бы одна метрика под главной", done: ms.some((x) => x.data.level !== "north"), tab: "metrics", sec: "metric" },
        { label: "Первый замер", done: ms.some((x) => !!x.data.measured_at), tab: "metrics", sec: "metric" },
      ];
    }
    case "economics":
      return economicsList(profile, items, since);
    case "risks":
      return [
        { label: "Хотя бы один риск или вопрос", done: any("risk").length > 0, tab: "risks", sec: "risk" },
        { label: "Хотя бы одно решение", done: any("decision").length > 0, tab: "decisions", sec: "decision" },
      ];
  }
}

function economicsList(
  profile: ProductProfile,
  items: ProfileItem[],
  since: string | null,
): CheckItem[] {
  const e = profile.economics ?? {};
  const planFresh = !since || (profile.updated?.plan ?? "") >= since;
  return [
    {
      label: "Продукт с ценой",
      done: items.some(
        (i) =>
          i.kind === "product" &&
          n(i.data.price) > 0 &&
          (!since || i.updated_at >= since),
      ),
      tab: "economics",
      sec: "product",
    },
    { label: "Продажи в месяц", done: planFresh && n(e.base_sales) > 0, tab: "economics", sec: "plan" },
    { label: "Постоянные расходы", done: planFresh && n(e.base_fixed) > 0, tab: "economics", sec: "plan" },
  ];
}

/** 0–99: доля заполненных пунктов (частичные — по ratio). 100 ставится только при закрытии задачи. */
export function stepProgress(list: CheckItem[]) {
  if (!list.length) return 0;
  const sum = list.reduce(
    (s, c) => s + (c.done ? 1 : Math.max(0, Math.min(1, c.ratio ?? 0))),
    0,
  );
  return Math.min(99, Math.round((sum / list.length) * 100));
}

/** Прогресс задачи с учётом статуса и counted_from. */
export function taskStepProgress(
  t: { profile_step?: string | null; status: string; counted_from?: string | null },
  profile: ProductProfile,
  items: ProfileItem[],
) {
  const step = t.profile_step as ProfileStep;
  return stepProgress(stepChecklist(step, profile, items, countSince(t)));
}

export function stepDescription(
  task: TemplateTask,
  projectId: string,
) {
  const tab = task.step ? STEP_TAB[task.step] : task.tab;
  const link = tab
    ? `<p><a href="/projects/${projectId}/profile?tab=${tab}">Открыть профиль →</a></p>`
    : "";
  if (!task.step) return `<p>${task.about}</p>${link}`;
  const auto = REPEAT_STEPS.has(task.step)
    ? "Прогресс считается сам — по изменениям в профиле после того, как задача взята в работу."
    : "Прогресс считается сам по заполненности профиля.";
  return `<p>${task.about}</p><p>${auto} Когда решите, что достаточно, — закройте задачу статусом «Готово».</p>${link}`;
}

export const stepHref = (projectId: string, c: { tab: Tab; sec: string }) =>
  `/projects/${projectId}/profile?tab=${c.tab}&sec=${encodeURIComponent(c.sec)}`;
