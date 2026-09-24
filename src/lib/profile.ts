// Профиль продукта: типы, справочники статусов, свежесть и готовность.
import type { Economics } from "./economics";

export type ItemKind =
  | "problem"
  | "icp"
  | "hypothesis"
  | "risk"
  | "decision"
  | "competitor"
  | "prospect"
  | "product"
  | "metric"
  | "channel"
  | "journey";

/* eslint-disable @typescript-eslint/no-explicit-any */
export type ProfileItem = {
  id: string;
  project_id: string;
  kind: ItemKind;
  title: string;
  status: string;
  data: Record<string, any>;
  position: number;
  created_at: string;
  updated_at: string;
};
/* eslint-enable @typescript-eslint/no-explicit-any */

export type Positioning = {
  icp_id?: string;
  problem_id?: string;
  alternatives?: string;
  category?: string;
  value?: string;
  difference?: string;
};

export type Thesis = {
  main?: string;
  why_now?: string;
  advantage?: string;
  /** «Мы — это…» — категория продукта (для позиционирования) */
  category?: string;
  /** Главный результат для клиента (для позиционирования) */
  value?: string;
};

/** TAM / SAM / SOM: значение (в валюте экономики) и как посчитали. */
export type MarketSize = Partial<
  Record<"tam" | "sam" | "som", { value?: number; calc?: string }>
>;

/** Выход на рынок. */
export type Gtm = {
  clients_now?: number;
  first100?: string;
  launch_date?: string;
  launch_type?: string;
  launch_plan?: string;
};

export type ProductProfile = {
  project_id: string;
  mission: string;
  vision: string;
  market_size: MarketSize;
  gtm: Gtm;
  market_notes: string;
  economics: Economics;
  positioning: Positioning;
  thesis: Thesis;
  next_review: string | null;
  reviewed: Record<string, string>;
  updated: Record<string, string>;
};

export type HistoryEntry = {
  id: string;
  event: "added" | "status" | "removed" | "note";
  kind: ItemKind | null;
  title: string | null;
  from_status: string | null;
  to_status: string | null;
  note: string | null;
  created_at: string;
  actor_id: string | null;
  actor?: { full_name: string | null; email: string } | null;
};

export const emptyProfile = (projectId: string): ProductProfile => ({
  project_id: projectId,
  mission: "",
  vision: "",
  market_size: {},
  gtm: {},
  market_notes: "",
  economics: {},
  positioning: {},
  thesis: {},
  next_review: null,
  reviewed: {},
  updated: {},
});

// ---------- статусы ----------
export type Tone = "gray" | "blue" | "green" | "red" | "yellow";
export const TONE: Record<Tone, { badge: string; dot: string }> = {
  gray: { badge: "bg-[#efeee8] text-[#5d5b54]", dot: "bg-[#b5b3aa]" },
  blue: { badge: "bg-[#e6effc] text-[#1d4f9a]", dot: "bg-[#3b7be0]" },
  green: { badge: "bg-[#e8f5ef] text-[#0b6b4c]", dot: "bg-ok" },
  red: { badge: "bg-[#fff0ed] text-bad", dot: "bg-bad" },
  yellow: { badge: "bg-[#fff5d8] text-[#6b4c00]", dot: "bg-warn" },
};

type Opt = { value: string; label: string; tone: Tone };
export const STATUS: Record<ItemKind, Opt[]> = {
  problem: [
    { value: "assumption", label: "Предположение", tone: "gray" },
    { value: "signals", label: "Есть сигналы", tone: "blue" },
    { value: "validated", label: "Подтверждена", tone: "green" },
    { value: "refuted", label: "Опровергнута", tone: "red" },
  ],
  icp: [
    { value: "unverified", label: "Не проверен", tone: "gray" },
    { value: "testing", label: "В проверке", tone: "blue" },
    { value: "validated", label: "Подтверждён", tone: "green" },
    { value: "rejected", label: "Не подходит", tone: "red" },
  ],
  hypothesis: [
    { value: "todo", label: "Нужно проверить", tone: "gray" },
    { value: "testing", label: "В проверке", tone: "blue" },
    { value: "confirmed", label: "Подтверждена", tone: "green" },
    { value: "refuted", label: "Опровергнута", tone: "red" },
  ],
  risk: [
    { value: "open", label: "Открыт", tone: "yellow" },
    { value: "closed", label: "Закрыт", tone: "green" },
  ],
  decision: [
    { value: "active", label: "Действует", tone: "green" },
    { value: "revisit", label: "Пересмотреть", tone: "yellow" },
    { value: "cancelled", label: "Отменено", tone: "gray" },
  ],
  competitor: [
    { value: "shallow", label: "Поверхностно", tone: "red" },
    { value: "medium", label: "Средне", tone: "yellow" },
    { value: "deep", label: "Глубоко", tone: "green" },
  ],
  prospect: [
    { value: "new", label: "Не проверен", tone: "gray" },
    { value: "researched", label: "Исследован", tone: "blue" },
    { value: "contacted", label: "Контакт", tone: "blue" },
    { value: "talked", label: "Разговор", tone: "yellow" },
    { value: "pilot", label: "Пилот", tone: "green" },
    { value: "not_fit", label: "Не подходит", tone: "red" },
  ],
  product: [
    { value: "idea", label: "Идея", tone: "gray" },
    { value: "test", label: "Тестируем", tone: "blue" },
    { value: "selling", label: "Продаём", tone: "green" },
    { value: "dropped", label: "Отказались", tone: "red" },
  ],
  metric: [
    { value: "active", label: "Отслеживаем", tone: "blue" },
    { value: "achieved", label: "Цель достигнута", tone: "green" },
    { value: "paused", label: "На паузе", tone: "gray" },
  ],
  channel: [
    { value: "idea", label: "Идея", tone: "gray" },
    { value: "testing", label: "Тестируем", tone: "blue" },
    { value: "works", label: "Работает", tone: "green" },
    { value: "failed", label: "Не работает", tone: "red" },
  ],
  journey: [{ value: "stage", label: "Этап", tone: "gray" }],
};

