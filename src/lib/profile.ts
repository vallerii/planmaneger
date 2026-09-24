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
  | "product";

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

export type Thesis = { main?: string; why_now?: string; advantage?: string };

export type ProductProfile = {
  project_id: string;
  mission: string;
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
};

// ---------- разделы и свежесть ----------
export type Tab =
  "overview" | "foundation" | "hypotheses" | "market" | "economics" | "risks";
export type SectionId =
  "mission" | "positioning" | "thesis" | "market" | "plan" | ItemKind;

export const SECTIONS: { id: SectionId; label: string; tab: Tab }[] = [
  { id: "mission", label: "Миссия", tab: "foundation" },
  { id: "thesis", label: "Тезис продукта", tab: "foundation" },
  { id: "problem", label: "Проблемы", tab: "foundation" },
  { id: "icp", label: "ICP / целевые аудитории", tab: "foundation" },
  { id: "positioning", label: "Позиционирование", tab: "foundation" },
  { id: "hypothesis", label: "Гипотезы", tab: "hypotheses" },
  { id: "competitor", label: "Конкуренты", tab: "market" },
  { id: "prospect", label: "10 потенциальных клиентов", tab: "market" },
  { id: "market", label: "Выводы из анализа рынка", tab: "market" },
  { id: "product", label: "Продукты и юнит-экономика", tab: "economics" },
  { id: "plan", label: "Финансовый план", tab: "economics" },
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
    sec === "plan"
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
      Math.min(1, positioningFilled(profile.positioning) / 6) +
      (profile.thesis.main?.trim() ? 1 : 0)) /
    3;
  const problems = share("problem", ["validated", "refuted"]);
  const icps = share("icp", ["validated", "rejected"]);
  const hyps = share("hypothesis", ["confirmed", "refuted"]);
  return Math.round(
    (foundation * 0.2 + problems * 0.15 + icps * 0.25 + hyps * 0.4) * 100,
  );
}

export function positioningStatement(
  p: Positioning,
  items: ProfileItem[],
  productName: string,
) {
  const icp = items.find((i) => i.id === p.icp_id)?.title;
  const problem = items.find((i) => i.id === p.problem_id)?.title;
  const part = (v: string | undefined, ph: string) =>
    v && v.trim() ? v.trim() : `[${ph}]`;
  return (
    `Для ${part(icp, "ICP")}, у которых ${part(problem, "проблема")}, ${productName} — это ${part(p.category, "категория")}, ` +
    `который ${part(p.value, "ключевая ценность")}. В отличие от ${part(p.alternatives, "альтернативы")}, мы ${part(p.difference, "главное отличие")}.`
  );
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
  "mission" | "positioning" | "thesis" | "market" | "plan";

/** Задача с доски, привязанная к гипотезе. */
export type LinkedTask = {
  id: string;
  name: string;
  status: string;
  phase_id: string;
  hypothesis_id: string | null;
};
