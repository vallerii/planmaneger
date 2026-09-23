import type { Phase, SizeDays, Task } from "./types";

export function parseDate(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function toISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayISO() {
  return toISODate(new Date());
}

const ruFmt = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});
export function dateRu(d: Date) {
  return ruFmt.format(d).replace(" г.", "");
}

export function nextWork(date: Date) {
  const d = new Date(date);
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
  return d;
}

export function addWorkdays(start: Date, n: number) {
  let d = nextWork(new Date(start));
  const count = Math.max(1, Math.ceil(n));
  for (let i = 1; i < count; i++) {
    d.setDate(d.getDate() + 1);
    d = nextWork(d);
  }
  return d;
}

export function fmtDays(n: number) {
  const v = Math.round(Math.max(0, n) * 10) / 10;
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
}

export const sizeDays = (t: Task, sd: SizeDays) => Number(sd[t.size]) || 0;
export const remainingTaskDays = (t: Task, sd: SizeDays) =>
  sizeDays(t, sd) * (1 - (t.progress || 0) / 100);

export function phaseStats(tasks: Task[], sd: SizeDays) {
  let total = 0,
    done = 0,
    remaining = 0;
  for (const t of tasks) {
    const d = sizeDays(t, sd);
    total += d;
    done += (d * (t.progress || 0)) / 100;
    remaining += remainingTaskDays(t, sd);
  }
  return {
    total,
    remaining,
    progress: total ? Math.round((done / total) * 100) : 0,
    discuss: tasks.filter((t) => t.needs_discussion).length,
  };
}

/** Даты начала/конца для каждой фазы, по порядку, с 2-дневным буфером между фазами (как в прототипе). */
export function buildSchedule(
  startDate: string,
  phases: Phase[],
  tasksByPhase: Record<string, Task[]>,
  sd: SizeDays,
) {
  let cursor = nextWork(parseDate(startDate));
  const perPhase: Record<string, { begin: Date; end: Date }> = {};
  let total = 0,
    done = 0,
    remaining = 0,
    count = 0;

  for (const p of phases) {
    const tasks = tasksByPhase[p.id] ?? [];
    const st = phaseStats(tasks, sd);
    const begin = new Date(cursor);
    const end =
      st.remaining > 0 ? addWorkdays(begin, st.remaining) : new Date(begin);
    perPhase[p.id] = { begin, end };
    if (st.remaining > 0) cursor = addWorkdays(end, 2);
    total += st.total;
    remaining += st.remaining;
    done += st.total - st.remaining;
    count += tasks.length;
  }

  return {
    perPhase,
    total,
    remaining,
    count,
    progress: total ? Math.round((done / total) * 100) : 0,
    finish: remaining ? addWorkdays(parseDate(startDate), remaining) : null,
  };
}

export function plainFromHtml(html: string) {
  return (html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

export function initials(name?: string | null) {
  return (
    String(name || "?")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((x) => x[0]?.toUpperCase() || "")
      .join("") || "?"
  );
}

/** Рабочие дни (пн–пт) от сегодня до дедлайна включительно. */
export function workdaysUntil(deadline: string, from: Date = new Date()) {
  const end = parseDate(deadline);
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  let n = 0;
  while (d <= end) {
    if (d.getDay() !== 0 && d.getDay() !== 6) n++;
    d.setDate(d.getDate() + 1);
  }
  return n;
}

export type DeadlineStatus =
  | { kind: "done" }
  | { kind: "overdue"; need: number }
  | { kind: "late"; need: number; avail: number }
  | { kind: "tight"; need: number; avail: number }
  | { kind: "ok"; slack: number };

/** Сравнение оставшейся работы с рабочими днями до дедлайна. null — дедлайна нет. */
export function deadlineStatus(t: Task, sd: SizeDays): DeadlineStatus | null {
  if (!t.deadline) return null;
  if ((t.progress || 0) >= 100) return { kind: "done" };
  const need = remainingTaskDays(t, sd);
  if (t.deadline < todayISO()) return { kind: "overdue", need };
  const avail = workdaysUntil(t.deadline);
  const slack = avail - need;
  if (slack < 0) return { kind: "late", need, avail };
  if (slack < 1) return { kind: "tight", need, avail };
  return { kind: "ok", slack };
}

export function plural(n: number, one: string, few: string, many: string) {
  const a = Math.abs(n) % 100,
    b = a % 10;
  if (!Number.isInteger(n)) return few;
  if (b === 1 && a !== 11) return one;
  if (b >= 2 && b <= 4 && (a < 12 || a > 14)) return few;
  return many;
}

export const workdaysLabel = (n: number) =>
  `${fmtDays(n)} раб. ${plural(n, "день", "дня", "дней")}`;