export const statusOf = (kind: ItemKind, value: string) =>
  STATUS[kind].find((o) => o.value === value) ?? STATUS[kind][0];

export const HYP_TYPES = [
  { value: "problem", label: "Проблема" },
  { value: "icp", label: "Аудитория" },
  { value: "price", label: "Цена" },
  { value: "channel", label: "Канал" },
  { value: "solution", label: "Решение" },
];
export const PRIORITIES = [
  { value: "high", label: "Высокий" },
  { value: "medium", label: "Средний" },
  { value: "low", label: "Низкий" },
];
export const IMPACTS = [
  { value: "high", label: "Высокое влияние" },
  { value: "medium", label: "Среднее влияние" },
  { value: "low", label: "Низкое влияние" },
];

export const KIND_LABEL: Record<ItemKind, string> = {
  problem: "Проблема",
  icp: "ICP",
  hypothesis: "Гипотеза",
  risk: "Риск / вопрос",
  decision: "Решение",
  competitor: "Конкурент",
  prospect: "Потенциальный клиент",
  product: "Продукт",
  metric: "Метрика",
  channel: "Канал",
  journey: "Этап пути клиента",
};

export const DEFAULT_STATUS: Record<ItemKind, string> = {
  problem: "assumption",
  icp: "unverified",
  hypothesis: "todo",
  risk: "open",
  decision: "active",
  competitor: "shallow",
  prospect: "new",
  product: "idea",
  metric: "active",
  channel: "idea",
  journey: "stage",
};

// ---------- разделы и свежесть ----------
export type Tab =
  | "overview"
  | "foundation"
  | "hypotheses"
  | "market"
  | "gtm"
  | "economics"
  | "metrics"
  | "risks";
export type SectionId =
  | "mission"
  | "positioning"
  | "thesis"
  | "market"
  | "plan"
  | "market_size"
  | "gtm"
  | ItemKind;

export const SECTIONS: { id: SectionId; label: string; tab: Tab }[] = [
  { id: "mission", label: "Миссия", tab: "foundation" },
  { id: "thesis", label: "Тезис продукта", tab: "foundation" },
  { id: "problem", label: "Проблемы", tab: "foundation" },
  { id: "icp", label: "ICP / целевые аудитории", tab: "foundation" },
  { id: "hypothesis", label: "Гипотезы", tab: "hypotheses" },
  { id: "competitor", label: "Конкуренты", tab: "market" },
  { id: "prospect", label: "10 потенциальных клиентов", tab: "market" },
  { id: "market_size", label: "Размер рынка", tab: "market" },
  { id: "market", label: "Выводы из анализа рынка", tab: "market" },
  { id: "journey", label: "Путь клиента", tab: "gtm" },
  { id: "channel", label: "Каналы привлечения", tab: "gtm" },
  { id: "gtm", label: "Первые 100 клиентов и запуск", tab: "gtm" },
  { id: "product", label: "Продукты и юнит-экономика", tab: "economics" },
  { id: "plan", label: "Финансовый план", tab: "economics" },
  { id: "metric", label: "Метрики успеха", tab: "metrics" },
  { id: "risk", label: "Риски и открытые вопросы", tab: "risks" },
  { id: "decision", label: "Принятые решения", tab: "risks" },
];

export const STALE_DAYS = 14;

