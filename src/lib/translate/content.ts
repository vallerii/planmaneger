// AI-перевод контента проекта (миграция 0012). Общий код для сервера и браузера.
//
// Ключи перевода — «адрес» текста в проекте:
//   project.name · phase:<id>.name · task:<id>.name · task:<id>.description
//   profile.<поле>[.<вложенное>] · item:<id>.title · item:<id>.data.<поле>[.<id>.text]
//   comment:<id>.body
// В базе: { key: { h: хеш русского оригинала, t: перевод } }.
// Если оригинал поменяли после перевода (хеш не совпал) — показываем русский оригинал.
import { hasTranslation, type Lang, makeI18n } from "@/i18n/core";

export type TrEntry = { h: string; t: string };
export type TrMap = Record<string, TrEntry>;
export const TR_LANGS = ["en", "de"] as const;
export type TrLang = (typeof TR_LANGS)[number];

export const CYRILLIC = /[А-Яа-яЁё]/;

/** Короткий синхронный хеш (cyrb53) — одинаковый на сервере и в браузере. */
export function hashText(str: string) {
  let h1 = 0xdeadbeef,
    h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

// ---------------------------------------------------------------
// Какие поля переводим
// ---------------------------------------------------------------

/** Текстовые поля профиля продукта (product_profiles). */
export const PROFILE_FIELDS = [
  "mission",
  "vision",
  "market_notes",
  "thesis",
  "mvp",
  "gtm",
  "positioning",
  "market_size",
] as const;

/** Поля, которые не переводим никогда: ссылки, контакты, имена, даты. */
const SKIP_KEYS = new Set([
  "id",
  "url",
  "contact",
  "people",
  "email",
  "date",
  "deadline",
  "measured_at",
  "launch_date",
]);

/**
 * Обойти все строки внутри значения (объекты, массивы) и заменить их через fn.
 * Путь элемента массива — его id, если есть, иначе индекс.
 */
export function mapStrings<T>(
  value: T,
  path: string,
  fn: (path: string, s: string) => string,
): T {
  if (typeof value === "string") return fn(path, value) as T;
  if (Array.isArray(value))
    return value.map((v, i) => {
      const id =
        v && typeof v === "object" && "id" in v && typeof v.id === "string"
          ? v.id
          : String(i);
      return mapStrings(v, `${path}.${id}`, fn);
    }) as T;
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value))
      out[k] = SKIP_KEYS.has(k) ? v : mapStrings(v, `${path}.${k}`, fn);
    return out as T;
  }
  return value;
}

// ---------------------------------------------------------------
// Статичный словарь: шаблонные тексты уже переведены — AI не нужен
// ---------------------------------------------------------------

const staticI18n = { en: makeI18n("en"), de: makeI18n("de") };

/** Текст целиком переводится словарём интерфейса (названия и описания из шаблона). */
export function isStaticText(s: string) {
  return TR_LANGS.every((l) => {
    if (hasTranslation(l, s.trim())) return true;
    return s.includes("<") && !CYRILLIC.test(staticI18n[l].html(s));
  });
}

/** Нужно ли отправлять текст на AI-перевод. */
export const needsAi = (s: string | null | undefined): s is string =>
  !!s && !!s.trim() && CYRILLIC.test(s) && !isStaticText(s);

// ---------------------------------------------------------------
// Показ: подставить перевод, если он актуален
// ---------------------------------------------------------------

type Task = { id: string; name: string; description?: string };
type Phase = { id: string; name: string };
type Item = { id: string; title: string; data: Record<string, unknown> };
type Comment = { id: string; body: string };

export function makeContentTr(lang: Lang, map: TrMap | null) {
  const active = lang !== "ru";
  const i18n = makeI18n(lang);
  /** Перевод строки по ключу: AI (если актуален) → словарь шаблона → оригинал. */
  const text = (key: string, original: string | null | undefined): string => {
    const s = original ?? "";
    if (!active || !s.trim()) return s;
    const e = map?.[key];
    if (e && e.h === hashText(s)) return e.t;
    if (hasTranslation(lang, s.trim())) return i18n.t(s.trim());
    if (s.includes("<")) return i18n.html(s);
    return s;
  };
  const obj = <T>(value: T, prefix: string) =>
    active ? mapStrings(value, prefix, text) : value;
  return {
    /** EN / DE: показываем перевод, редактирование выключено. */
    active,
    lang,
    hasAny: !!map && Object.keys(map).length > 0,
    text,
    projectName: (name: string) => text("project.name", name),
    task: <T extends Task>(t: T): T =>
      active
        ? {
            ...t,
            name: text(`task:${t.id}.name`, t.name),
            ...(t.description !== undefined
              ? { description: text(`task:${t.id}.description`, t.description) }
              : {}),
          }
        : t,
    phase: <T extends Phase>(p: T): T =>
      active ? { ...p, name: text(`phase:${p.id}.name`, p.name) } : p,
    item: <T extends Item>(i: T): T =>
      active
        ? {
            ...i,
            title: text(`item:${i.id}.title`, i.title),
            data: obj(i.data, `item:${i.id}.data`),
          }
        : i,
    profile: <T extends object>(p: T): T => {
      if (!active) return p;
      const out = { ...p } as Record<string, unknown>;
      for (const f of PROFILE_FIELDS)
        if (f in out) out[f] = obj(out[f], `profile.${f}`);
      return out as T;
    },
    comment: <T extends Comment>(c: T): T =>
      active ? { ...c, body: text(`comment:${c.id}.body`, c.body) } : c,
  };
}

export type ContentTr = ReturnType<typeof makeContentTr>;