const daysSince = (iso?: string | null) => {
  if (!iso) return Infinity;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
};

/** Последнее изменение или подтверждение «актуально» по разделу. null — раздел пуст. */
export function sectionTouched(
  sec: SectionId,
  profile: ProductProfile,
  items: ProfileItem[],
): string | null {
  const dates: string[] = [];
  if (
    sec === "mission" ||
    sec === "positioning" ||
    sec === "thesis" ||
    sec === "market" ||
    sec === "plan" ||
    sec === "market_size" ||
    sec === "gtm"
  ) {
    if (profile.updated[sec]) dates.push(profile.updated[sec]);
  } else {
    items
      .filter((i) => i.kind === sec)
      .forEach((i) => dates.push(i.updated_at));
  }
  if (profile.reviewed[sec]) dates.push(profile.reviewed[sec]);
  if (!dates.length) return null;
  return dates.sort().at(-1)!;
}

export function isFilled(
  sec: SectionId,
  profile: ProductProfile,
  items: ProfileItem[],
) {
  if (sec === "mission") return !!profile.mission.trim();
  if (sec === "positioning") return positioningFilled(profile.positioning) >= 3;
  if (sec === "thesis") return !!profile.thesis.main?.trim();
  if (sec === "market") return !!profile.market_notes?.trim();
  if (sec === "plan") return (profile.economics?.base_sales ?? 0) > 0;
  if (sec === "market_size")
    return ["tam", "sam", "som"].some(
      (k) => (profile.market_size?.[k as "tam"]?.value ?? 0) > 0,
    );
  if (sec === "gtm") {
    const g = profile.gtm ?? {};
    return !!(g.first100?.trim() || g.launch_plan?.trim());
  }
  return items.some((i) => i.kind === sec);
}

export type Freshness = {
  kind: "empty" | "fresh" | "review" | "stale";
  days: number;
};

export function freshness(
  sec: SectionId,
  profile: ProductProfile,
  items: ProfileItem[],
): Freshness {
  if (!isFilled(sec, profile, items)) return { kind: "empty", days: Infinity };
  const d = daysSince(sectionTouched(sec, profile, items));
  if (d <= 3) return { kind: "fresh", days: d };
  if (d <= STALE_DAYS) return { kind: "review", days: d };
  return { kind: "stale", days: d };
}

export function freshnessLabel(f: Freshness) {
  if (f.kind === "empty") return "не заполнено";
  if (!Number.isFinite(f.days)) return "давно не обновлялось";
  if (f.days === 0) return "обновлено сегодня";
  if (f.days === 1) return "вчера";
  return `${f.days} дн. назад`;
}

export function positioningFilled(p: Positioning) {
  return [
    p.icp_id,
    p.problem_id,
    p.alternatives,
    p.category,
    p.value,
    p.difference,
  ].filter((v) => v && String(v).trim()).length;
}

/**
 * Готовность Discovery: насколько уменьшилась неопределённость.
 * Основа 20% · проблемы 15% · ICP 25% · гипотезы 40%. Свежесть не влияет.
 */
export function readiness(profile: ProductProfile, items: ProfileItem[]) {
  const share = (kind: ItemKind, done: string[]) => {
    const list = items.filter((i) => i.kind === kind);
    return list.length
      ? list.filter((i) => done.includes(i.status)).length / list.length
      : 0;
  };
  const foundation =
    ((profile.mission.trim() ? 1 : 0) +
      (buildPositioning(profile, items, "").some((s) => s.complete) ? 1 : 0) +
      (profile.thesis.main?.trim() ? 1 : 0)) /
    3;
  const problems = share("problem", ["validated", "refuted"]);
  const icps = share("icp", ["validated", "rejected"]);
  const hyps = share("hypothesis", ["confirmed", "refuted"]);
  return Math.round(
    (foundation * 0.2 + problems * 0.15 + icps * 0.25 + hyps * 0.4) * 100,
  );
}

// ---------- позиционирование: собирается из заполненных разделов ----------

/** Куда вести, если часть фразы не заполнена. */
export type PosTarget = { tab: Tab; sec: string };
export type PosPart = {
  key: string;
  text: string | null;
  placeholder: string;
  target: PosTarget;
};
export type PosStatement = {
  icp: ProfileItem | null;
  parts: PosPart[];
  complete: boolean;
  text: string;
};

const PROBLEM_RANK: Record<string, number> = {
  validated: 0,
  signals: 1,
  assumption: 2,
};

/** Первое предложение, без ведущего «Мы». */
export function firstSentence(t?: string) {
  const s =
    (t ?? "")
      .trim()
      .split(/(?<=[.!?])\s+|\n/)[0]
      ?.trim() ?? "";
  return s.replace(/^мы\s+/i, "").replace(/[.!?]+$/, "");
}

const joinRu = (xs: string[]) =>
  xs.length <= 1
    ? (xs[0] ?? "")
    : `${xs.slice(0, -1).join(", ")} и ${xs[xs.length - 1]}`;

/**
 * Фраза позиционирования для каждого ICP (кроме «Не подходит»).
 * Проблемы и конкуренты без привязки к ICP считаются общими для всех.
 */
export function buildPositioning(
  profile: ProductProfile,
  items: ProfileItem[],
  productName: string,
): PosStatement[] {
  const icps = items
    .filter((i) => i.kind === "icp" && i.status !== "rejected")
    .sort((a, b) => a.position - b.position);
  const t = profile.thesis ?? {};
  const forIcp = (icp: ProfileItem | null): PosStatement => {
    const fits = (i: ProfileItem) =>
      !i.data.icp_id || (icp && i.data.icp_id === icp.id);
    const problems = items
      .filter(
        (i) =>
          i.kind === "problem" &&
          i.status !== "refuted" &&
          i.title.trim() &&
          fits(i),
      )
      .sort(
        (a, b) => (PROBLEM_RANK[a.status] ?? 3) - (PROBLEM_RANK[b.status] ?? 3),
      )
      .slice(0, 2)
      .map((i) => i.title.trim());
    const alternatives = items
      .filter((i) => i.kind === "competitor" && i.title.trim() && fits(i))
      .sort((a, b) => a.position - b.position)
      .slice(0, 3)
      .map((i) => i.title.trim());
    const clean = (v?: string) => (v && v.trim() ? v.trim() : null);
    const parts: PosPart[] = [
      {
        key: "icp",
        text: clean(icp?.title),
        placeholder: "ICP",
        target: { tab: "foundation", sec: "icp" },
      },
      {
        key: "problem",
        text: problems.length ? joinRu(problems) : null,
        placeholder: "проблема",
        target: { tab: "foundation", sec: "problem" },
      },
      {
        key: "category",
        text: clean(t.category),
        placeholder: "категория",
        target: { tab: "foundation", sec: "thesis:category" },
      },
      {
        key: "value",
        text: clean(t.value),
        placeholder: "ключевая ценность",
        target: { tab: "foundation", sec: "thesis:value" },
      },
      {
        key: "alternatives",
        text: alternatives.length ? joinRu(alternatives) : null,
        placeholder: "альтернативы",
        target: { tab: "market", sec: "competitor" },
      },
      {
        key: "difference",
        text: clean(firstSentence(t.advantage)),
        placeholder: "главное отличие",
        target: { tab: "foundation", sec: "thesis:advantage" },
      },
    ];
    const v = (k: string) => {
      const p = parts.find((x) => x.key === k)!;
      return p.text ?? `[${p.placeholder}]`;
    };
    return {
      icp,
      parts,
      complete: parts.every((p) => p.text),
      text: `Для ${v("icp")}, у которых ${v("problem")}, ${productName} — ${v("category")}: ${v("value")}. В отличие от ${v("alternatives")}, мы ${v("difference")}.`,
    };
  };
  return icps.length ? icps.map(forIcp) : [forIcp(null)];
}

export const COMPETITOR_TYPES = [
  { value: "direct", label: "Прямой" },
  { value: "indirect", label: "Косвенный" },
  { value: "alternative", label: "Альтернатива" },
];

/** Сколько потенциальных клиентов хотим разобрать. */
export const PROSPECT_TARGET = 10;
/** Статусы, после которых клиент считается «исследованным». */
export const PROSPECT_RESEARCHED = [
  "researched",
  "contacted",
  "talked",
  "pilot",
  "not_fit",
];

export type ProfileSection =
  | "mission"
  | "positioning"
  | "thesis"
  | "market"
  | "plan"
  | "market_size"
  | "gtm";

/** Задача с доски, привязанная к гипотезе. */
export type LinkedTask = {
  id: string;
  name: string;
  status: string;
  phase_id: string;
  hypothesis_id: string | null;
};

/** Главная метрика (North Star) — одна на проект. */
export const northStar = (items: ProfileItem[]) =>
  items.find((i) => i.kind === "metric" && i.data.level === "north") ?? null;

/** Прогресс метрики к цели, 0–100 (учитывает «чем меньше, тем лучше»). */
export function metricProgress(d: Record<string, unknown>) {
  const cur = Number(d.current);
  const target = Number(d.target);
  const base = Number(d.baseline ?? 0);
  if (!Number.isFinite(cur) || !Number.isFinite(target) || target === base)
    return null;
  const p = ((cur - base) / (target - base)) * 100;
  return Math.max(0, Math.min(100, Math.round(p)));
}
